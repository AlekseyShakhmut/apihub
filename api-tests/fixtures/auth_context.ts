import { test as base, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';
import {generateValidUser} from "../utils/user_helper";
dotenv.config({debug: false, quiet: true});


const ADMIN_USER_PASSWORD = process.env.ADMIN_USER_PASSWORD;
if (!ADMIN_USER_PASSWORD) {
    throw new Error('ADMIN_USER_PASSWORD не задан в .env файле');
}

// Тип для фикстуры
type AuthFixtures = {
    authToken: string;
    testUser: {
        email: string;
        password: string;
        username: string;
        role: string;
    };
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

        const { data } = await loginRes.json();
        const token = data.accessToken;

        // 3. Передаем токен в тесты
        await use(token);
    }
});
export {expect} from "@playwright/test";