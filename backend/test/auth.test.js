const request = require('supertest');
const app = require('../server');

// Mock User model
const mockUsers = [];

class User {
  constructor(data) {
    this.id = mockUsers.length + 1;
    this.username = data.username;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.is_verified = data.is_verified || false;
    this.verification_token = data.verification_token || null;
  }

  static async create(data) {
    const user = new User(data);
    mockUsers.push(user);
    return user;
  }

  static async findOne({ where }) {
    return mockUsers.find(u => u.email === where.email) || null;
  }

  static async findByPk(id) {
    return mockUsers.find(u => u.id === id) || null;
  }

  async save() {
    // mock save does nothing
    return this;
  }

  static async destroy() {
    mockUsers.length = 0;
  }
}

// Mock the actual import in your code
jest.mock('../src/models', () => ({
  User,
}));

describe('Authentication Endpoints', () => {
  beforeEach(async () => {
    await User.destroy();
  });

  it('Should register a new user', async () => {
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
    await User.create({
      username: 'existing',
      email: 'existing@example.com',
      password_hash: 'hashed',
    });

    const res = await request(app).post('/api/v1/auth/register').send({
      username: 'newuser',
      email: 'existing@example.com',
      password: 'Password123',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
