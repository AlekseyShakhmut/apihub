import { test as base, expect } from '@playwright/test';
import { type TestUser } from '../utils/types';
import { ToDoListPoints } from '../clients/todos';
import { generateValidUser } from '../utils/user_helper';
import { generateCategory } from '../utils/data_generator';


// Тип для фикстур
type AuthFixtures = {
    authToken: string;
    testUser: TestUser;
    toDoClient: ToDoListPoints;
    categoryId: string;
};

export const test = base.extend<AuthFixtures>({
    // Фикстура с тестовым пользователем (данные)
    testUser: async ({}, use) => {
        const user = generateValidUser();
        await use(user);
    },

    // Фикстура с токеном (регистрация + логин)
    authToken: async ({ request, testUser }, use) => {
        // 1. Регистрируем пользователя
        const registerRes = await request.post('users/register', {
            data: testUser
        });
        expect(registerRes.status()).toBe(201);

        // 2. Логинимся и получаем токен
        const loginRes = await request.post('users/login', {
            data: {
                password: testUser.password,
                username: testUser.username
            }
        });
        expect(loginRes.status()).toBe(200);

        const body = await loginRes.json();
        const token = body.data?.accessToken ?? body.accessToken;
        expect(token).toBeTruthy();

        // 3. Передаем токен в тесты
        await use(token);
    },
    categoryId: async ({ request, authToken }, use) => {
        const categoryData = generateCategory();
        const response = await request.post('ecommerce/categories', {
            data: categoryData,
            headers: { Authorization: `Bearer ${authToken}` }
        });
        expect(response.status()).toBe(201);
        const body = await response.json();
        const categoryId = body.data._id as string;

        await use(categoryId);

        await request.delete(`ecommerce/categories/${categoryId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
    },
    toDoClient: async ({ request }, use) => {
        const client = new ToDoListPoints(request);
        await use(client);
    }
});
export { expect } from '@playwright/test';