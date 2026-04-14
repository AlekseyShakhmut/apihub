import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

const DEFAULT_TEST_PASSWORD = 'Qwerty123!';
const TEST_PASSWORD =
    process.env.TEST_USER_PASSWORD ||
    process.env.ADMIN_USER_PASSWORD ||
    DEFAULT_TEST_PASSWORD;

export function generateValidUser(overrides = {}) {
    return {
        email: faker.internet.email().toLowerCase(),
        password: TEST_PASSWORD,
        role: "ADMIN",
        username: faker.internet.userName().toLowerCase(),
        ...overrides
    };
}