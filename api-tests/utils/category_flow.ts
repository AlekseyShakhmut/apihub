import { expect, type APIRequestContext } from '@playwright/test';
import { generateCategory } from './data_generator';

export async function createEcommerceCategory(request: APIRequestContext, authToken: string): Promise<string> {
    const categoryRes = await request.post('ecommerce/categories', {
        data: generateCategory(),
        headers: { Authorization: `Bearer ${authToken}` }
    });
    expect(categoryRes.status()).toBe(201);
    const body = await categoryRes.json();
    return body.data._id as string;
}
