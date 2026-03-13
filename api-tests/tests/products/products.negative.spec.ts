// tests/products/products.negative.spec.ts
import { test, expect } from '../../fixtures/auth_context';  // для тестов с токеном
import { faker } from '@faker-js/faker';

test.describe('Негативные тесты для продуктов', () => {

    test('GET /products/{id} с несуществующим ID - ожидаем 404', async ({ request }) => {
        const invalidId = "000000000000000000000000";  // несуществующий MongoDB ID

        const response = await request.get(`/api/v1/ecommerce/products/${invalidId}`);

        expect(response.status()).toBe(404);
        console.log(`✅ 404 получен для несуществующего ID: ${invalidId}`);
    });

    test('POST /products без авторизации - ожидаем 401', async ({ request }) => {
        const productData = {
            name: faker.commerce.productName(),
            price: faker.commerce.price()
        };

        const response = await request.post('/api/v1/ecommerce/products', {
            data: productData
            // ❌ Без Authorization header
        });

        expect(response.status()).toBe(401);
        console.log('✅ 401 получен для запроса без токена');
    });

    test('POST /products с неверным Content-Type - ожидаем 400', async ({ request, authToken }) => {
        // 400 Bad Request — отправляем multipart, но говорим что это JSON
        // (намеренный конфликт заголовков для получения 400)

        const invalidData = {
            name: faker.commerce.productName(),
            price: 40
        };

        const response = await request.post('/api/v1/ecommerce/products', {
            multipart: invalidData,
            headers: { Authorization: `Bearer ${authToken}`,
                        "Content-Type": 'application/json'}
        });

        expect(response.status()).toBe(400);
        console.log('✅ 400 получен для неверной схемы данных');
    });

    test('POST /products с неверной price - ожидаем 422', async ({ request, authToken }) => {
        const formData = new FormData();
        formData.append('category', '649865ab297b287175aec1d7');  // ✅ корректно
        formData.append('description', 'New description number 2'); // ✅ корректно
        formData.append('name', 'Kids product');  // ✅ корректно
        formData.append('price', 'сто');  // ❌ не число
        formData.append('stock', '30');  // ✅ корректно

        const response = await request.post('/api/v1/ecommerce/products', {
            multipart: formData,
            headers: { Authorization: `Bearer ${authToken}` }
        });

        expect(response.status()).toBe(422);
        const errorBody = await response.json();

        // Проверяем, что в errors только одна ошибка о price
        expect(errorBody.errors.length).toBe(1);
        expect(errorBody.errors[0].price).toBe('Price must be a number');

        console.log('✅ 422 получен только для поля price');
    });

});