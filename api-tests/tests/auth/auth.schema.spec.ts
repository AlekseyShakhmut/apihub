import { test, expect } from '@playwright/test';
import { generateValidUser } from "../../utils/user_helper";
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { registerResponseSchema, loginResponseSchema, userSchema } from '../../utils/schemas';

const ajv = new Ajv();
addFormats(ajv);

test.describe.serial('Регистрация и авторизация', () => {
    let registeredUser: any;
    let userReg: ReturnType<typeof generateValidUser>;

    test('Регистрация нового пользователя', async ({ request }) => {
        userReg = generateValidUser();

        const registerRes = await request.post('users/register', {
            data: userReg
        });
        expect(registerRes.status()).toBe(201);

        const registerData = await registerRes.json();
        registeredUser = registerData.data.user;

        // Проверка схемы ответа регистрации
        const validateRegister = ajv.compile(registerResponseSchema);
        expect(validateRegister(registerData.data.user)).toBe(true);
    });

    test('Логин и получение токена', async ({ request }) => {
        const loginRes = await request.post('users/login', {
            data: {
                email: registeredUser.email,
                password: userReg.password
            }
        });
        expect(loginRes.status()).toBe(200);

        const loginData = await loginRes.json();

        // Проверка схемы ответа логина
        const validateLogin = ajv.compile(loginResponseSchema);
        expect(validateLogin(loginData.data)).toBe(true);

        const token = loginData.data.accessToken;

        // Защищенный запрос
        const protectedRes = await request.get('users/current-user', {
            headers: { Authorization: `Bearer ${token}` }
        });
        expect(protectedRes.status()).toBe(200);

        const userData = await protectedRes.json();

        // Проверка схемы пользователя
        const validateUser = ajv.compile(userSchema);
        expect(validateUser(userData.data)).toBe(true);
        expect(userData.data.email).toBe(registeredUser.email);
    });
});