import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import {generateValidUser} from "../../utils/user_helper";

test.describe('Авторизация негативные тесты', () => {
    let username: string;

    test.beforeAll(async ({ request }) => {

        const user = generateValidUser();

        const registerRes = await request.post('users/register', {
            data: user
        });
        expect(registerRes.status()).toBe(201);
        const body = await registerRes.json();
        username = body.data.user.username;
    });
    test('Проверка авторизации без обязаетельного поля password', async ({request}) => {
        const auth_user = await request.post('users/login', {
            data: {username: username}
        })
            expect(auth_user.status()).toBe(422);
            const body = await auth_user.json();
            expect(body.errors.length).toBe(1);
            expect(body.errors[0].password).toBe('Password is required');
    })
    test('Проверка авторизации c невалидным паролем', async ({request}) => {
        const auth_user = await request.post('users/login', {
            data: {
                password: 'aaaaaa',
                username: username
            }
        })
        expect(auth_user.status()).toBe(401);
        const body = await auth_user.json();
        expect(body.message).toBe('Invalid user credentials')
    })
    test('Проверка авторизации без обязательного поля username', async ({request}) => {
        const auth_user = await request.post('users/login', {
            data: {
                password: process.env.ADMIN_USER_PASSWORD
            }
        })
        expect(auth_user.status()).toBe(400);
        const body = await auth_user.json();
        expect(body.message).toBe('Username or email is required')
    })
    test('Проверка авторизации c невалидным username', async ({request}) => {
        const auth_user = await request.post('users/login', {
            data: {
                password: process.env.ADMIN_USER_PASSWORD,
                username: 'aaaaaa'
            }
        })
        expect(auth_user.status()).toBe(404);
        const body = await auth_user.json();
        expect(body.message).toBe('User does not exist')
    })
});