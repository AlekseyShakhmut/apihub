import { test, expect } from '../../fixtures/auth_context';
import { createProduct } from "../../utils/setup_product";
import { deleteProductAndCategory } from "../../utils/delete_product";
import { addItemQuantity } from "../../utils/data_generator";

test.describe('Корзина CRUD операции', () => {
    test('Flow: добавить товары, проверить корзину, удалить товар и очистить', async ({ request, authToken, categoryId }) => {
        const firstProduct = await createProduct(request, authToken, categoryId);
        const secondProduct = await createProduct(request, authToken, categoryId);
        const headers = { Authorization: `Bearer ${authToken}` };
        const productId_1 = firstProduct.productId;
        const productName_1 = firstProduct.productName;
        const productId_2 = secondProduct.productId;
        const productName_2 = secondProduct.productName;

        // Добавляем первый продукт в корзину
        const addItem = addItemQuantity();
        const addFirstResponse = await request.post(`ecommerce/cart/item/${productId_1}`, {
            data: addItem,
            headers
        });
        expect(addFirstResponse.status()).toBe(200);
        const firstCartState = await addFirstResponse.json();
        expect(firstCartState.data.items.length).toBe(1);
        expect(firstCartState.data.items[0].product.name).toBe(productName_1);
        const itemQuantityProduct1 = firstCartState.data.items[0].quantity;

        // Добавляем второй продукт в корзину
        const addSecondResponse = await request.post(`ecommerce/cart/item/${productId_2}`, {
            data: addItem,
            headers
        });
        expect(addSecondResponse.status()).toBe(200);
        const secondCartState = await addSecondResponse.json();
        expect(secondCartState.data.items.length).toBe(2);
        expect(secondCartState.data.items[1].product.name).toBe(productName_2);
        const itemQuantityProduct2 = secondCartState.data.items[1].quantity;

        // Проверяем содержимое корзины
        const getCartResponse = await request.get('ecommerce/cart', {
            headers
        });
        expect(getCartResponse.status()).toBe(200);
        const cart = await getCartResponse.json();

        expect(cart.data.items.length).toBe(2);
        expect(cart.data.items[0].product.name).toBe(productName_1);
        expect(cart.data.items[0].quantity).toBe(itemQuantityProduct1);
        expect(cart.data.items[1].product.name).toBe(productName_2);
        expect(cart.data.items[1].quantity).toBe(itemQuantityProduct2);

        // Удаляем второй продукт и проверяем, что остался один
        const deleteItemResponse = await request.delete(`ecommerce/cart/item/${productId_2}`, {
            headers
        });
        expect(deleteItemResponse.status()).toBe(200);

        const getCartAfterDeleteResponse = await request.get('ecommerce/cart', {
            headers
        });
        const cartAfterDelete = await getCartAfterDeleteResponse.json();

        expect(cartAfterDelete.data.items.length).toBe(1);
        expect(cartAfterDelete.data.items[0].product.name).toBe(productName_1);
        expect(cartAfterDelete.data.items[0].quantity).toBe(itemQuantityProduct1);

        // Очищаем корзину
        const clearCartResponse = await request.delete('ecommerce/cart/clear', {
            headers
        });
        expect(clearCartResponse.status()).toBe(200);
        const bodyCart = await clearCartResponse.json();
        expect(bodyCart.data.items.length).toBe(0);
        expect(bodyCart.message).toBe('Cart has been cleared');

        const getCartAfterClearResponse = await request.get('ecommerce/cart', {
            headers
        });
        const cartAfterClear = await getCartAfterClearResponse.json();
        expect(cartAfterClear.data.items.length).toBe(0);
        expect(cartAfterClear.message).toBe('Cart fetched successfully');
        await deleteProductAndCategory(request, authToken, [productId_1, productId_2]);
    });
});