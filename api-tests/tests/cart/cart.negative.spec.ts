import { test, expect } from '../../fixtures/auth_context';
import {createCategoryAndProduct} from "../../utils/setup_product";
import {deleteProductAndCategory} from "../../utils/delete_product";
import {addItemQuantity} from "../../utils/data_generator";


test.describe('Корзина: негативные сценарии', async () => {
    let categoryId: string;
    let productId: string;

    test.beforeAll(async ({request, authToken}) => {
        const setup = await createCategoryAndProduct (request, authToken);
        categoryId = setup.categoryId;
        productId = setup.productId;
    })
    test.afterAll(async ({request, authToken}) => {
        await deleteProductAndCategory (request, authToken, productId, categoryId)
    })

    const quantityTestCases = [
        { quantity: 0, expected: 422, description: 'равное нулю' },
        { quantity: -1, expected: 422, description: 'отрицательное' },
        { quantity: 9999, expected: 400, description: 'превышающее на складе' }
    ];
    quantityTestCases.forEach(({ quantity, expected, description }) => {
        test(`Добавление в корзину: количество ${quantity} (${description})`, async ({ request, authToken }) => {
            const response = await request.post(`ecommerce/cart/item/${productId}`, {
                data: {quantity: quantity},
                headers: { Authorization: `Bearer ${authToken}` }
            });
            expect(response.status()).toBe(expected);
        });
    });
    test('POST /cart/item/{productId} без авторизации - ожидаем 401', async ({ request }) => {
        const addItem = addItemQuantity();
        const answerItem = await request.post(`ecommerce/cart/item/${productId}`, {
            data: addItem,
        });
        expect(answerItem.status()).toBe(401);
        const body = await answerItem.json();
        expect(body.message).toBe('Unauthorized request');
    });
    test('DELETE /cart/item/{productId} с несуществующим ID - ожидаем 404', async ({ request, authToken }) => {
        const invalidId = "000000000000000000000000";
        const response = await request.delete(`ecommerce/cart/item/${invalidId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        expect(response.status()).toBe(404);
        const cart = await response.json();
        expect(cart.message).toBe('Product does not exist');
    });
    test('DELETE /cart/item/{productId} с невалидным ID - ожидаем 422', async ({ request, authToken }) => {
        const invalidId = "invalid-id";
        const response = await request.delete(`ecommerce/cart/item/${invalidId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        expect(response.status()).toBe(422);
        const cart = await response.json();
        expect(cart.errors[0].productId).toBe('Invalid productId');
    });
    test('DELETE /cart/item/{productId} без авторизации - ожидаем 401', async ({ request }) => {
        const addItem = addItemQuantity();
        const answerItem = await request.delete(`ecommerce/cart/item/${productId}`, {
            data: addItem,
        });
        expect(answerItem.status()).toBe(401);
        const body = await answerItem.json();
        expect(body.message).toBe('Unauthorized request');
    });
    test('DELETE /ecommerce/cart/clear без авторизации - ожидаем 401', async ({ request }) => {
        const answerItem = await request.delete('ecommerce/cart/clear', {
        });
        expect(answerItem.status()).toBe(401);
        const body = await answerItem.json();
        expect(body.message).toBe('Unauthorized request');
    });
    test('GET /ecommerce/cart без авторизации - ожидаем 401', async ({ request }) => {
        const answerItem = await request.get('ecommerce/cart', {
        });
        expect(answerItem.status()).toBe(401);
        const body = await answerItem.json();
        expect(body.message).toBe('Unauthorized request');
    });
})