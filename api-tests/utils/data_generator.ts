import { faker } from '@faker-js/faker';

export function generateCategory() {
    return {
        name: faker.commerce.department()
    }
}

export function generateProduct(categoryId: string) {
    return {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: faker.commerce.price(),
        stock: faker.number.int({ min: 50, max: 100 }).toString(),
        category: categoryId
    };
}

export function generateNewPrice() {
    return {
        price: faker.commerce.price().toString()
    }
}

export function addItemQuantity() {
    return {
        quantity: faker.number.int({ min: 1, max: 30 })
    }
}