import { test, expect } from "../../fixtures/auth_context";
import { createCategoryAndProduct } from "../../utils/setup";
import type { SubImage } from '../../utils/types';

test.describe.serial("Проверка возможности удаления доп. изображений", () => {
    let categoryId: string;
    let productId: string;
    let subImageId: string;

    test.beforeAll(async ({ request, authToken }) => {
        const setup = await createCategoryAndProduct(request, authToken);
        categoryId = setup.categoryId;
        productId = setup.productId;
        subImageId = setup.subImageId;

        expect(subImageId).toBeDefined();
        expect(setup.subImages.length).toBe(3);
    });

    test.afterAll(async ({ request, authToken }) => {

        const responseProduct = await request.delete(`ecommerce/products/${productId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        expect([200, 204]).toContain(responseProduct.status());

        const checkProduct = await request.get(`ecommerce/products/${productId}`);
        expect(checkProduct.status()).toBe(404);

        const responseCategory = await request.delete(`ecommerce/categories/${categoryId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        expect([200, 204]).toContain(responseCategory.status());

        const checkCategory = await request.get(`ecommerce/categories/${categoryId}`);
        expect(checkCategory.status()).toBe(404);
    });

    test('Удаление одного дополнительного изображения', async ({ request, authToken }) => {
        // 1. Удаляем изображение
        const responseDelete = await request.patch(`ecommerce/products/remove/subimage/${productId}/${subImageId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        expect(responseDelete.status()).toBe(200);

        const deleteBody = await responseDelete.json();
        expect(deleteBody.message).toBe('Sub image removed successfully');
        expect(deleteBody.data.subImages.length).toBe(2);

        // 2. Проверяем через GET, что изображение действительно удалилось
        const response = await request.get(`ecommerce/products/${productId}`);
        expect(response.status()).toBe(200);
        const product = (await response.json()).data;

        const remainingIds = product.subImages.map((img: SubImage) => img._id);
        expect(remainingIds).not.toContain(subImageId);
        expect(remainingIds.length).toBe(2);
    });
});