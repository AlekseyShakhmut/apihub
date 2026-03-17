import { test, expect } from '../../fixtures/auth_context';
import {generateCategory, generateNewPrice, generateProduct} from '../../utils/data_generator';
import { faker } from '@faker-js/faker';
import { createImageBlob } from '../../utils/image_helper';
import {createProductFormData} from '../../utils/form_data_helper';
import * as dotenv from 'dotenv';
dotenv.config({debug: false, quiet: true});

test.describe.serial('CRUD операции', () => {
    let categoryId: string;
    let productId: string;
    let authToken: string;
    let productName: string;
    let originalPrice: number;
    let newPrice: number;

    const ADMIN_USER_PASSWORD = process.env.ADMIN_USER_PASSWORD;
    if (!ADMIN_USER_PASSWORD) {
        throw new Error('ADMIN_USER_PASSWORD не задан в .env файле');
    }

    // Подготовка данных перед всеми тестами
    test.beforeAll(async ({ request }) => {
        // 1. Создаем нового пользователя (админа) для всех CRUD операций
        const user = {
            email: faker.internet.email(),
            password: ADMIN_USER_PASSWORD,
            role: "ADMIN",
            username: faker.internet.userName().toLowerCase()
        };

        await request.post('users/register', { data: user });
        const loginRes = await request.post('users/login', {
            data: { email: user.email, password: user.password }
        });
        authToken = (await loginRes.json()).data.accessToken;

        // 2. Создаем категорию (нужна для создания продукта)
        const categoryData = generateCategory();
        const categoryResponse = await request.post('ecommerce/categories', {
            data: categoryData,
            headers: { Authorization: `Bearer ${authToken}` },
        });
        expect(categoryResponse.status()).toBe(201);
        categoryId = (await categoryResponse.json()).data._id;

    });

    // CREATE — создание продукта
    test('Создание продукта', async ({ request }) => {
        // 1. Генерируем данные продукта
        const productData = generateProduct(categoryId);

        // 2. Формируем multipart запрос с данными и изображениями
        const formData = createProductFormData({
            ...productData,
            mainImage: 'main.jpg',
            subImages: ['sub1.jpeg', 'sub2.jpg', 'sub3.jpg']
        });

        // 3. Отправляем запрос на создание продукта
        const productResponse = await request.post('ecommerce/products', {
            multipart: formData,
            headers: { 'Authorization': `Bearer ${authToken}` },
        });

        // 4. Проверяем успешное создание и сохраняем данные
        expect(productResponse.status()).toBe(201);
        const productBody = await productResponse.json();

        expect(productBody).toHaveProperty('data');
        expect(productBody.data).toHaveProperty('_id');

        expect(productBody.data._id).toBeDefined();
        expect(productBody.data._id).not.toBeNull();

        productId = productBody.data._id;
        productName = productBody.data.name;
        originalPrice = productBody.data.price;
    });

    // READ — проверка чтения продукта по ID
    test('Получение продукта по ID и проверка названия', async ({ request }) => {
        // 1. Запрашиваем созданный продукт
        const response = await request.get(`ecommerce/products/${productId}`)
        expect(response.status()).toBe(200);

        // 2. Сравниваем название с сохраненным при создании
        const productBody = await response.json();
        expect(productBody.data.name).toBe(productName);
    });

    // UPDATE — обновление цены продукта
    test('Обновление цены у продукта', async ({ request }) => {
        // 1. Генерируем новую цену
        const responseNewPrice = generateNewPrice();

        // 2. Формируем запрос на обновление
        const formData = new FormData();
        formData.append('price', responseNewPrice.price);
        formData.append('category', categoryId);

        const responseUpdate = await request.patch(`ecommerce/products/${productId}`,{
            multipart: formData,
            headers: { Authorization: `Bearer ${authToken}` },
        })

        expect(responseUpdate.status()).toBe(200);
        const productBody = await responseUpdate.json();
        newPrice = productBody.data.price;

        // 3. Проверяем, что цена действительно обновилась
        const response = await request.get(`ecommerce/products/${productId}`)
        expect(response.status()).toBe(200);
        const productResponse = await response.json();
        expect(productResponse.data.price).toBe(newPrice);
        expect(productResponse.data.price).not.toBe(originalPrice);
    });

    // DELETE — удаление продукта
    test('Удаление продукта и проверка статуса 200/204', async ({ request }) => {
        // 1. Отправляем запрос на удаление
        const response = await request.delete(`ecommerce/products/${productId}`,{
            headers:{ Authorization: `Bearer ${authToken}` },
        });

        // 2. Проверяем, что статус соответствует ожидаемому (200 или 204)
        expect([200, 204]).toContain(response.status());
    });
    test('Проверка, что продукт успешно удален', async ({ request }) => {
        const response = await request.get(`ecommerce/products/${productId}`,{
            headers: { Authorization: `Bearer ${authToken}` },
        })
        expect (response.status()).toBe(404);
    })
});