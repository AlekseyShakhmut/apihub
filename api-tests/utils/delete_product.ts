import { expect } from "@playwright/test";

export async function deleteProductAndCategory(
    request: any,
    authToken: string,
    productIds: string | string[],
) {
    // Преобразуем в массив, если передан один ID
    const ids = Array.isArray(productIds) ? productIds : [productIds];

    // 1. Удаляем все продукты
    for (const productId of ids) {
        const responseProduct = await request.delete(`ecommerce/products/${productId}`, {
            headers: {'Authorization': `Bearer ${authToken}`}
        });
        expect([200, 204]).toContain(responseProduct.status());

        // Проверяем, что продукт удален
        const checkProduct = await request.get(`ecommerce/products/${productId}`);
        expect(checkProduct.status()).toBe(404);
    }
}