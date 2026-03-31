import {test, expect} from "../../fixtures/auth_context";
import {createCategoryAndProduct} from "../../utils/setup_product";
import {deleteProductAndCategory} from "../../utils/delete_product";

test.describe.serial("Проверка информации о товаре на основе категории, к которой он относится", () => {
    let categoryId: string;
    let categoryName: string;
    let productId: string;
    let productName: string;
    let productPrice: number;

    test.beforeAll('Создание категории и продукта', async ({request, authToken}) => {
        const setup = await createCategoryAndProduct(request, authToken);
        categoryId = setup.categoryId;
        categoryName = setup.categoryName;
        productId = setup.productId;
        productName = setup.productName;
        productPrice = setup.productPrice;
    })
    test.afterAll('Удаление категории и продуктов', async ({ request, authToken }) => {
        await deleteProductAndCategory(request, authToken,productId, categoryId);
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
             expect(body.data.category.name).toBe(categoryName);
             expect(body.data.products[0]._id).toBe(productId);
             expect(body.data.products[0].name).toBe(productName);
             expect(body.data.products[0].price).toBe(productPrice);
    });
});