import { test, expect } from '../../fixtures/auth_ecommerce';
import { generateProduct } from '../../utils/data_generator';
import {createProductFormData} from '../../utils/form_data_helper';

test.describe('Параметризованные тесты для цены продукта', () => {
    // Граничные значения цены
    const priceTestCases = [
        { price: 0, expected: 201, description: 'нулевой ценой' },
        { price: -100, expected: 201, description: 'отрицательной ценой' },
        { price: 99999999999999, expected: 201, description: 'очень большой ценой (но валидная)' },
        { price: 99999999999999999999999, expected: 422, description: 'слишком большой ценой (Цена 1e+23)' }
    ];

    priceTestCases.forEach(({ price, expected, description }) => {
        test(`Создание продукта с ${description} (${price})`, async ({ request, authToken, categoryId }) => {
            // Создаем продукт с тестовой ценой
            const productData = generateProduct(categoryId);

            const formData = createProductFormData({
                ...productData,
                price: price.toString(),
                mainImage: 'main.jpg',
                subImages: ['sub1.jpeg', 'sub2.jpg', 'sub3.jpg']
            });

            const response = await request.post('ecommerce/products', {
                multipart: formData,
                headers: { Authorization: `Bearer ${authToken}` }
            });

            expect(response.status()).toBe(expected);
        });
    });
});