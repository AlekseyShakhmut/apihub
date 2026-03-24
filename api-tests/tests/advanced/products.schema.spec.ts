import { test, expect } from '../../fixtures/auth_context';
import {generateCategory, generateNewPrice, generateProduct} from '../../utils/data_generator';
import { createImageBlob } from '../../utils/image_helper';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { productSchema } from '../../utils/schemas';
import {createPriceUpdateFormData, createProductFormData} from "../../utils/form_data_helper";

const ajv = new Ajv();
addFormats(ajv);

test.describe.serial('JSON Schema валидация', () => {
    let categoryId: string;
    let productId: string;
    let createdProduct: any;

    test.beforeAll(async ({ request, authToken }) => {
        // Создаем категорию один раз
        const categoryData = generateCategory();
        const categoryRes = await request.post('ecommerce/categories', {
            data: categoryData,
            headers: { Authorization: `Bearer ${authToken}` }
        });
        categoryId = (await categoryRes.json()).data._id;
    });

    test('POST /products - ответ должен соответствовать схеме', async ({ request, authToken }) => {
        const productData = generateProduct(categoryId);
        const formData = createProductFormData({
            ...productData,
            mainImage: 'main.jpg',
            subImages: ['sub1.jpeg', 'sub2.jpg', 'sub3.jpg']
        });

        const createRes = await request.post('ecommerce/products', {
            multipart: formData,
            headers: { Authorization: `Bearer ${authToken}` }
        });
        expect(createRes.status()).toBe(201);

        const responseBody = await createRes.json();
        createdProduct = responseBody.data;
        productId = createdProduct._id;

        // Валидация схемы ответа POST
        const validate = ajv.compile(productSchema);
        const valid = validate(responseBody.data);
        expect(valid).toBe(true);
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

    test('PATCH /products/{id} - ответ должен соответствовать схеме', async ({ request, authToken }) => {
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

        // Валидация схемы ответа PUT
        const validate = ajv.compile(productSchema);
        const valid = validate(responseBody.data);
        expect(valid).toBe(true);
    });
});