import { test, expect } from '../../fixtures/auth_context';
import { createCategoryAndProduct, createProduct } from "../../utils/setup_product";
import { deleteProductAndCategory } from "../../utils/delete_product";
import { addItemQuantity } from "../../utils/data_generator";
import { generateValidUser } from "../../utils/user_helper";

test.describe.serial('Корзина CRUD операции', () => {
    let authToken: string;
    let categoryId: string;
    let productId_1: string;
    let productName_1: string;
    let productId_2: string;
    let productName_2: string;
    let itemQuantityProduct1: number;
    let itemQuantityProduct2: number;

    test.beforeAll('Создание категории и двух продуктов', async ({ request }) => {
        const user = generateValidUser();
        await request.post('users/register', { data: user });
        const loginRes = await request.post('users/login', {
            data: { email: user.email, password: user.password }
        });
        authToken = (await loginRes.json()).data.accessToken;

        const setup = await createCategoryAndProduct(request, authToken);
        categoryId = setup.categoryId;
        productId_1 = setup.productId;
        productName_1 = setup.productName;

        const secondProduct = await createProduct(request, authToken, categoryId);
        productId_2 = secondProduct.productId;
        productName_2 = secondProduct.productName;
    });

    test.afterAll('Удаление категории и продуктов', async ({ request }) => {
        await deleteProductAndCategory(request, authToken, [productId_1, productId_2], categoryId);
    });

    test('Добавить первый продукт в корзину', async ({ request }) => {
        const addItem = addItemQuantity();
        const answerItem = await request.post(`ecommerce/cart/item/${productId_1}`, {
            data: addItem,
            headers: { Authorization: `Bearer ${authToken}` }
        });
        expect(answerItem.status()).toBe(200);
        const bodyProduct = await answerItem.json();
        expect(bodyProduct.data.items.length).toBe(1);
        expect(bodyProduct.data.items[0].product.name).toBe(productName_1);
        itemQuantityProduct1 = bodyProduct.data.items[0].quantity;
    });

    test('Добавить второй продукт в корзину', async ({ request }) => {
        const addItem = addItemQuantity();
        const answerItem = await request.post(`ecommerce/cart/item/${productId_2}`, {
            data: addItem,
            headers: { Authorization: `Bearer ${authToken}` }
        });
        expect(answerItem.status()).toBe(200);
        const bodyProduct = await answerItem.json();
        expect(bodyProduct.data.items.length).toBe(2);
        expect(bodyProduct.data.items[1].product.name).toBe(productName_2);
        itemQuantityProduct2 = bodyProduct.data.items[1].quantity;
    });

    test('Проверить содержимое корзины', async ({ request }) => {
        const response = await request.get('ecommerce/cart', {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        expect(response.status()).toBe(200);
        const cart = await response.json();

        expect(cart.data.items.length).toBe(2);
        expect(cart.data.items[0].product.name).toBe(productName_1);
        expect(cart.data.items[0].quantity).toBe(itemQuantityProduct1);
        expect(cart.data.items[1].product.name).toBe(productName_2);
        expect(cart.data.items[1].quantity).toBe(itemQuantityProduct2);
    });
    test('Удалить один из продуктов из корзины', async ({ request }) => {
        const response = await request.delete(`ecommerce/cart/item/${productId_2}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        expect(response.status()).toBe(200);

        const getCart = await request.get('ecommerce/cart', {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        const cart = await getCart.json();

        expect(cart.data.items.length).toBe(1);
        expect(cart.data.items[0].product.name).toBe(productName_1);
        expect(cart.data.items[0].quantity).toBe(itemQuantityProduct1);
    });
    test('Очистка корзины', async ({ request }) => {
        const response = await request.delete('ecommerce/cart/clear', {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        expect(response.status()).toBe(200);
        const bodyCart = await response.json();
        expect(bodyCart.data.items.length).toBe(0);
        expect(bodyCart.message).toBe('Cart has been cleared');

        const getCart = await request.get('ecommerce/cart', {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        const cart = await getCart.json();
        expect(cart.data.items.length).toBe(0);
        expect(cart.message).toBe('Cart fetched successfully');
    });
});