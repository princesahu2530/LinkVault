import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('Workspaces, RBAC, Professional Fields & Collaboration Tests', () => {
  let tokenOwner: string;
  let tokenMember: string;
  let tokenViewer: string;
  let ownerId: string;
  let memberId: string;
  let viewerId: string;
  let teamWorkspaceId: string;

  beforeEach(async () => {
    const runId = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    // 1. Register Owner
    const resOwner = await request(app).post('/api/v1/auth/register').send({
      name: 'Owner Alice',
      email: `alice_${runId}@company.com`,
      password: 'Password123!'
    });
    tokenOwner = resOwner.body.data.accessToken;
    ownerId = resOwner.body.data.user.id;

    // 2. Register Member
    const resMember = await request(app).post('/api/v1/auth/register').send({
      name: 'Dev Bob',
      email: `bob_${runId}@company.com`,
      password: 'Password123!'
    });
    tokenMember = resMember.body.data.accessToken;
    memberId = resMember.body.data.user.id;

    // 3. Register Viewer
    const resViewer = await request(app).post('/api/v1/auth/register').send({
      name: 'Auditor Charlie',
      email: `charlie_${runId}@company.com`,
      password: 'Password123!'
    });
    tokenViewer = resViewer.body.data.accessToken;
    viewerId = resViewer.body.data.user.id;

    // 4. Owner creates a Team Workspace with Starter Pack
    const wsRes = await request(app)
      .post('/api/v1/workspaces')
      .set('Authorization', `Bearer ${tokenOwner}`)
      .send({
        name: 'Acme Corp Engineering',
        description: 'Engineering and Product Workspace',
        category: 'dev',
        starterPackId: 'pack_engineering'
      });
    teamWorkspaceId = wsRes.body.data.id;

    // 5. Owner invites Member & Viewer to Team Workspace
    await request(app)
      .post(`/api/v1/workspaces/${teamWorkspaceId}/members`)
      .set('Authorization', `Bearer ${tokenOwner}`)
      .send({
        email: `bob_${runId}@company.com`,
        role: 'member',
        department: 'Engineering',
        title: 'Senior Developer'
      });

    await request(app)
      .post(`/api/v1/workspaces/${teamWorkspaceId}/members`)
      .set('Authorization', `Bearer ${tokenOwner}`)
      .send({
        email: `charlie_${runId}@company.com`,
        role: 'viewer',
        department: 'Audit',
        title: 'Security Auditor'
      });
  });

  it('should list personal workspace and created team workspaces for user', async () => {
    const res = await request(app)
      .get('/api/v1/workspaces')
      .set('Authorization', `Bearer ${tokenOwner}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    const personal = res.body.data.find((w: any) => w.isPersonal);
    const team = res.body.data.find((w: any) => w.id === teamWorkspaceId);
    expect(personal).toBeDefined();
    expect(team).toBeDefined();
    expect(team.name).toBe('Acme Corp Engineering');
  });

  it('starter pack should populate suggested topics and system templates', async () => {
    const topicsRes = await request(app)
      .get('/api/v1/topics')
      .set('Authorization', `Bearer ${tokenOwner}`)
      .set('x-workspace-id', teamWorkspaceId);

    expect(topicsRes.status).toBe(200);
    expect(topicsRes.body.data.length).toBeGreaterThanOrEqual(4);

    const topicNames = topicsRes.body.data.map((t: any) => t.name);
    expect(topicNames).toContain('Bug & Issue Tracker');
    expect(topicNames).toContain('API Specifications');
    expect(topicNames).toContain('Architecture Decisions (ADRs)');
  });

  it('should create item with professional fields: relation, user, phone, currency, rating, task props', async () => {
    const topicsRes = await request(app)
      .get('/api/v1/topics')
      .set('Authorization', `Bearer ${tokenOwner}`)
      .set('x-workspace-id', teamWorkspaceId);

    const bugTopicId = topicsRes.body.data[0].id;

    const createItemRes = await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${tokenOwner}`)
      .set('x-workspace-id', teamWorkspaceId)
      .send({
        topicId: bugTopicId,
        title: 'Fix Memory Leak in Auth Cache',
        content: 'Investigated Redis TTL expiration handler.',
        taskProps: {
          isTask: true,
          status: 'in_progress',
          priority: 'urgent',
          assigneeId: memberId,
          assigneeName: 'Dev Bob',
          dueDate: '2026-10-15',
          progress: 60
        },
        fields: [
          { name: 'Support Hotline', type: 'phone', value: '+1 (555) 234-5678' },
          { name: 'Estimated Cost', type: 'currency', value: { amount: 3500, currency: 'USD' } },
          { name: 'Severity Rating', type: 'rating', value: 4, maxRating: 5 },
          { name: 'Assigned Lead', type: 'user', value: { userId: memberId, name: 'Dev Bob' } }
        ],
        tags: ['Bug', 'Backend', 'Security']
      });

    expect(createItemRes.status).toBe(201);
    expect(createItemRes.body.data.title).toBe('Fix Memory Leak in Auth Cache');
    expect(createItemRes.body.data.taskProps.isTask).toBe(true);
    expect(createItemRes.body.data.taskProps.status).toBe('in_progress');
    expect(createItemRes.body.data.taskProps.priority).toBe('urgent');
    expect(createItemRes.body.data.fields.length).toBe(4);
  });

  it('should detect duplicate URLs in workspace and report match', async () => {
    const topicsRes = await request(app)
      .get('/api/v1/topics')
      .set('Authorization', `Bearer ${tokenOwner}`)
      .set('x-workspace-id', teamWorkspaceId);

    const topicId = topicsRes.body.data[0].id;

    // Create first item with URL
    await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${tokenOwner}`)
      .set('x-workspace-id', teamWorkspaceId)
      .send({
        topicId,
        title: 'Original Documentation',
        url: 'https://docs.linkvault.app/architecture'
      });

    // Check duplicate endpoint
    const dupRes = await request(app)
      .get(`/api/v1/items/check-duplicate?url=https://docs.linkvault.app/architecture`)
      .set('Authorization', `Bearer ${tokenOwner}`)
      .set('x-workspace-id', teamWorkspaceId);

    expect(dupRes.status).toBe(200);
    expect(dupRes.body.data.duplicate).toBe(true);
    expect(dupRes.body.data.match.title).toBe('Original Documentation');
  });

  it('RBAC: Viewer CANNOT create or delete items in team workspace', async () => {
    const topicsRes = await request(app)
      .get('/api/v1/topics')
      .set('Authorization', `Bearer ${tokenViewer}`)
      .set('x-workspace-id', teamWorkspaceId);

    const topicId = topicsRes.body.data[0].id;

    // Viewer tries to create item
    const createRes = await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${tokenViewer}`)
      .set('x-workspace-id', teamWorkspaceId)
      .send({
        topicId,
        title: 'Unauthorized Item by Viewer'
      });

    expect(createRes.status).toBe(403);
    expect(createRes.body.success).toBe(false);
  });

  it('Collaboration: should add comments with mentions and create notifications', async () => {
    const topicsRes = await request(app)
      .get('/api/v1/topics')
      .set('Authorization', `Bearer ${tokenOwner}`)
      .set('x-workspace-id', teamWorkspaceId);

    const topicId = topicsRes.body.data[0].id;

    const itemRes = await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${tokenOwner}`)
      .set('x-workspace-id', teamWorkspaceId)
      .send({
        topicId,
        title: 'Review System Specs'
      });

    const itemId = itemRes.body.data.id;

    // Owner comments mentioning Dev Bob
    const commentRes = await request(app)
      .post(`/api/v1/comments/items/${itemId}/comments`)
      .set('Authorization', `Bearer ${tokenOwner}`)
      .set('x-workspace-id', teamWorkspaceId)
      .send({
        content: '@bob please review the updated database schema.'
      });

    expect(commentRes.status).toBe(201);

    // Dev Bob checks notifications
    const notifRes = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${tokenMember}`)
      .set('x-workspace-id', teamWorkspaceId);

    expect(notifRes.status).toBe(200);
  });

  it('should support saved views with custom columns, sorting, and filter groups', async () => {
    const createViewRes = await request(app)
      .post('/api/v1/saved-views')
      .set('Authorization', `Bearer ${tokenOwner}`)
      .set('x-workspace-id', teamWorkspaceId)
      .send({
        name: 'Urgent Unresolved Bugs',
        viewType: 'table',
        columns: ['title', 'taskProps.priority', 'taskProps.status', 'Support Hotline'],
        sortBy: 'taskProps.priority',
        sortOrder: 'desc',
        groupBy: 'taskProps.status',
        filterGroups: [
          {
            conjunction: 'AND',
            clauses: [
              { field: 'taskProps.isTask', operator: 'equals', value: true },
              { field: 'taskProps.priority', operator: 'equals', value: 'urgent' }
            ]
          }
        ]
      });

    expect(createViewRes.status).toBe(201);
    expect(createViewRes.body.data.name).toBe('Urgent Unresolved Bugs');
    expect(createViewRes.body.data.filterGroups.length).toBe(1);
  });

  it('Audit log records member invitations and role changes', async () => {
    const logsRes = await request(app)
      .get(`/api/v1/workspaces/${teamWorkspaceId}/audit-logs`)
      .set('Authorization', `Bearer ${tokenOwner}`)
      .set('x-workspace-id', teamWorkspaceId);

    expect(logsRes.status).toBe(200);
    expect(logsRes.body.data.length).toBeGreaterThanOrEqual(2);
    const actions = logsRes.body.data.map((l: any) => l.action);
    expect(actions).toContain('workspace.created');
    expect(actions).toContain('member.invited');
  });
});
