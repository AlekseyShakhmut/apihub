import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test.describe('Регистрация и авторизация', () => {

    test('Регистрация нового пользователя, логин и использование токена', async ({ request }) => {
        // 1. Генерируем данные нового пользователя
        const user = {
            email: faker.internet.email().toLowerCase(),
            password: "test@555",
            role: "ADMIN",
            username: faker.internet.userName().toLowerCase()
        };

        console.log('📝 Регистрация пользователя:', user.email);

        // 2. Регистрируем пользователя
        const registerRes = await request.post('/api/v1/users/register', {
            data: user
        });
        expect(registerRes.status()).toBe(201);
        console.log('✅ Пользователь зарегистрирован');

        // 3. Логинимся и получаем токен
        const loginRes = await request.post('/api/v1/users/login', {
            data: {
                email: user.email,
                password: user.password
            }
        });
        expect(loginRes.status()).toBe(200);

        const loginData = await loginRes.json();
        const token = loginData.data.accessToken;
        console.log('🔑 Токен получен');

        // 4. Используем токен для защищенного запроса
        const protectedRes = await request.get('/api/v1/users/current-user', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        expect(protectedRes.status()).toBe(200);

        const userData = await protectedRes.json();
        expect(userData.data.email).toBe(user.email);
        console.log(`👤 Получены данные пользователя: ${userData.data.email}`);
    });
    // test('GET /current-user без токена - ожидаем 401', async ({ request }) => {
    //     // Просто запрос без заголовка Authorization и проверка, что эндпоинт защищен
    //     const response = await request.get('/api/v1/users/current-user');
    //
    //     console.log('📡 Статус без токена:', response.status());
    //     expect(response.status()).toBe(401);
    // });
});