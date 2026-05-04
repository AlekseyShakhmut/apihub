import { test, expect } from '@playwright/test';
import { createProduct } from '../../utils/setup_product';
import { deleteProductAndCategory } from '../../utils/delete_product';
import { generateValidUser } from '../../utils/user_helper';
import { registerAndLoginWithUsername } from '../../utils/auth_flow';
import { createEcommerceCategory } from '../../utils/category_flow';

test.describe.serial("Проверка информации о товаре на основе категории, к которой он относится", () => {
    let authToken: string;
    let categoryId: string;
    let productId: string;
    let productName: string;
    let productPrice: number;

    test.beforeAll('Создание пользователя, категории и продукта', async ({ request }) => {
        const user = generateValidUser();
        const { accessToken } = await registerAndLoginWithUsername(request, user);
        authToken = accessToken;
        categoryId = await createEcommerceCategory(request, authToken);

        const setup = await createProduct(request, authToken, categoryId);
        productId = setup.productId;
        productName = setup.productName;
        productPrice = setup.productPrice;
    });
    test.afterAll('Удаление категории и созданных продуктов', async ({ request }) => {
        await deleteProductAndCategory(request, authToken, productId);
        await request.delete(`ecommerce/categories/${categoryId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
    });
    test('Проверка информации о товаре внутри категории', async ({request}) => {
        const response = await request.get(`ecommerce/products/category/${categoryId}`,{
            params: {
                page: 1,
                limit: 1
            }
        });
             expect(response.status()).toBe(200);
             const body = await response.json();

             expect(body.data.totalProducts).toBe(1);
             expect(body.data.totalPages).toBe(1);
             expect(body.data.limit).toBe(1);
             expect(body.data.page).toBe(1);
             expect(body.message).toBe('Category products fetched successfully');

             expect(body.data.products).toBeInstanceOf(Array);
             expect(body.data.products.length).toBe(1);

             expect(body.data.category._id).toBe(categoryId);
             expect(body.data.category.name).toBeTruthy();
             expect(body.data.products[0]._id).toBe(productId);
             expect(body.data.products[0].name).toBe(productName);
             expect(body.data.products[0].price).toBe(productPrice);
    });
});