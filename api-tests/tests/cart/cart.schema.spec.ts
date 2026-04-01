import { test, expect } from '../../fixtures/auth_context';
import { createCategoryAndProduct, createProduct } from "../../utils/setup_product";
import { addItemQuantity } from "../../utils/data_generator";
import { generateValidUser } from "../../utils/user_helper";
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { cartSchema} from '../../utils/schemas';

const ajv = new Ajv();
addFormats(ajv);

test.describe.serial('Cart - JSON Schema validation', () => {
    let authToken: string;
    let categoryId: string;
    let productId: string;

    test.beforeAll(async ({ request }) => {
        const user = generateValidUser();
        await request.post('users/register', { data: user });
        const loginRes = await request.post('users/login', {
            data: { email: user.email, password: user.password }
        });
        authToken = (await loginRes.json()).data.accessToken;

        const setup = await createCategoryAndProduct(request, authToken);
        categoryId = setup.categoryId;
        productId = setup.productId;

    });

    test.afterAll(async ({ request }) => {
        await request.delete(`ecommerce/categories/${categoryId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
    });

    test('POST /cart/item - ответ должен соответствовать схеме', async ({ request }) => {
        const addItem = addItemQuantity();
        const response = await request.post(`ecommerce/cart/item/${productId}`, {
            data: addItem,
            headers: { Authorization: `Bearer ${authToken}` }
        });
        expect(response.status()).toBe(200);

        const body = await response.json();
        const validate = ajv.compile(cartSchema);
        expect(validate(body.data)).toBe(true);
    });

    test('GET /cart - ответ должен соответствовать схеме', async ({ request }) => {
        // сначала добавим товар
        await request.post(`ecommerce/cart/item/${productId}`, {
            data: addItemQuantity(),
            headers: { Authorization: `Bearer ${authToken}` }
        });

        const response = await request.get('ecommerce/cart', {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        expect(response.status()).toBe(200);

        const body = await response.json();
        const validate = ajv.compile(cartSchema);
        expect(validate(body.data)).toBe(true);
    });
});