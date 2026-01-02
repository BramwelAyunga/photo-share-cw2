const request = require('supertest');
const app = require('../src/index');
const pool = require('../src/config/database');

describe('Auth Endpoints', () => {
    // Clean up the database after all tests
    afterAll(async () => {
        await pool.query('DELETE FROM users WHERE email LIKE "test.user.%"');
        pool.end();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test.user.1@example.com',
                    password: 'password123',
                    username: 'testuser1'
                });
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('userId');
        });

        it('should fail to register a user with an existing email', async () => {
            // First, create a user
            await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test.user.2@example.com',
                    password: 'password123',
                    username: 'testuser2'
                });
            
            // Then, try to register again with the same email
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test.user.2@example.com',
                    password: 'password123',
                    username: 'testuser2'
                });
            
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'User with this email already exists.');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeAll(async () => {
            // Create a user to login with
            await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test.user.login@example.com',
                    password: 'password123',
                    username: 'loginuser'
                });
        });

        it('should login a registered user and return a cookie', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test.user.login@example.com',
                    password: 'password123'
                });
            
            expect(res.statusCode).toEqual(200);
            expect(res.headers['set-cookie']).toBeDefined();
            expect(res.body).toHaveProperty('user');
            expect(res.body.user.email).toEqual('test.user.login@example.com');
        });

        it('should fail to login with an incorrect password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test.user.login@example.com',
                    password: 'wrongpassword'
                });
            
            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('message', 'Invalid email or password.');
        });
    });
});
