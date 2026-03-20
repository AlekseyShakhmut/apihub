import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import {generateValidUser} from "../../utils/user_helper";


test.describe('Регистрация и авторизация', () => {

    test('Регистрация нового пользователя, логин и использование токена', async ({ request }) => {

        // 1. Генерируем данные нового пользователя
        const userReg = generateValidUser();

        // 2. Регистрируем пользователя
        const registerRes = await request.post('users/register', {
            data: userReg
        });
        expect(registerRes.status()).toBe(201);

        // 3. Логинимся и получаем токен
        const loginRes = await request.post('users/login', {
            data: {
                email: userReg.email,
                password: userReg.password
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
        expect(userData.data.email).toBe(userReg.email);
    });
});