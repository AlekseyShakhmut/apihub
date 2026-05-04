import { test, expect } from '../../fixtures/auth';
import { faker } from '@faker-js/faker';
import {createBaseProductFormData, createPriceUpdateFormData,} from "../../utils/form_data_helper";

test.describe('Негативные тесты для продуктов', () => {

    const getErrorMessages = (errors: Array<Record<string, string>>) =>
        errors.map((error) => Object.values(error)[0]);

    test('POST /products с пустыми полями - 422', async ({ request, authToken }) => {
        const response = await request.post('ecommerce/products',{
            multipart: {},
            headers: {authorization: `Bearer ${authToken}`},
        })
        expect(response.status()).toBe(422);
        const responseBody = await response.json();
        const errorMessages = getErrorMessages(responseBody.errors);

        expect(responseBody.message).toBe('Received data is not valid')
        expect(responseBody.errors.length).toBe(6);
        expect(errorMessages).toEqual(expect.arrayContaining([
            'Name is required',
            'Description is required',
            'Price is required',
            'Price must be a number',
            'Invalid value',
            'Invalid category'
        ]))
     })

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
        const body = await response.json();
        expect(body.message).toBe('Unauthorized request');
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

    test('POST /products с неверным типом данных для price - ожидаем 422', async ({ request, authToken }) => {
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

    test('GET /products/{id} с несуществующим ID - ожидаем 404', async ({ request }) => {
        const invalidId = "000000000000000000000000";  // несуществующий ID

        const response = await request.get(`ecommerce/products/${invalidId}`);

        expect(response.status()).toBe(404);
    });

    test('GET /products/{id} с невалидным ID - ожидаем 422', async ({ request }) => {
        const invalidId = "0000000000000000000000"; // не хватает двух цифр
        const response = await request.get(`ecommerce/products/${invalidId}`);

        expect(response.status()).toBe(422);

        const body = await response.json();
        expect(body.errors.length).toBe(1);
        expect(body.errors[0].productId).toBe('Invalid productId');
        expect(body.message).toBe('Received data is not valid');
    })
    test('PATCH /products/{productId} с несуществующим ID - ожидаем 404', async ({ request, authToken }) => {
        const invalidProductId = "000000000000000000000000";
        const formData = createPriceUpdateFormData('100','000000000000000000000000')

        const response = await request.patch(`ecommerce/products/${invalidProductId}`, {
            multipart: formData,
            headers: { 'Authorization': `Bearer ${authToken}` },
        })
        expect(response.status()).toBe(404);
        const body = await response.json();
        expect(body.message).toBe('Product does not exist');
    })
    test('PATCH /products/{productId} с невалидным ID - ожидаем 422', async ({ request, authToken }) => {
        const invalidProductId = "00000000000000000000000"; // не хватает одной цифры
        const formData = createPriceUpdateFormData('100','000000000000000000000000')

        const response = await request.patch(`ecommerce/products/${invalidProductId}`, {
            multipart: formData,
            headers: { 'Authorization': `Bearer ${authToken}` },
        })
        expect(response.status()).toBe(422);
        const body = await response.json();
        expect(body.message).toBe('Received data is not valid');
        expect(body.errors.length).toBe(1);
        expect(body.errors[0].productId).toBe('Invalid productId');
    })
    test('PATCH /products/{productId} без авторизации - ожидаем 401', async ({ request }) => {
        const ProductId = "000000000000000000000000";
        const formData = createPriceUpdateFormData('100','000000000000000000000000')

        const response = await request.patch(`ecommerce/products/${ProductId}`, {
            multipart: formData,
            // Без Authorization header
        })
        expect(response.status()).toBe(401);
        const body = await response.json();
        expect(body.message).toBe('Unauthorized request');
    })
    test('PATCH /products/{productId} с неверным типом данных для price - ожидаем 422', async ({ request,authToken }) => {
        const ProductId = "000000000000000000000000";
        const formData = createPriceUpdateFormData('сто','000000000000000000000000')

        const response = await request.patch(`ecommerce/products/${ProductId}`, {
            multipart: formData,
            headers: { 'Authorization': `Bearer ${authToken}` },
        })
        expect(response.status()).toBe(422);
        const body = await response.json();
        expect(body.message).toBe('Received data is not valid');
        expect(body.errors.length).toBe(1);
        expect(body.errors[0].price).toBe('Price must be a number');
    })
    test('DELETE /products/{productId} без авторизации - ожидаем 401', async ({ request }) => {
        const ProductId = "000000000000000000000000";
        const formData = createPriceUpdateFormData('100','000000000000000000000000')

        const response = await request.delete(`ecommerce/products/${ProductId}`, {
            multipart: formData,
            // Без Authorization header
        })
        expect(response.status()).toBe(401);
        const body = await response.json();
        expect(body.message).toBe('Unauthorized request');
    })
    test('DELETE /products/{productId} с несуществующим ID - ожидаем 404', async ({ request, authToken }) => {
        const invalidProductId = "000000000000000000000000";

        const response = await request.delete(`ecommerce/products/${invalidProductId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
        })
        expect(response.status()).toBe(404);
        const body = await response.json();
        expect(body.message).toBe('Product does not exist');
    })
    test('DELETE /products/{productId} с невалидным ID - ожидаем 422', async ({ request, authToken }) => {
        const invalidProductId = "00000000000000000000000"; // не хватает одной цифры

        const response = await request.delete(`ecommerce/products/${invalidProductId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
        })
        expect(response.status()).toBe(422);
        const body = await response.json();
        expect(body.message).toBe('Received data is not valid');
        expect(body.errors.length).toBe(1);
        expect(body.errors[0].productId).toBe('Invalid productId');
    })
});