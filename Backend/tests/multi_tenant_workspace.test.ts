import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('Multi-Tenant Workspace & Role Isolation Architecture Tests', () => {
  const runId = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  let pmToken: string;
  let pmUserId: string;
  let pgPlatformWsId: string;

  beforeEach(async () => {
    // 1. PM registers (Amit Sharma)
    const pmRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Amit Sharma',
      email: `amit_${runId}@pgplatform.example`,
      password: 'Password123!'
    });
    pmToken = pmRes.body.data.accessToken;
    pmUserId = pmRes.body.data.user.id;

    // 2. PM creates PG Platform Workspace
    const wsRes = await request(app)
      .post('/api/v1/workspaces')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        name: 'PG Platform – Client Project',
        slug: `pg-platform-${runId}`,
        description: 'SaaS Property and Tenant Management Platform',
        category: 'client_project'
      });
    pgPlatformWsId = wsRes.body.data.id;

    // 3. PM invites HR (Priya Singh) as Admin - BEFORE Priya has registered! (Pending user placeholder)
    await request(app)
      .post(`/api/v1/workspaces/${pgPlatformWsId}/members`)
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        email: `priya_${runId}@pgplatform.example`,
        role: 'admin',
        title: 'HR Manager',
        department: 'HR & Talent'
      });

    // 4. PM invites Team Lead (Rahul Mehta) as Manager - BEFORE Rahul has registered!
    await request(app)
      .post(`/api/v1/workspaces/${pgPlatformWsId}/members`)
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        email: `rahul_${runId}@pgplatform.example`,
        role: 'manager',
        title: 'Team Lead',
        department: 'Engineering'
      });

    // 5. PM invites Client Representative (Suresh Patel) as Viewer
    await request(app)
      .post(`/api/v1/workspaces/${pgPlatformWsId}/members`)
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        email: `suresh_${runId}@pgtechnologies.example`,
        role: 'viewer',
        title: 'Client Representative',
        department: 'Client Stakeholder'
      });
  });

  it('1. Invited pending user placeholder can complete registration and immediately access invited workspace', async () => {
    // Priya registers with her invited email
    const regRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Priya Singh',
      email: `priya_${runId}@pgplatform.example`,
      password: 'Aa@123456'
    });

    expect(regRes.status).toBe(201);
    expect(regRes.body.data.user.email).toBe(`priya_${runId}@pgplatform.example`);
    expect(regRes.body.data.workspaces.length).toBeGreaterThanOrEqual(2); // Personal Vault + PG Platform

    const priyaToken = regRes.body.data.accessToken;

    // Priya queries workspaces
    const wsListRes = await request(app)
      .get('/api/v1/workspaces')
      .set('Authorization', `Bearer ${priyaToken}`);

    expect(wsListRes.status).toBe(200);
    const pgWs = wsListRes.body.data.find((w: any) => w.id === pgPlatformWsId);
    expect(pgWs).toBeDefined();
    expect(pgWs.myRole).toBe('admin');
  });

  it('2. Login with workspaceSlug directly resolves active workspace and role context', async () => {
    // First, Rahul logs in for the first time setting his password
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: `rahul_${runId}@pgplatform.example`,
      password: 'Aa@123456',
      workspaceSlug: `pg-platform-${runId}`
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.activeWorkspaceId).toBe(pgPlatformWsId);
    expect(loginRes.body.data.workspaceRole).toBe('manager');
    expect(loginRes.body.data.workspacePermissions).toContain('items.create');
  });

  it('3. Strict Data Boundary Rule: Personal items DO NOT leak into Team workspace, and vice-versa', async () => {
    // PM creates an item in Personal Workspace
    const personalWsRes = await request(app)
      .get('/api/v1/workspaces')
      .set('Authorization', `Bearer ${pmToken}`);
    const personalWs = personalWsRes.body.data.find((w: any) => w.isPersonal);

    // Create topic in Personal Workspace
    const personalTopicRes = await request(app)
      .post('/api/v1/topics')
      .set('Authorization', `Bearer ${pmToken}`)
      .set('x-workspace-id', personalWs.id)
      .send({
        name: 'My Private Financial Notes'
      });
    const personalTopicId = personalTopicRes.body.data.id;

    // Create item in Personal Topic
    await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${pmToken}`)
      .set('x-workspace-id', personalWs.id)
      .send({
        topicId: personalTopicId,
        title: 'Secret Personal Bank Info'
      });

    // Create topic in PG Platform Workspace
    const teamTopicRes = await request(app)
      .post('/api/v1/topics')
      .set('Authorization', `Bearer ${pmToken}`)
      .set('x-workspace-id', pgPlatformWsId)
      .send({
        name: '06 Backend Development'
      });
    const teamTopicId = teamTopicRes.body.data.id;

    // Create item in Team Topic
    await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${pmToken}`)
      .set('x-workspace-id', pgPlatformWsId)
      .send({
        topicId: teamTopicId,
        title: 'API Authentication & Multi-Tenancy Architecture'
      });

    // Query topics in Team Workspace -> must ONLY return PG Platform topics, NOT personal
    const teamTopicsQuery = await request(app)
      .get('/api/v1/topics')
      .set('Authorization', `Bearer ${pmToken}`)
      .set('x-workspace-id', pgPlatformWsId);

    expect(teamTopicsQuery.status).toBe(200);
    expect(teamTopicsQuery.body.data.some((t: any) => t.id === personalTopicId)).toBe(false);
    expect(teamTopicsQuery.body.data.some((t: any) => t.id === teamTopicId)).toBe(true);

    // Query items in Team Workspace -> must ONLY return PG Platform items
    const teamItemsQuery = await request(app)
      .get('/api/v1/items')
      .set('Authorization', `Bearer ${pmToken}`)
      .set('x-workspace-id', pgPlatformWsId);

    expect(teamItemsQuery.status).toBe(200);
    const itemTitles = teamItemsQuery.body.data.map((i: any) => i.title);
    expect(itemTitles).toContain('API Authentication & Multi-Tenancy Architecture');
    expect(itemTitles).not.toContain('Secret Personal Bank Info');
  });

  it('4. Role-based Access Control: Viewer CANNOT create topics or items in Team Workspace', async () => {
    // Register / login Suresh (Viewer)
    const sureshRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Suresh Patel',
      email: `suresh_${runId}@pgtechnologies.example`,
      password: 'Password123!'
    });
    const sureshToken = sureshRes.body.data.accessToken;

    // Viewer tries to create topic in PG Platform Workspace -> 403 Forbidden
    const createTopicRes = await request(app)
      .post('/api/v1/topics')
      .set('Authorization', `Bearer ${sureshToken}`)
      .set('x-workspace-id', pgPlatformWsId)
      .send({
        name: 'Hacked Topic by Viewer'
      });

    // Viewer gets permission error or cannot write
    expect([403, 404]).toContain(createTopicRes.status);

    // Viewer CAN view topics
    const getTopicsRes = await request(app)
      .get('/api/v1/topics')
      .set('Authorization', `Bearer ${sureshToken}`)
      .set('x-workspace-id', pgPlatformWsId);

    expect(getTopicsRes.status).toBe(200);
  });
});
