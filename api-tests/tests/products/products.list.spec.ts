import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products_initial.json');

test.describe('Получение списка случайных продуктов', () => {

    test('Получить весь список фиктивных товаров и сохранить список в файл', async ({ request }) => {
        // Узнаем общее количество продуктов с минимальной нагрузкой
        const metaResponse = await request.get('/api/v1/public/randomproducts?limit=1',)
        const totalItems = (await metaResponse.json()).data.totalItems;


        // Запрашиваем ВСЕ продукты
        const response = await request.get('api/v1/public/randomproducts', {
            params: {
                limit: totalItems
            }
        });

        // Проверяем статус
        expect(response.status()).toBe(200);

        // Извлекаем массив продуктов
        const productsArray = (await response.json()).data.data;

        // Проверяем, что это массив
        expect(Array.isArray(productsArray)).toBeTruthy();

        // Сохраняем в файл
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(productsArray, null, 2));
    });
});