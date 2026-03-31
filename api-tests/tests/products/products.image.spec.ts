import { test, expect } from "../../fixtures/auth_context";
import { createCategoryAndProduct } from "../../utils/setup_product";
import type { SubImage } from '../../utils/types';
import {deleteProductAndCategory} from "../../utils/delete_product";

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

    test.afterAll('Удаление категории и продуктов', async ({ request, authToken }) => {
        await deleteProductAndCategory(request, authToken,productId, categoryId);
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