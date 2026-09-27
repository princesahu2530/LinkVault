import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('User Isolation & Authorization Security (User A vs User B)', () => {
  let tokenUserA: string;
  let tokenUserB: string;
  let topicUserAId: string;
  let linkUserAId: string;

  beforeEach(async () => {
    // Register User A
    const resA = await request(app).post('/api/v1/auth/register').send({
      name: 'User A',
      email: 'user_a@test.com',
      password: 'Password123!'
    });
    tokenUserA = resA.body.data.accessToken;

    // Register User B
    const resB = await request(app).post('/api/v1/auth/register').send({
      name: 'User B',
      email: 'user_b@test.com',
      password: 'Password123!'
    });
    tokenUserB = resB.body.data.accessToken;

    // User A creates Topic
    const topicRes = await request(app)
      .post('/api/v1/topics')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        name: "User A's Private Vault",
        description: 'Top secret links'
      });
    topicUserAId = topicRes.body.data.id;

    // User A creates Link
    const linkRes = await request(app)
      .post(`/api/v1/topics/${topicUserAId}/links`)
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        title: 'Secret Resource',
        url: 'https://secret.example.com',
        description: 'Classified notes',
        tags: ['Secret']
      });
    linkUserAId = linkRes.body.data.id;
  });

  it('User B CANNOT view User A topic by ID', async () => {
    const res = await request(app)
      .get(`/api/v1/topics/${topicUserAId}`)
      .set('Authorization', `Bearer ${tokenUserB}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('User B CANNOT view User A links inside topic', async () => {
    const res = await request(app)
      .get(`/api/v1/topics/${topicUserAId}/links`)
      .set('Authorization', `Bearer ${tokenUserB}`);

    if (res.status === 200) {
      expect(res.body.data.length).toBe(0);
    } else {
      expect(res.status).toBe(404);
    }
  });

  it('User B CANNOT modify User A topic', async () => {
    const res = await request(app)
      .patch(`/api/v1/topics/${topicUserAId}`)
      .set('Authorization', `Bearer ${tokenUserB}`)
      .send({ name: 'Hacked Title' });

    expect(res.status).toBe(404);
  });

  it('User B CANNOT delete User A topic', async () => {
    const res = await request(app)
      .delete(`/api/v1/topics/${topicUserAId}`)
      .set('Authorization', `Bearer ${tokenUserB}`);

    expect(res.status).toBe(404);
  });

  it('User B CANNOT modify User A link', async () => {
    const res = await request(app)
      .patch(`/api/v1/links/${linkUserAId}`)
      .set('Authorization', `Bearer ${tokenUserB}`)
      .send({ title: 'Hacked Link Title' });

    expect(res.status).toBe(404);
  });

  it('User B CANNOT delete User A link', async () => {
    const res = await request(app)
      .delete(`/api/v1/links/${linkUserAId}`)
      .set('Authorization', `Bearer ${tokenUserB}`);

    expect(res.status).toBe(404);
  });

  it('User B CANNOT see User A items in Global Search', async () => {
    const res = await request(app)
      .get('/api/v1/search?q=Secret')
      .set('Authorization', `Bearer ${tokenUserB}`);

    expect(res.status).toBe(200);
    expect(res.body.data.topics.length).toBe(0);
    expect(res.body.data.links.length).toBe(0);
  });

  it('User B CANNOT export User A data', async () => {
    const res = await request(app)
      .get(`/api/v1/export/json?topicId=${topicUserAId}`)
      .set('Authorization', `Bearer ${tokenUserB}`);

    expect(res.status).toBe(200);
    const parsed = JSON.parse(res.text);
    expect(parsed.topics.length).toBe(0);
  });

  it('User B CANNOT access, edit, or delete User A items or templates', async () => {
    // User A creates an Item with custom fields
    const itemRes = await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        topicId: topicUserAId,
        title: 'User A Secret Item',
        fields: [{ name: 'Secret Code', type: 'text', value: 'ALPHA-999' }]
      });

    const itemUserAId = itemRes.body.data.id;

    // User A creates a Template
    const tmplRes = await request(app)
      .post('/api/v1/templates')
      .set('Authorization', `Bearer ${tokenUserA}`)
      .send({
        name: 'User A Secret Template',
        fields: [{ name: 'SecretField', type: 'text' }]
      });

    const tmplUserAId = tmplRes.body.data.id;

    // User B tries to get item
    const getItemRes = await request(app)
      .get(`/api/v1/items/${itemUserAId}`)
      .set('Authorization', `Bearer ${tokenUserB}`);
    expect(getItemRes.status).toBe(404);

    // User B tries to update item
    const patchItemRes = await request(app)
      .patch(`/api/v1/items/${itemUserAId}`)
      .set('Authorization', `Bearer ${tokenUserB}`)
      .send({ title: 'Hacked Title' });
    expect(patchItemRes.status).toBe(404);

    // User B tries to delete item
    const delItemRes = await request(app)
      .delete(`/api/v1/items/${itemUserAId}`)
      .set('Authorization', `Bearer ${tokenUserB}`);
    expect(delItemRes.status).toBe(404);

    // User B tries to access template
    const getTmplRes = await request(app)
      .get(`/api/v1/templates/${tmplUserAId}`)
      .set('Authorization', `Bearer ${tokenUserB}`);
    expect(getTmplRes.status).toBe(404);

    // User B tries to delete template
    const delTmplRes = await request(app)
      .delete(`/api/v1/templates/${tmplUserAId}`)
      .set('Authorization', `Bearer ${tokenUserB}`);
    expect(delTmplRes.status).toBe(404);
  });
});
