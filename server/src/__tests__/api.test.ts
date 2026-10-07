import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../server.js';

describe('TeamFlow API Endpoints Integration Tests', () => {
  let authToken: string;
  let createdProjectId: string;
  let createdTaskId: string;

  const testUser = {
    name: 'Test Runner',
    email: `test-${Date.now()}@teamflow.demo`,
    password: 'TestPassword123!',
  };

  it('POST /api/auth/register should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.token).toBeDefined();

    authToken = res.body.data.token;
  });

  it('POST /api/auth/login should authenticate user with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('GET /api/auth/me should return authenticated user details', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testUser.email);
  });

  it('POST /api/projects should create a new project', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Unit Test Project',
        description: 'Project created during Vitest API test suite',
        color: '#6366F1',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Unit Test Project');

    createdProjectId = res.body.data.id;
  });

  it('GET /api/projects should list projects for user', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('POST /api/projects/:projectId/tasks should create a task in project', async () => {
    const res = await request(app)
      .post(`/api/projects/${createdProjectId}/tasks`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Integration Test Task',
        description: 'Testing task creation endpoint',
        status: 'TODO',
        priority: 'HIGH',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Integration Test Task');

    createdTaskId = res.body.data.id;
  });

  it('PATCH /api/tasks/:id/move should update task status and position', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${createdTaskId}/move`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        status: 'IN_PROGRESS',
        position: 2000,
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });

  it('POST /api/tasks/:taskId/comments should add a comment on a task', async () => {
    const res = await request(app)
      .post(`/api/tasks/${createdTaskId}/comments`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        content: 'Automated comment from unit test suite',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.content).toBe('Automated comment from unit test suite');
  });

  it('GET /api/notifications should retrieve user notifications', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.notifications)).toBe(true);
  });
});
