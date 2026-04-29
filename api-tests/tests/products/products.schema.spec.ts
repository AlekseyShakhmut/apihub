import { test, expect } from '../../fixtures/auth_context';
import {generateCategory, generateNewPrice} from '../../utils/data_generator';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import {
    categoryProductsSchema,
    deleteProductResponseSchema,
    productSchema,
    removeSubImageResponseSchema
} from '../../utils/schemas';
import {createPriceUpdateFormData} from "../../utils/form_data_helper";
import {createProduct} from "../../utils/setup_product";
import { generateValidUser } from "../../utils/user_helper";

const ajv = new Ajv();
addFormats(ajv);

test.describe.serial('JSON Schema валидация', () => {
    let authToken: string;
    let categoryId: string;
    let productId: string;
    let createdProduct: any;
    let subImageId: string;

    test.beforeAll(async ({ request }) => {
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
    });

    test.afterAll(async ({ request }) => {
        await request.delete(`ecommerce/categories/${categoryId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
    });

    test('POST /products - ответ должен соответствовать схеме', async ({ request }) => {
        const product = await createProduct(request, authToken, categoryId);
        createdProduct = product.fullProduct;
        productId = product.productId;
        subImageId = createdProduct.subImages[0]?._id;

        const validate = ajv.compile(productSchema);
        expect(validate(createdProduct)).toBe(true);
    });

    test('GET /products/{id} - ответ должен соответствовать схеме', async ({ request }) => {
        const response = await request.get(`ecommerce/products/${productId}`);
        expect(response.status()).toBe(200);

        const responseBody = await response.json();
        const receivedProduct = responseBody.data;

        const validate = ajv.compile(productSchema);
        const valid = validate(receivedProduct);
        expect(valid).toBe(true);
    });

    test('PATCH /products/{id} - ответ должен соответствовать схеме', async ({ request }) => {
        // Обновляем продукт
        const responseNewPrice = generateNewPrice();

        // 2. Формируем запрос на обновление
        const formData = createPriceUpdateFormData(responseNewPrice.price, categoryId);

        const updateRes = await request.patch(`ecommerce/products/${productId}`, {
            multipart: formData,
            headers: { Authorization: `Bearer ${authToken}` }
        });
        expect(updateRes.status()).toBe(200);

        const responseBody = await updateRes.json();

        // Валидация схемы ответа PATCH
        const validate = ajv.compile(productSchema);
        const valid = validate(responseBody.data);
        expect(valid).toBe(true);
    });
    test('GET /products/category/{categoryId} ответ должен соответствовать схеме', async ({request}) => {
        const response = await request.get(`ecommerce/products/category/${categoryId}`,{
            params: {
                page: 1,
                limit: 1
            }
        });
        expect(response.status()).toBe(200);
        const bodyCategoryProduct = await response.json();

        const validate = ajv.compile(categoryProductsSchema);
        const valid = validate(bodyCategoryProduct);
        expect(valid).toBe(true);
    });
    test(' PATCH /products/remove/subimage/{productId}/{subImageId}- ответ должен соответствовать схеме', async ({ request }) => {
        const responseDelete = await request.patch(`ecommerce/products/remove/subimage/${productId}/${subImageId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        expect(responseDelete.status()).toBe(200);

        const deleteImageBody = await responseDelete.json();

        const validate = ajv.compile(removeSubImageResponseSchema);
        const valid = validate(deleteImageBody);
        expect(valid).toBe(true);

    });
    test('DELETE /products/{id} - ответ должен соответствовать схеме', async ({ request }) => {
        const response = await request.delete(`ecommerce/products/${productId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        expect([200, 204]).toContain(response.status());

        const responseBody = await response.json();

        const validate = ajv.compile(deleteProductResponseSchema);
        const valid = validate(responseBody);
        expect(valid).toBe(true);
    });
});