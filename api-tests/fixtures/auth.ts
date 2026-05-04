import { test as base, expect } from '@playwright/test';
import type { TestUser } from '../utils/types';
import { ToDoListPoints } from '../clients/todos';
import { generateValidUser } from '../utils/user_helper';
import { registerAndLoginWithUsername } from '../utils/auth_flow';

type AuthFixtures = {
    testUser: TestUser;
    authToken: string;
    toDoClient: ToDoListPoints;
};

/** Регистрация + логин; без категории e-commerce (дешевле для тестов, где она не нужна). */
export const test = base.extend<AuthFixtures>({
    testUser: async ({}, use) => {
        await use(generateValidUser());
    },

    authToken: async ({ request, testUser }, use) => {
        const { accessToken } = await registerAndLoginWithUsername(request, testUser);
        await use(accessToken);
    },

    toDoClient: async ({ request }, use) => {
        await use(new ToDoListPoints(request));
    }
});

export { expect } from '@playwright/test';
