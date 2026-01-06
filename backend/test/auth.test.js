// test/auth.test.js
/* eslint-env mocha */
const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

// MOCKED endpoints (brez baze)
app.post('/api/v1/auth/register', (req, res) => {
  const { email, password } = req.body;
  if (!email.includes('@') || password.length < 6) {
    return res.status(400).json({ success: false });
  }
  res.status(201).json({
    success: true,
    data: { email, username: req.body.username, is_verified: false },
  });
});

app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'verified@example.com' && password === 'Password123') {
    return res.status(200).json({ success: true, token: 'fake-jwt-token' });
  }
  res.status(400).json({ success: false });
});

app.get('/api/v1/auth/verify-email', (req, res) => {
  if (req.query.token === 'validtoken') {
    return res.status(200).json({ success: true });
  }
  res.status(400).json({ success: false });
});

// --- TESTS ---
describe('Mocked Auth Endpoints', () => {
  it('Should register successfully with valid data', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('test@example.com');
  });

  it('Should fail registration with invalid email', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      username: 'testuser',
      email: 'bad-email',
      password: 'Password123',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('Should login with verified user', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'verified@example.com',
      password: 'Password123',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('Should fail login with wrong password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'verified@example.com',
      password: 'WrongPass',
    });

    expect(res.statusCode).toBe(400);
  });

  it('Should verify email with valid token', async () => {
    const res = await request(app).get(
      '/api/v1/auth/verify-email?token=validtoken'
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('Should fail email verification with invalid token', async () => {
    const res = await request(app).get(
      '/api/v1/auth/verify-email?token=badtoken'
    );
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
