import { createImageBlob } from './image_helper';

export interface ProductFormData {
    name: string;
    description: string;
    price: string;
    stock: string;
    category: string;
    mainImage: string;
    subImages: string[];
}

export function createProductFormData(productData: ProductFormData): FormData {
    const formData = new FormData();

    // Добавляем все текстовые поля
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', productData.price);
    formData.append('stock', productData.stock);
    formData.append('category', productData.category);

    // Добавляем главное изображение
    formData.append('mainImage',
        createImageBlob(productData.mainImage),
        productData.mainImage
    );

    // Добавляем дополнительные изображения
    productData.subImages.forEach((imageName) => {
        formData.append('subImages',
            createImageBlob(imageName),
            imageName
        );
    });

    return formData;
}

export function createBaseProductFormData(categoryId: string): FormData {
    const formData = new FormData();

    // Все корректные поля (кроме цены)
    formData.append('category', categoryId);
    formData.append('description', 'New description number 2');
    formData.append('name', 'Kids product');
    formData.append('stock', '30');

    return formData;
}

export function createPriceUpdateFormData(price: string, categoryId: string) {
    const formData = new FormData();
    formData.append('price', price);
    formData.append('category', categoryId);
    return formData;
}