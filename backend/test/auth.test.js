const request = require('supertest');
const app = require('../server');

// Popolnoma mock user model
jest.mock('../src/models/user', () => {
  return {
    create: jest.fn(async (data) => ({ id: 1, ...data, is_verified: false })),
    findOne: jest.fn(async (query) => {
      if (query.where.email === 'existing@example.com') {
        return { id: 1, email: 'existing@example.com', username: 'existing', is_verified: false };
      }
      return null;
    }),
    findByPk: jest.fn(async (id) => ({ id, is_verified: true, verification_token: null })),
    destroy: jest.fn(),
  };
});

const User = require('../src/models/user');

describe('Authentication Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should register a new user with valid data', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('test@example.com');
  });

  it('Should not register with existing email', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      username: 'newuser',
      email: 'existing@example.com',
      password: 'Password123',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
