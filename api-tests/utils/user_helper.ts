import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

// ✅ Утверждаем, что значение точно есть (если нет — ошибка)
const ADMIN_USER_PASSWORD = process.env.ADMIN_USER_PASSWORD!;
if (!ADMIN_USER_PASSWORD) {
    throw new Error('❌ ADMIN_USER_PASSWORD не задан в .env файле');
}

export function generateValidUser(overrides = {}) {
    return {
        email: faker.internet.email().toLowerCase(),
        password: ADMIN_USER_PASSWORD,  // ✅ тип string
        role: "ADMIN",
        username: faker.internet.userName().toLowerCase(),
        ...overrides
    };
}