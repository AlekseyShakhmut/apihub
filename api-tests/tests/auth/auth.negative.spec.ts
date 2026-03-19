import {expect, test} from "@playwright/test"
import {faker} from "@faker-js/faker"
import * as dotenv from 'dotenv';
dotenv.config({debug: false, quiet: true});

test.describe('Регистрация негативные тесты, проверка валидации email', () =>{
    const ADMIN_USER_PASSWORD = process.env.ADMIN_USER_PASSWORD;
    if (!ADMIN_USER_PASSWORD) {
        throw new Error('ADMIN_USER_PASSWORD не задан в .env файле');
    }

    const registerUser = [
        {email: 'nevermind.com', expected: 422, errors: [{ email: 'Email is invalid' }], description: 'невалидный email без @'},
        {email: 'never@mind@.com', expected: 422, errors: [{ email: 'Email is invalid' }], description: 'невалидный email c двумя @'},
        {email: '', expected: 422, errors: [{ email: 'Email is required' },{ email: 'Email is invalid' }], description: 'не заполненное поле email'},
        {email: 's@s.s', expected: 422, errors: [{ email: 'Email is invalid' }], description: 'слишком короткий email'},
    ]
        registerUser.forEach(({email, expected, errors, description}) => {
            test(`Проверка на ${description}`, async ({request}) => {

                const registerData = {
                    email: email,
                    password: ADMIN_USER_PASSWORD,
                    role: "ADMIN",
                    username: faker.internet.userName().toLowerCase()
                }
                const response = await request.post('users/register', {
                    data: registerData
                })
                expect(response.status()).toBe(expected);
                const body = await response.json();
                expect(body.errors.length).toBe(errors.length);

                // Проверяем каждую ожидаемую ошибку
                errors.forEach((expectedError, index) => {
                expect(body.errors[index]).toEqual(expectedError);
            })
        })
    })
})