import {test, expect} from "../../fixtures/auth_context";
import {createProduct} from "../../utils/setup_product";
import {deleteProductAndCategory} from "../../utils/delete_product";
import { generateValidUser } from "../../utils/user_helper";
import { generateCategory } from "../../utils/data_generator";

test.describe.serial("Проверка информации о товаре на основе категории, к которой он относится", () => {
    let authToken: string;
    let categoryId: string;
    let productId: string;
    let productName: string;
    let productPrice: number;

    test.beforeAll('Создание пользователя, категории и продукта', async ({request}) => {
        const user = generateValidUser();
        await request.post('users/register', { data: user });
        const loginRes = await request.post('users/login', {
            data: {
                password: user.password,
                username: user.username
            }
        });
        authToken = (await loginRes.json()).data.accessToken;

        const categoryRes = await request.post('ecommerce/categories', {
            data: generateCategory(),
            headers: { Authorization: `Bearer ${authToken}` }
        });
        categoryId = (await categoryRes.json()).data._id;

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