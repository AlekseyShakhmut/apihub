import { test, expect } from '../../fixtures/auth_context';
import { generateCategory, generateProduct } from '../../utils/data_generator';
import { createImageBlob } from '../../utils/image_helper';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { productSchema } from '../../utils/schemas';
import {createProductFormData} from "../../utils/form_data_helper";

const ajv = new Ajv();
addFormats(ajv);  // ← это ДО компиляции

test.describe('JSON Schema валидация', () => {
    let categoryId: string;

    test.beforeAll(async ({ request, authToken }) => {
        // Создаем категорию один раз для всех тестов (если их будет несколько)
        const categoryData = generateCategory();
        const categoryRes = await request.post('/api/v1/ecommerce/categories', {
            data: categoryData,
            headers: { Authorization: `Bearer ${authToken}` }
        });
        categoryId = (await categoryRes.json()).data._id;
    });

    test('GET /products/{id} должен соответствовать схеме', async ({ request, authToken }) => {
        // 1. Создаем продукт с изображениями (используем готовую categoryId)
        const productData = generateProduct(categoryId);

        const formData = createProductFormData({
            ...productData,
            mainImage: 'main.jpg',
            subImages: ['sub1.jpeg', 'sub2.jpg', 'sub3.jpg']
        });

        const createRes = await request.post('/api/v1/ecommerce/products', {
            multipart: formData,
            headers: { Authorization: `Bearer ${authToken}` }
        });
        expect(createRes.status()).toBe(201);
        const { data: product } = await createRes.json();

        // 2. Получаем продукт по ID
        const response = await request.get(`/api/v1/ecommerce/products/${product._id}`);
        expect(response.status()).toBe(200);

        const responseBody = await response.json();
        const receivedProduct = responseBody.data;

        // 3. Валидируем схему
        const validate = ajv.compile(productSchema);
        const valid = validate(receivedProduct);

        // if (!valid) {
        //     console.log('Ошибки валидации схемы:');
        //     console.log(JSON.stringify(validate.errors, null, 2));
        //     console.log('Полученный объект:', JSON.stringify(receivedProduct, null, 2));
        // }

        expect(valid).toBe(true);
    });
});