import {test, expect} from "../../fixtures/auth_context";
import fs from 'fs';
import path from 'path'

const PRODUCT_LIST = path.join(process.cwd(), 'data', 'products_initial.json');

test.describe('Чтение определенного продукта из списка',() => {

    test('Прочитать третий продукт из файла и проверить его данные', async () => {})

        const fileContent = fs.readFileSync(PRODUCT_LIST, 'utf8');
        const products = JSON.parse(fileContent);

        const thirdProduct = products[2];

        expect(thirdProduct).toHaveProperty('id')
        expect(thirdProduct).toHaveProperty('title')
        expect(thirdProduct).toHaveProperty('price')

        expect(thirdProduct.id).toBe(3);
        expect(thirdProduct.title).toBe('Samsung Universe 9');
        expect(thirdProduct.price).toBe(1249);
})