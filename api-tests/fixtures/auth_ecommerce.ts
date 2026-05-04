import { test as base, expect } from './auth';
import { createEcommerceCategory } from '../utils/category_flow';

type EcommerceFixtures = {
    categoryId: string;
};

/** Наследует auth-фикстуры и добавляет категорию с teardown. */
export const test = base.extend<EcommerceFixtures>({
    categoryId: async ({ request, authToken }, use) => {
        const categoryId = await createEcommerceCategory(request, authToken);
        await use(categoryId);
        await request.delete(`ecommerce/categories/${categoryId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
    }
});

export { expect } from '@playwright/test';
