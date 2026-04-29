import { expect, APIRequestContext } from '@playwright/test';
import { generateProduct } from './data_generator';
import { createProductFormData } from './form_data_helper';
import type { SubImage } from './types';

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
        subImages: body.data.subImages as SubImage[],
        subImageId: (body.data.subImages as SubImage[])[0]?._id as string,
        fullProduct: body.data
    };
}