const request = require('supertest');
const express = require('express');
const authenticate = require('../src/utils/jwtmiddleware');
const { generateToken } = require('../src/utils/jwt');

const app = express();

// Dummy endpoint protected z middleware
app.get('/protected', authenticate, (req, res) => {
    res.json({ success: true, user: req.user });
});

describe('JWT Middleware', () => {
    it('Dovoli dostop z veljavnim JWT', async () => {
        const token = generateToken({ id: '123', email: 'test@example.com' });

        const res = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.user.email).toBe('test@example.com');
    });

    it('Zavrne dostop brez JWT', async () => {
        const res = await request(app).get('/protected');

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('No token provided');
    });

    it('Zavrne dostop z neveljavnim tokenom', async () => {
        const res = await request(app)
            .get('/protected')
            .set('Authorization', 'Bearer invalidtoken');

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Invalid or expired token');
    });

    it('Zavrne dostop, če Authorization header ni v formatu "Bearer <token>"', async () => {
        const token = generateToken({ id: '123', email: 'test@example.com' });

        // Pošljemo token brez "Bearer " na začetku
        const res = await request(app)
            .get('/protected')
            .set('Authorization', `${token}`);

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('No token provided');
    });
});
