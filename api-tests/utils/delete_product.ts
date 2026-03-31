import { expect } from "@playwright/test";

export async function deleteProductAndCategory(
    request: any,
    authToken: string,
    productIds: string | string[],
    categoryId: string
) {
    // Преобразуем в массив, если передан один ID
    const ids = Array.isArray(productIds) ? productIds : [productIds];

    // 1. Удаляем все продукты
    for (const productId of ids) {
        const responseProduct = await request.delete(`ecommerce/products/${productId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        expect([200, 204]).toContain(responseProduct.status());

        // Проверяем, что продукт удален
        const checkProduct = await request.get(`ecommerce/products/${productId}`);
        expect(checkProduct.status()).toBe(404);
    }

    // 2. Удаляем категорию
    const responseCategory = await request.delete(`ecommerce/categories/${categoryId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect([200, 204]).toContain(responseCategory.status());

    // 3. Проверяем, что категория удалена
    const checkCategory = await request.get(`ecommerce/categories/${categoryId}`);
    expect(checkCategory.status()).toBe(404);
}