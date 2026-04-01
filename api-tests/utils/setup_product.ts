import { expect } from '@playwright/test';
import { generateCategory, generateProduct } from './data_generator';
import { createProductFormData } from './form_data_helper';
import type { SubImage } from './types';

export async function createCategoryAndProduct(request: any, authToken: string) {
    // 1. Создаем категорию
    const categoryData = generateCategory();
    const categoryRes = await request.post('ecommerce/categories', {
        data: categoryData,
        headers: { Authorization: `Bearer ${authToken}` }
    });
    expect(categoryRes.status()).toBe(201);
    const categoryBody = await categoryRes.json();
    const categoryId = categoryBody.data._id;
    const categoryName = categoryBody.data.name;

    // 2. Создаем продукт с изображениями
    const productData = generateProduct(categoryId);
    const formData = createProductFormData({
        ...productData,
        mainImage: 'main.jpg',
        subImages: ['sub1.jpeg', 'sub2.jpg', 'sub3.jpg']
    });
    const productRes = await request.post('ecommerce/products', {
        multipart: formData,
        headers: { Authorization: `Bearer ${authToken}` }
    });
    expect(productRes.status()).toBe(201);
    const productBody = await productRes.json();

    const subImages = productBody.data.subImages as SubImage[];
    const productId = productBody.data._id;
    const productName = productBody.data.name;
    const productPrice = productBody.data.price;
    const subImageId = subImages[0]?._id;

    return {
        categoryId,
        productId,
        subImageId,
        productName,
        productPrice,
        categoryName,
        subImages
    };
}

export async function createProduct(request: any, authToken: string, categoryId: string) {
    const productData = generateProduct(categoryId);
    const formData = createProductFormData({
        ...productData,
        mainImage: 'main.jpg',
        subImages: ['sub1.jpeg', 'sub2.jpg', 'sub3.jpg']
    });

    const response = await request.post('ecommerce/products', {
        multipart: formData,
        headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(response.status()).toBe(201);
    const body = await response.json();

    return {
        productId: body.data._id,
        productName: body.data.name,
        productPrice: body.data.price,
        fullProduct: body.data
    };
}