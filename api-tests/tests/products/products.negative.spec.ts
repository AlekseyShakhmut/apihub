// tests/products/products.negative.spec.ts
import { test, expect } from '../../fixtures/auth_context';  // для тестов с токеном
import { faker } from '@faker-js/faker';
import {createBaseProductFormData, createProductFormData} from "../../utils/form_data_helper";
import {generateCategory, generateProduct} from "../../utils/data_generator";

test.describe('Негативные тесты для продуктов', () => {

    test('POST /products с пустыми полями - 422', async ({ request, authToken }) => {
        const response = await request.post('ecommerce/products',{
            multipart: {},
            headers: {authorization: `Bearer ${authToken}`},
        })
        expect(response.status()).toBe(422);
        const responseBody = await response.json();

        expect(responseBody.message).toBe('Received data is not valid')
        expect(responseBody.errors.length).toBe(6);
        expect(responseBody.errors[0].name).toBe('Name is required')
        expect(responseBody.errors[1].description).toBe('Description is required')
        expect(responseBody.errors[2].price).toBe('Price is required')
        expect(responseBody.errors[3].price).toBe('Price must be a number')
        expect(responseBody.errors[4].category).toBe('Invalid value')
        expect(responseBody.errors[5].category).toBe('Invalid category')
     })

    test('GET /products/{id} с несуществующим ID - ожидаем 404', async ({ request }) => {
        const invalidId = "000000000000000000000000";  // несуществующий ID

        const response = await request.get(`ecommerce/products/${invalidId}`);

        expect(response.status()).toBe(404);
    });

    test('POST /products без авторизации - ожидаем 401', async ({ request }) => {
        const productData = {
            name: faker.commerce.productName(),
            price: faker.commerce.price()
        };

        const response = await request.post('ecommerce/products', {
            multipart: productData
            // Без Authorization header
        });

        expect(response.status()).toBe(401);
    });

    test('POST /products с неверным Content-Type - ожидаем 400', async ({ request, authToken }) => {
        // 400 Bad Request — отправляем multipart, но говорим что это JSON
        // (намеренный конфликт заголовков для получения 400)

        const invalidData = {
            name: faker.commerce.productName(),
            price: 40
        };

        const response = await request.post('ecommerce/products', {
            multipart: invalidData,
            headers: { Authorization: `Bearer ${authToken}`,
                        "Content-Type": 'application/json'}
        });

        expect(response.status()).toBe(400);
    });

    test('POST /products с неверной price - ожидаем 422', async ({ request, authToken }) => {
        const formData = createBaseProductFormData('649865ab297b287175aec1d7')
        formData.append('price', 'сто');


        const response = await request.post('ecommerce/products', {
            multipart: formData,
            headers: { Authorization: `Bearer ${authToken}` }
        });

        expect(response.status()).toBe(422);
        const errorBody = await response.json();

        // Проверяем, что в errors только одна ошибка о price
        expect(errorBody.errors.length).toBe(1);
        expect(errorBody.errors[0].price).toBe('Price must be a number');
    });
});