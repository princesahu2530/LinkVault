import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('Topic & Link CRUD Integration Tests', () => {
  let authToken: string;
  let topicId: string;

  beforeEach(async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Developer',
      email: 'dev@example.com',
      password: 'Password123!'
    });
    authToken = res.body.data.accessToken;

    const topicRes = await request(app)
      .post('/api/v1/topics')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'AI Tools',
        description: 'AI resources',
        icon: 'Bot',
        color: '#6366f1'
      });
    topicId = topicRes.body.data.id;
  });

  it('should create and retrieve topics', async () => {
    const res = await request(app)
      .get('/api/v1/topics')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe('AI Tools');
  });

  it('should create links inside topic', async () => {
    const res = await request(app)
      .post(`/api/v1/topics/${topicId}/links`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'ChatGPT',
        url: 'https://chatgpt.com',
        description: 'AI assistant by OpenAI',
        tags: ['AI', 'OpenAI']
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('ChatGPT');
    expect(res.body.data.topicId).toBe(topicId);
  });

  it('should soft-delete topic to trash and restore it', async () => {
    const deleteRes = await request(app)
      .delete(`/api/v1/topics/${topicId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(deleteRes.status).toBe(200);

    // Should not appear in active topics
    const activeRes = await request(app)
      .get('/api/v1/topics')
      .set('Authorization', `Bearer ${authToken}`);
    expect(activeRes.body.data.length).toBe(0);

    // Should appear in trash
    const trashRes = await request(app)
      .get('/api/v1/trash')
      .set('Authorization', `Bearer ${authToken}`);
    expect(trashRes.body.data.topics.length).toBe(1);

    // Restore
    const restoreRes = await request(app)
      .post(`/api/v1/topics/${topicId}/restore`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(restoreRes.status).toBe(200);

    const activeAfterRestore = await request(app)
      .get('/api/v1/topics')
      .set('Authorization', `Bearer ${authToken}`);
    expect(activeAfterRestore.body.data.length).toBe(1);
  });
});
