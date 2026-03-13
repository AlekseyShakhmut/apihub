import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { generateCategory, generateProduct } from '../../utils/data_generator';
import { createImageBlob } from '../../utils/image_helper';

test.describe('Параметризованные тесты для цены продукта', () => {
    let categoryId: string;
    let authToken: string;

    // ✅ Создаем пользователя и категорию ОДИН раз для всех тестов
    test.beforeAll(async ({ request }) => {
        // 1. Регистрируем нового пользователя
        const user = {
            email: faker.internet.email().toLowerCase(),
            password: "test@123",
            role: "ADMIN",
            username: faker.internet.userName().toLowerCase()
        };

        const registerRes = await request.post('/api/v1/users/register', {
            data: user
        });
        expect(registerRes.status()).toBe(201);

        // 2. Логинимся и получаем токен
        const loginRes = await request.post('/api/v1/users/login', {
            data: {
                email: user.email,
                password: user.password
            }
        });
        expect(loginRes.status()).toBe(200);
        authToken = (await loginRes.json()).data.accessToken;

        // 3. Создаем категорию
        const categoryData = generateCategory();
        const categoryRes = await request.post('/api/v1/ecommerce/categories', {
            data: categoryData,
            headers: { Authorization: `Bearer ${authToken}` }
        });
        expect(categoryRes.status()).toBe(201);
        categoryId = (await categoryRes.json()).data._id;

        console.log(`✅ Подготовка: пользователь создан, категория ID: ${categoryId}`);
    });

    // Граничные значения цены
    const priceTestCases = [
        { price: 0, expected: 201, description: 'нулевой ценой' },
        { price: -100, expected: 201, description: 'отрицательной ценой' },
        { price: 99999999999999, expected: 201, description: 'очень большой ценой (но валидная)' },
        { price: 99999999999999999999999, expected: 422, description: 'слишком большой ценой (Цена 1e+23)' }
    ];

    priceTestCases.forEach(({ price, expected, description }) => {
        test(`Создание продукта с ${description} (${price})`, async ({ request }) => {
            // Создаем продукт с тестовой ценой
            const productData = generateProduct(categoryId);

            const formData = new FormData();
            formData.append('name', productData.name);
            formData.append('description', productData.description);
            formData.append('price', price.toString());  // ← граничное значение
            formData.append('stock', productData.stock);
            formData.append('category', categoryId);
            formData.append('mainImage', createImageBlob('main.jpg'), 'main.jpg');
            formData.append('subImages', createImageBlob('sub1.jpeg'), 'sub1.jpeg');
            // formData.append('subImages', createImageBlob('sub2.jpg'), 'sub2.jpg');
            // formData.append('subImages', createImageBlob('sub3.jpg'), 'sub3.jpg');

            const response = await request.post('/api/v1/ecommerce/products', {
                multipart: formData,
                headers: { Authorization: `Bearer ${authToken}` }
            });

            expect(response.status()).toBe(expected);
            console.log(`✅ Цена ${price} → статус ${response.status()}`);
        });
    });
});