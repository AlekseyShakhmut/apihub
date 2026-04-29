import { test, expect } from '../../fixtures/auth_context';
import {generateProduct} from '../../utils/data_generator';
import { createProductFormData } from '../../utils/form_data_helper';

test.describe('Обязательные поля продукта', () => {
    test('POST /products без поля name - ожидаем 422', async ({ request, authToken, categoryId }) => {
        const product = generateProduct(categoryId);

        const formData = createProductFormData({
            ...product,
            name: '',  // пустое поле name
            mainImage: 'main.jpg',
            subImages: ['sub1.jpeg', 'sub2.jpg', 'sub3.jpg']
        });

        const response = await request.post('ecommerce/products', {
            multipart: formData,
            headers: { Authorization: `Bearer ${authToken}` }
        });

        expect(response.status()).toBe(422);
        const body = await response.json();
        expect(body.errors.length).toBe(1);
        expect(body.errors[0].name).toBe('Name is required');
    });

    test('POST /products без поля description - ожидаем 422', async ({ request, authToken, categoryId }) => {
        const product = generateProduct(categoryId);

        const formData = createProductFormData({
            ...product,
            description: '',  // пустое поле description
            mainImage: 'main.jpg',
            subImages: ['sub1.jpeg', 'sub2.jpg', 'sub3.jpg']
        });

        const response = await request.post('ecommerce/products', {
            multipart: formData,
            headers: { Authorization: `Bearer ${authToken}` }
        });

        expect(response.status()).toBe(422);
        const body = await response.json();
        expect(body.errors.length).toBe(1);
        expect(body.errors[0].description).toBe('Description is required');
    });

    test('POST /products без поля price - ожидаем 422', async ({ request, authToken, categoryId }) => {
        const product = generateProduct(categoryId);

        const formData = createProductFormData({
            ...product,
            price: '',  // пустое поле price
            mainImage: 'main.jpg',
            subImages: ['sub1.jpeg', 'sub2.jpg', 'sub3.jpg']
        });

        const response = await request.post('ecommerce/products', {
            multipart: formData,
            headers: { Authorization: `Bearer ${authToken}` }
        });

        expect(response.status()).toBe(422);
        const body = await response.json();
        expect(body.errors.length).toBe(2);
        expect(body.errors[0].price).toBe('Price is required');
        expect(body.errors[1].price).toBe('Price must be a number');
    });
    test('POST /products без поля mainImage - ожидаем 400', async ({ request, authToken, categoryId }) => {
        const product = generateProduct(categoryId);
        const response = await request.post('ecommerce/products', {
            multipart: product,
            headers: { Authorization: `Bearer ${authToken}` }
        })
        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.message).toBe('Main image is required')
    })
});