import { test, expect } from '../../fixtures/auth_context';
import {generateCategory, generateNewPrice, generateProduct} from '../../utils/data_generator';
import { faker } from '@faker-js/faker';
import { createImageBlob } from '../../utils/image_helper';

test.describe.serial('CRUD операции', () => {
    let categoryId: string;
    let productId: string;
    let authToken: string;
    let productName: string;
    let originalPrice: number;
    let newPrice: number;

    // ✅ Подготовка данных перед всеми тестами
    test.beforeAll(async ({ request }) => {
        // 1. Создаем нового пользователя (админа) для всех CRUD операций
        const user = {
            email: faker.internet.email(),
            password: "test@123",
            role: "ADMIN",
            username: faker.internet.userName().toLowerCase()
        };

        await request.post('/api/v1/users/register', { data: user });
        const loginRes = await request.post('/api/v1/users/login', {
            data: { email: user.email, password: user.password }
        });
        authToken = (await loginRes.json()).data.accessToken;

        // 2. Создаем категорию (нужна для создания продукта)
        const categoryData = generateCategory();
        const categoryResponse = await request.post('/api/v1/ecommerce/categories', {
            data: categoryData,
            headers: { Authorization: `Bearer ${authToken}` },
        });
        expect(categoryResponse.status()).toBe(201);
        categoryId = (await categoryResponse.json()).data._id;

        console.log(`✅ Подготовка: один пользователь и категория ${categoryId}`);
    });

    // 🔵 ТЕСТ 1: CREATE — создание продукта
    test('Создание продукта', async ({ request }) => {
        // 1. Генерируем данные продукта
        const productData = generateProduct(categoryId);

        // 2. Формируем multipart запрос с данными и изображениями
        const formData = new FormData();
        formData.append('name', productData.name);
        formData.append('description', productData.description);
        formData.append('price', productData.price);
        formData.append('stock', productData.stock);
        formData.append('category', productData.category);
        formData.append('mainImage', createImageBlob('main.jpg'), 'main.jpg');
        formData.append('subImages', createImageBlob('sub1.jpeg'), 'sub1.jpeg');
        formData.append('subImages', createImageBlob('sub2.jpg'), 'sub2.jpg');
        formData.append('subImages', createImageBlob('sub3.jpg'), 'sub3.jpg');

        // 3. Отправляем запрос на создание продукта
        const productResponse = await request.post('/api/v1/ecommerce/products', {
            multipart: formData,
            headers: { 'Authorization': `Bearer ${authToken}` },
        });

        // 4. Проверяем успешное создание и сохраняем данные
        expect(productResponse.status()).toBe(201);
        const productBody = await productResponse.json();

        expect(productBody).toHaveProperty('data');
        expect(productBody.data).toHaveProperty('_id');

        productId = productBody.data._id;
        productName = productBody.data.name;
        originalPrice = productBody.data.price;

        console.log(`📁 Создан продукт с ID: ${productId}`);
        console.log(`📦 Название: ${productName}`);
        console.log(`💰 Цена: ${originalPrice}`);
    });

    // 🔵 ТЕСТ 2: READ — проверка чтения продукта по ID
    test('Получение продукта по ID и проверка названия', async ({ request }) => {
        // 1. Запрашиваем созданный продукт
        const response = await request.get(`/api/v1/ecommerce/products/${productId}`)
        expect(response.status()).toBe(200);

        // 2. Сравниваем название с сохраненным при создании
        const productBody = await response.json();
        console.log('🔍 Сравнение названий:');
        console.log(`   Ожидали: ${productName}`);
        console.log(`   Получили: ${productBody.data.name}`);
        expect(productBody.data.name).toBe(productName);
    });

    // 🔵 ТЕСТ 3: UPDATE — обновление цены продукта
    test('Обновление цены у продукта', async ({ request }) => {
        // 1. Генерируем новую цену
        const responseNewPrice = generateNewPrice();

        // 2. Формируем запрос на обновление
        const formData = new FormData();
        formData.append('price', responseNewPrice.price);
        formData.append('category', categoryId);

        const responseUpdate = await request.patch(`/api/v1/ecommerce/products/${productId}`,{
            multipart: formData,
            headers: { Authorization: `Bearer ${authToken}` },
        })

        expect(responseUpdate.status()).toBe(200);
        const productBody = await responseUpdate.json();
        newPrice = productBody.data.price;
        console.log(`🔄 Новая цена продукта: ${newPrice}`);

        // 3. Проверяем, что цена действительно обновилась
        const response = await request.get(`/api/v1/ecommerce/products/${productId}`)
        expect(response.status()).toBe(200);
        const productResponse = await response.json();
        expect(productResponse.data.price).toBe(newPrice);
        expect(productResponse.data.price).not.toBe(originalPrice);
    });

    // 🔵 ТЕСТ 4: DELETE — удаление продукта
    test('Удаление продукта и проверка статуса 200/204', async ({ request }) => {
        // 1. Отправляем запрос на удаление
        const response = await request.delete(`/api/v1/ecommerce/products/${productId}`,{
            headers:{ Authorization: `Bearer ${authToken}` },
        });

        // 2. Проверяем, что статус соответствует ожидаемому (200 или 204)
        expect([200, 204]).toContain(response.status());

        console.log(`✅ Продукт ${productId} удален, статус: ${response.status()}`);
    });
});