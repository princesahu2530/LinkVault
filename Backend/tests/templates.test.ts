import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('Template System & Topic-Level Templates', () => {
  let token: string;

  beforeEach(async () => {
    const authRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'templateuser@linkvault.test',
        password: 'Password123!',
        name: 'Template Tester'
      });

    token = authRes.body.data.accessToken;
  });

  it('should create, fetch, update, duplicate, and delete templates', async () => {
    // 1. Create
    const createRes = await request(app)
      .post('/api/v1/templates')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Client Project Template',
        description: 'Standard fields for client work',
        fields: [
          { name: 'Client', type: 'text', required: true, position: 0 },
          { name: 'Website', type: 'url', required: false, position: 1 },
          { name: 'Deadline', type: 'date', required: false, position: 2 },
          { name: 'Status', type: 'select', options: ['Planning', 'In Progress', 'Completed'], defaultValue: 'Planning', position: 3 }
        ]
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.name).toBe('Client Project Template');
    expect(createRes.body.data.fields).toHaveLength(4);

    const templateId = createRes.body.data.id;

    // 2. Fetch list
    const listRes = await request(app)
      .get('/api/v1/templates')
      .set('Authorization', `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data).toHaveLength(1);

    // 3. Duplicate
    const dupRes = await request(app)
      .post(`/api/v1/templates/${templateId}/duplicate`)
      .set('Authorization', `Bearer ${token}`);
    expect(dupRes.status).toBe(201);
    expect(dupRes.body.data.name).toBe('Client Project Template (Copy)');

    // 4. Delete duplicate
    const delRes = await request(app)
      .delete(`/api/v1/templates/${dupRes.body.data.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(delRes.status).toBe(200);
  });

  it('should auto-populate fields when creating an item with a templateId', async () => {
    // Create template
    const tmplRes = await request(app)
      .post('/api/v1/templates')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Research Note',
        fields: [
          { name: 'Author', type: 'text', position: 0 },
          { name: 'Source URL', type: 'url', position: 1 },
          { name: 'Rating', type: 'number', defaultValue: 5, position: 2 }
        ]
      });

    const templateId = tmplRes.body.data.id;

    // Create item using template
    const itemRes = await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${token}`)
      .send({
        templateId,
        title: 'Deep Learning Paper',
        fields: [
          { name: 'Author', type: 'text', value: 'Geoffrey Hinton' },
          { name: 'Source URL', type: 'url', value: 'https://arxiv.org' }
        ]
      });

    expect(itemRes.status).toBe(201);
    expect(itemRes.body.data.fields).toHaveLength(3);
    const authorField = itemRes.body.data.fields.find((f: any) => f.name === 'Author');
    const ratingField = itemRes.body.data.fields.find((f: any) => f.name === 'Rating');
    expect(authorField.value).toBe('Geoffrey Hinton');
    expect(ratingField.value).toBe(5);
  });
});
