import { test, expect } from '../../fixtures/auth_context';
import { generateCategory, generateProduct } from '../../utils/data_generator';
import { createImageBlob } from '../../utils/image_helper';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { productSchema } from '../../utils/schemas';

const ajv = new Ajv();
addFormats(ajv);  // ← это ДО компиляции

test.describe('JSON Schema валидация', () => {
    let categoryId: string;

    test.beforeAll(async ({ request, authToken }) => {
        // ✅ Создаем категорию один раз для всех тестов (если их будет несколько)
        const categoryData = generateCategory();
        const categoryRes = await request.post('/api/v1/ecommerce/categories', {
            data: categoryData,
            headers: { Authorization: `Bearer ${authToken}` }
        });
        categoryId = (await categoryRes.json()).data._id;
        console.log(`📁 Категория создана: ${categoryId}`);
    });

    test('GET /products/{id} должен соответствовать схеме', async ({ request, authToken }) => {
        // 1. Создаем продукт с изображениями (используем готовую categoryId)
        const productData = generateProduct(categoryId);
        const formData = new FormData();
        formData.append('name', productData.name);
        formData.append('description', productData.description);
        formData.append('price', productData.price);
        formData.append('stock', productData.stock);
        formData.append('category', categoryId);
        formData.append('mainImage', createImageBlob('main.jpg'), 'main.jpg');
        formData.append('subImages', createImageBlob('sub1.jpeg'), 'sub1.jpeg');
        // formData.append('subImages', createImageBlob('sub2.jpg'), 'sub2.jpg');
        // formData.append('subImages', createImageBlob('sub3.jpg'), 'sub3.jpg');

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

        expect(valid).toBe(true);
        console.log('✅ Схема продукта валидна');
    });
});