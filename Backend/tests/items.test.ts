import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('Flexible Items & Custom Fields API', () => {
  let token: string;
  let topicId: string;

  beforeEach(async () => {
    // Register user
    const authRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'developer@linkvault.test',
        password: 'Password123!',
        name: 'Dev User'
      });

    token = authRes.body.data.accessToken;

    // Create topic
    const topicRes = await request(app)
      .post('/api/v1/topics')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Fullstack Research',
        description: 'Frontend & Backend concepts'
      });

    topicId = topicRes.body.data.id;
  });

  it('should create a Text-only Item without URL', async () => {
    const res = await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${token}`)
      .send({
        topicId,
        title: 'React Important Concepts',
        content: 'useState\nuseEffect\nuseMemo\nuseCallback',
        tags: ['React', 'Frontend']
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('React Important Concepts');
    expect(res.body.data.content).toContain('useState');
    expect(res.body.data.tags).toContain('React');
  });

  it('should create an Item with URL + Custom Fields (Client, Deadline, Status, Price)', async () => {
    const res = await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${token}`)
      .send({
        topicId,
        title: 'Client Project Alpha',
        content: 'Main project description notes',
        fields: [
          { name: 'Website', type: 'url', value: 'https://example.com' },
          { name: 'Client', type: 'text', value: 'ABC Company' },
          { name: 'Deadline', type: 'date', value: '2026-10-30' },
          { name: 'Status', type: 'select', options: ['Planning', 'In Progress', 'Completed'], value: 'In Progress' },
          { name: 'Budget', type: 'number', value: 4999 },
          { name: 'Completed', type: 'boolean', value: false }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.data.fields).toHaveLength(6);
    expect(res.body.data.fields.find((f: any) => f.name === 'Client').value).toBe('ABC Company');
    expect(res.body.data.fields.find((f: any) => f.name === 'Budget').value).toBe(4999);
    expect(res.body.data.fields.find((f: any) => f.name === 'Completed').value).toBe(false);
  });

  it('should create an Item with Code snippet and JSON fields', async () => {
    const res = await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${token}`)
      .send({
        topicId,
        title: 'Async Fetch Hook',
        fields: [
          {
            name: 'API Hook',
            type: 'code',
            value: { language: 'javascript', code: 'const fetchData = async () => fetch(url);' }
          },
          {
            name: 'Config JSON',
            type: 'json',
            value: JSON.stringify({ timeout: 5000, retries: 3 })
          }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.data.fields[0].type).toBe('code');
    expect(res.body.data.fields[0].value.code).toContain('fetchData');
    expect(res.body.data.fields[1].type).toBe('json');
  });

  it('should support multiple URLs in a single item', async () => {
    const res = await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${token}`)
      .send({
        topicId,
        title: 'Project Ecosystem',
        fields: [
          { name: 'GitHub Repo', type: 'url', value: 'https://github.com/example/repo' },
          { name: 'Live App', type: 'url', value: 'https://example.com' },
          { name: 'Docs', type: 'url', value: 'https://docs.example.com' },
          { name: 'Figma', type: 'url', value: 'https://figma.com/file/123' }
        ]
      });

    expect(res.status).toBe(201);
    const urlFields = res.body.data.fields.filter((f: any) => f.type === 'url');
    expect(urlFields).toHaveLength(4);
  });

  it('should support updating individual fields via PATCH /items/:id/fields/:fieldId', async () => {
    const createRes = await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${token}`)
      .send({
        topicId,
        title: 'Field Update Test',
        fields: [{ name: 'Status', type: 'text', value: 'Planning' }]
      });

    const fieldId = createRes.body.data.fields[0].fieldId;
    const itemId = createRes.body.data.id;

    const updateRes = await request(app)
      .patch(`/api/v1/items/${itemId}/fields/${fieldId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ value: 'Completed' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.fields[0].value).toBe('Completed');
  });

  it('should support duplicate, favorite, archive, and move operations', async () => {
    const itemRes = await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${token}`)
      .send({
        topicId,
        title: 'Original Item',
        content: 'Original content'
      });

    const itemId = itemRes.body.data.id;

    // Favorite
    const favRes = await request(app)
      .patch(`/api/v1/items/${itemId}/favorite`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isFavorite: true });
    expect(favRes.body.data.isFavorite).toBe(true);

    // Duplicate
    const dupRes = await request(app)
      .post(`/api/v1/items/${itemId}/duplicate`)
      .set('Authorization', `Bearer ${token}`);
    expect(dupRes.status).toBe(201);
    expect(dupRes.body.data.title).toBe('Original Item (Copy)');

    // Archive
    const archRes = await request(app)
      .patch(`/api/v1/items/${itemId}/archive`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isArchived: true });
    expect(archRes.body.data.isArchived).toBe(true);
  });

  it('should support bulk operations (archive, favorite, tag, delete)', async () => {
    const item1 = await request(app).post('/api/v1/items').set('Authorization', `Bearer ${token}`).send({ topicId, title: 'Item 1' });
    const item2 = await request(app).post('/api/v1/items').set('Authorization', `Bearer ${token}`).send({ topicId, title: 'Item 2' });

    const bulkRes = await request(app)
      .post('/api/v1/items/bulk')
      .set('Authorization', `Bearer ${token}`)
      .send({
        itemIds: [item1.body.data.id, item2.body.data.id],
        action: 'favorite'
      });

    expect(bulkRes.status).toBe(200);
    expect(bulkRes.body.data.count).toBe(2);
  });
});
