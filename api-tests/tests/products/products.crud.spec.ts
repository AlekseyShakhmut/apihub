import { test, expect } from '../../fixtures/auth_ecommerce';
import { generateProduct, generateNewPrice } from '../../utils/data_generator';
import { createProductFormData, createPriceUpdateFormData } from '../../utils/form_data_helper';

test('CRUD flow продукта', async ({ request, authToken, categoryId }) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Создание продукта
    const productData = generateProduct(categoryId);

    const formData = createProductFormData({
        ...productData,
        mainImage: 'main.jpg',
        subImages: ['sub1.jpeg', 'sub2.jpg', 'sub3.jpg']
    });

    const createRes = await request.post('ecommerce/products', {
        multipart: formData,
        headers
    });

    expect(createRes.status()).toBe(201);

    const createBody = await createRes.json();
    const productId = createBody.data._id;
    const productName = createBody.data.name;
    const originalPrice = createBody.data.price;

    // Проверка продукта
    const getRes = await request.get(`ecommerce/products/${productId}`);
    expect(getRes.status()).toBe(200);

    const getBody = await getRes.json();
    expect(getBody.data.name).toBe(productName);

    // Обнолвение продукта
    const newPriceData = generateNewPrice();

    const updateForm = createPriceUpdateFormData(
        newPriceData.price,
        categoryId
    );

    const updateRes = await request.patch(`ecommerce/products/${productId}`, {
        multipart: updateForm,
        headers
    });

    expect(updateRes.status()).toBe(200);

    const updatedBody = await updateRes.json();
    const newPrice = updatedBody.data.price;

    // проверка после обновления
    const verifyRes = await request.get(`ecommerce/products/${productId}`);
    const verifyBody = await verifyRes.json();

    expect(verifyBody.data.price).toBe(newPrice);
    expect(verifyBody.data.price).not.toBe(originalPrice);

    // Удаление продукта
    const deleteRes = await request.delete(`ecommerce/products/${productId}`, {
        headers
    });

    expect([200, 204]).toContain(deleteRes.status());

    // Проверка продукта после удаления
    const deletedRes = await request.get(`ecommerce/products/${productId}`, {
        headers
    });

    expect(deletedRes.status()).toBe(404);
});