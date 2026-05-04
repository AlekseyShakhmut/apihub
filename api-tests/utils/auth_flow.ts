import { expect, type APIRequestContext } from '@playwright/test';
import type { TestUser } from './types';

export async function registerUser(request: APIRequestContext, user: TestUser) {
    return request.post('users/register', { data: user });
}

export async function loginUser(
    request: APIRequestContext,
    credentials: { username: string; password: string } | { email: string; password: string }
) {
    return request.post('users/login', { data: credentials });
}

export function parseAccessToken(loginBody: { data?: { accessToken?: string }; accessToken?: string }): string {
    const token = loginBody.data?.accessToken ?? loginBody.accessToken;
    if (!token) {
        throw new Error('Login response has no accessToken');
    }
    return token;
}

/** Регистрация + логин по username (как в фикстуре и большинстве e2e сценариев). */
export async function registerAndLoginWithUsername(
    request: APIRequestContext,
    user: TestUser
): Promise<{ user: TestUser; accessToken: string }> {
    const registerRes = await registerUser(request, user);
    expect(registerRes.status()).toBe(201);

    const loginRes = await loginUser(request, { username: user.username, password: user.password });
    expect(loginRes.status()).toBe(200);

    const body = await loginRes.json();
    return { user, accessToken: parseAccessToken(body) };
}
