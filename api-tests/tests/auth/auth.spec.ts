import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';
dotenv.config({debug: false, quiet: true});

test.describe('Регистрация и авторизация', () => {
    const ADMIN_USER_PASSWORD = process.env.ADMIN_USER_PASSWORD;
    if (!ADMIN_USER_PASSWORD) {
        throw new Error('ADMIN_USER_PASSWORD не задан в .env файле');
    }

    test('Регистрация нового пользователя, логин и использование токена', async ({ request }) => {

        // 1. Генерируем данные нового пользователя
        const user = {
            email: faker.internet.email().toLowerCase(),
            password: ADMIN_USER_PASSWORD,
            role: "ADMIN",
            username: faker.internet.userName().toLowerCase()
        };

        // 2. Регистрируем пользователя
        const registerRes = await request.post('users/register', {
            data: user
        });
        expect(registerRes.status()).toBe(201);

        // 3. Логинимся и получаем токен
        const loginRes = await request.post('users/login', {
            data: {
                email: user.email,
                password: user.password
            }
        });
        expect(loginRes.status()).toBe(200);

        const loginData = await loginRes.json();
        const token = loginData.data.accessToken;

        // 4. Используем токен для защищенного запроса
        const protectedRes = await request.get('users/current-user', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        expect(protectedRes.status()).toBe(200);

        const userData = await protectedRes.json();
        expect(userData.data.email).toBe(user.email);
    });
});