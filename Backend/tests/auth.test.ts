import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { REFRESH_COOKIE_NAME } from '../src/utils/cookies.js';

const app = createApp();

describe('Authentication Flow & Security Tests', () => {
  const testUser = {
    name: 'Alice Developer',
    email: 'alice@example.com',
    password: 'Password123!'
  };

  it('should register a new user successfully and return access token + user info', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.body.data.accessToken).toBeDefined();

    // Verify refresh cookie set
    const cookies = res.headers['set-cookie'] || [];
    const hasRefreshCookie = cookies.some((c: string) => c.includes(REFRESH_COOKIE_NAME));
    expect(hasRefreshCookie).toBe(true);
  });

  it('should reject duplicate email registration', async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);

    const duplicateRes = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.success).toBe(false);
    expect(duplicateRes.body.error.code).toBe('CONFLICT');
  });

  it('should login an existing user with valid credentials', async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.accessToken).toBeDefined();
    expect(loginRes.body.data.user.email).toBe(testUser.email.toLowerCase());
  });

  it('should reject login with wrong password', async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);

    const failRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'wrong_password_999'
      });

    expect(failRes.status).toBe(401);
    expect(failRes.body.success).toBe(false);
  });

  it('should refresh token and rotate refresh session', async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send(testUser);
    const cookies = regRes.headers['set-cookie'];

    const refreshRes = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', cookies);

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.success).toBe(true);
    expect(refreshRes.body.data.accessToken).toBeDefined();
    expect(refreshRes.headers['set-cookie']).toBeDefined();
  });

  it('should access protected /api/v1/auth/me with valid bearer token', async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send(testUser);
    const token = regRes.body.data.accessToken;

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.user.email).toBe(testUser.email.toLowerCase());
  });

  it('should reject unauthenticated request to protected endpoints', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
