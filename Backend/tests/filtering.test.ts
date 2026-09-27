import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('Dynamic Field-Aware Filtering & Search Tests', () => {
  let token: string;
  let topicId: string;

  beforeEach(async () => {
    const authRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'searcher@linkvault.test',
        password: 'Password123!',
        name: 'Search Tester'
      });

    token = authRes.body.data.accessToken;

    const topicRes = await request(app)
      .post('/api/v1/topics')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Filtered Project Hub' });

    topicId = topicRes.body.data.id;

    // Create 3 diverse items
    await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${token}`)
      .send({
        topicId,
        title: 'Project Alpha',
        content: 'Building the next-gen web app',
        tags: ['Web', 'Alpha'],
        fields: [
          { name: 'Client', type: 'text', value: 'ABC Corp' },
          { name: 'Status', type: 'select', value: 'In Progress' },
          { name: 'Budget', type: 'number', value: 5000 },
          { name: 'Deadline', type: 'date', value: '2026-10-15' }
        ]
      });

    await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${token}`)
      .send({
        topicId,
        title: 'Project Beta',
        content: 'Mobile app deployment',
        tags: ['Mobile', 'Beta'],
        fields: [
          { name: 'Client', type: 'text', value: 'XYZ Global' },
          { name: 'Status', type: 'select', value: 'Completed' },
          { name: 'Budget', type: 'number', value: 12000 },
          { name: 'Deadline', type: 'date', value: '2026-11-20' }
        ]
      });

    await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${token}`)
      .send({
        topicId,
        title: 'Project Gamma',
        content: 'Internal tooling',
        tags: ['Tools'],
        fields: [
          { name: 'Client', type: 'text', value: 'Internal' },
          { name: 'Status', type: 'select', value: 'In Progress' },
          { name: 'Budget', type: 'number', value: 2500 },
          { name: 'Deadline', type: 'date', value: '2026-12-01' }
        ]
      });
  });

  it('should filter items by custom field "Status" equals "Completed"', async () => {
    const res = await request(app)
      .get(`/api/v1/items?field=Status&operator=equals&value=Completed`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Project Beta');
  });

  it('should filter items by custom field "Budget" greaterThan 4000', async () => {
    const res = await request(app)
      .get(`/api/v1/items?field=Budget&operator=greaterThan&value=4000`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    const titles = res.body.data.map((i: any) => i.title);
    expect(titles).toContain('Project Alpha');
    expect(titles).toContain('Project Beta');
  });

  it('should search across custom field values ("XYZ Global")', async () => {
    const res = await request(app)
      .get(`/api/v1/search?q=XYZ`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].title).toBe('Project Beta');
  });
});
