const request = require('supertest');
const app = require('../src/index');
const pool = require('../src/config/database');
const path = require('path');

describe('Media Endpoints', () => {
    let creatorCookie;
    let consumerCookie;
    let creatorId;
    let mediaId;

    beforeAll(async () => {
        // 1. Create and login a 'creator' user
        const creatorRes = await request(app)
            .post('/api/auth/register')
            .send({ email: 'test.creator@example.com', password: 'password123', username: 'creator' });
        creatorId = creatorRes.body.userId;
        // Manually update role to 'creator' for testing purposes
        await pool.query('UPDATE users SET role = "creator" WHERE id = ?', [creatorId]);

        const loginCreatorRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test.creator@example.com', password: 'password123' });
        creatorCookie = loginCreatorRes.headers['set-cookie'];

        // 2. Create and login a 'consumer' user
        await request(app)
            .post('/api/auth/register')
            .send({ email: 'test.consumer@example.com', password: 'password123', username: 'consumer' });
        const loginConsumerRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test.consumer@example.com', password: 'password123' });
        consumerCookie = loginConsumerRes.headers['set-cookie'];
    });

    afterAll(async () => {
        await pool.query('DELETE FROM media WHERE title LIKE "Test %"');
        await pool.query('DELETE FROM users WHERE email LIKE "test.creator@%" OR email LIKE "test.consumer@%"');
        pool.end();
    });

    describe('POST /api/media', () => {
        it('should fail if user is not authenticated', async () => {
            const res = await request(app).post('/api/media');
            expect(res.statusCode).toEqual(401);
        });

        it('should fail if user is not a creator', async () => {
            const res = await request(app)
                .post('/api/media')
                .set('Cookie', consumerCookie)
                .field('title', 'Test Image by Consumer')
                .attach('image', path.resolve(__dirname, 'test-image.png')); // You need a dummy image file here
            expect(res.statusCode).toEqual(403);
        });

        it('should upload media successfully for a creator', async () => {
            // Create a dummy image file for testing if it doesn't exist
            const fs = require('fs');
            const imagePath = path.resolve(__dirname, 'test-image.png');
            if (!fs.existsSync(imagePath)) {
                // Create a 1x1 pixel black png
                const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
                fs.writeFileSync(imagePath, buffer);
            }

            const res = await request(app)
                .post('/api/media')
                .set('Cookie', creatorCookie)
                .field('title', 'Test Upload')
                .field('caption', 'A test caption')
                .attach('image', imagePath);
            
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.title).toBe('Test Upload');
            mediaId = res.body.id; // Save for other tests
        });
    });

    describe('GET /api/media', () => {
        it('should return a list of public media', async () => {
            const res = await request(app).get('/api/media');
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('GET /api/media/:id', () => {
        it('should return a single media item', async () => {
            const res = await request(app).get(`/api/media/${mediaId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.id).toEqual(mediaId);
        });
    });
    
    describe('PUT /api/media/:id', () => {
        it('should update the media item', async () => {
            const res = await request(app)
                .put(`/api/media/${mediaId}`)
                .set('Cookie', creatorCookie)
                .send({ title: 'Updated Test Title' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.title).toBe('Updated Test Title');
        });
    });

    describe('DELETE /api/media/:id', () => {
        it('should delete the media item', async () => {
            const res = await request(app)
                .delete(`/api/media/${mediaId}`)
                .set('Cookie', creatorCookie);
            
            expect(res.statusCode).toEqual(204);

            // Verify it's gone
            const getRes = await request(app).get(`/api/media/${mediaId}`);
            expect(getRes.statusCode).toEqual(404); // Or whatever your service returns for not found
        });
    });
});
