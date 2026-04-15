import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

export type TestUser = {
    email: string;
    password: string;
    role: string;
    username: string;
};

export function generateValidUser(): TestUser {
    return {
        email: faker.internet.email().toLowerCase(),
        password: process.env.ADMIN_USER_PASSWORD as string,
        role: 'ADMIN',
        username: faker.internet.userName().toLowerCase()
    };
}

export function generateValidRegularUser(): TestUser {
    return {
        email: faker.internet.email().toLowerCase(),
        password: process.env.ADMIN_USER_PASSWORD as string,
        role: 'USER',
        username: faker.internet.userName().toLowerCase()
    };
}