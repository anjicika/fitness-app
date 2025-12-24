const request = require('supertest');
const app = require('../server'); // prilagodi, če je tvoja aplikacija drugje
const { User, sequelize } = require('../src/models');

beforeAll(async () => {
    await sequelize.sync({ force: true }); // Sinhroniziramo testno bazo
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Skrije napake v konzoli med testi za čistejši izpis
});

afterAll(async () => {
    await sequelize.close(); // Zapremo povezavo po testih
    console.error.mockRestore(); 
});

describe('Authentication Endpoints', () => {

    beforeEach(async () => {
        await User.destroy({ where: {} });
    });

    it('Should register a new user with valid data', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'Password123'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.email).toBe('test@example.com');
        expect(res.body.data.username).toBe('testuser');
        expect(res.body.data.is_verified).toBe(false);
    });

    it('Should not register with existing email', async () => {
        await User.create({
            username: 'existing',
            email: 'existing@example.com',
            password_hash: 'hashed',
            is_verified: false
        });

        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({
                username: 'newuser',
                email: 'existing@example.com',
                password: 'Password123'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('Should verify email with valid token', async () => {
        const user = await User.create({
            username: 'verifyuser',
            email: 'verify@example.com',
            password_hash: 'hashed',
            verification_token: 'validtoken',
            is_verified: false
        });

        const res = await request(app)
            .get(`/api/v1/auth/verify-email?token=validtoken`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);

        const updatedUser = await User.findByPk(user.id);
        expect(updatedUser.is_verified).toBe(true);
        expect(updatedUser.verification_token).toBeNull();
    });

    it('Should not verify email with invalid token', async () => {
        const res = await request(app)
            .get(`/api/v1/auth/verify-email?token=invalidtoken`);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('Should login with correct credentials and verified email', async () => {
        const passwordHash = await require('bcrypt').hash('Password123', 10);
        await User.create({
            username: 'loginuser',
            email: 'login@example.com',
            password_hash: passwordHash,
            is_verified: true
        });

        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'login@example.com', password: 'Password123' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.token).toBeDefined();
    });

    it('Should not login with incorrect password', async () => {
        const passwordHash = await require('bcrypt').hash('Password123', 10);
        await User.create({
            username: 'loginuser2',
            email: 'login2@example.com',
            password_hash: passwordHash,
            is_verified: true
        });

        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'login2@example.com', password: 'WrongPass123' });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('Should not login if email is not verified', async () => {
        const passwordHash = await require('bcrypt').hash('Password123', 10);
        await User.create({
            username: 'novalid',
            email: 'novalid@example.com',
            password_hash: passwordHash,
            is_verified: false
        });

        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'novalid@example.com', password: 'Password123' });

        expect(res.statusCode).toBe(403);
        expect(res.body.success).toBe(false);
    });

    it('Should fail registration with invalid email', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({
                username: 'bademail',
                email: 'not-an-email',
                password: 'Password123'
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('Should fail registration with weak password', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({
                username: 'weakpass',
                email: 'weak@example.com',
                password: 'short'
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('Should logout successfully', async () => {
        const res = await request(app)
            .post('/api/v1/auth/logout');
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('Should handle server error on registration', async () => {
        jest.spyOn(User, 'create').mockImplementationOnce(() => {
            throw new Error('DB failure');
        });

        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({
                username: 'failuser',
                email: 'fail@example.com',
                password: 'Password123'
            });

        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);

        // Restore the original implementation
        User.create.mockRestore();
    });

    it('Should return validation errors for invalid registration data', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({
                username: '',           // prazno
                email: 'not-an-email',  // napačen format
                password: 'short'       // premalo znakov + ni velikih črk ali številk
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('Should handle DB failure gracefully during registration', async () => {
        // Mock User.create, da vrže napako
        const spy = jest.spyOn(User, 'create').mockImplementation(() => {
            throw new Error('DB failure');
        });

        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({
                username: 'failuser',
                email: 'fail@example.com',
                password: 'Password123'
            });

        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);

        spy.mockRestore();
    });

    it('Should handle DB failure gracefully during login', async () => {
        const spy = jest.spyOn(User, 'findOne').mockImplementation(() => {
            throw new Error('DB failure');
        });

        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'loginfail@example.com',
                password: 'Password123'
            });

        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);

        spy.mockRestore();
    });


});
