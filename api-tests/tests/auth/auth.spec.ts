import { test, expect } from '@playwright/test';
import { generateValidUser } from '../../utils/user_helper';
import { registerUser, loginUser, parseAccessToken } from '../../utils/auth_flow';

test.describe('Регистрация и авторизация', () => {
    test('Регистрация нового пользователя, логин и использование токена', async ({ request }) => {
        const userReg = generateValidUser();

        const registerRes = await registerUser(request, userReg);
        expect(registerRes.status()).toBe(201);

        const loginRes = await loginUser(request, {
            email: userReg.email,
            password: userReg.password
        });
        expect(loginRes.status()).toBe(200);

        const loginData = await loginRes.json();
        const token = parseAccessToken(loginData);

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