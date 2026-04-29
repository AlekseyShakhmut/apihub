import { test, expect } from '../../fixtures/auth_context';
import { createProduct } from "../../utils/setup_product";
import { addItemQuantity } from "../../utils/data_generator";
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { cartSchema} from '../../utils/schemas';

const ajv = new Ajv();
addFormats(ajv);

test.describe.serial('Cart - JSON Schema validation', () => {
    let productId: string;

    test.beforeAll(async ({ request, authToken, categoryId }) => {
        const setup = await createProduct(request, authToken, categoryId);
        productId = setup.productId;
    });

    test('POST /cart/item - ответ должен соответствовать схеме', async ({ request, authToken }) => {
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

    test('GET /cart - ответ должен соответствовать схеме', async ({ request, authToken }) => {
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