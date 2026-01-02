const request = require('supertest');
const app = require('../src/index');
const pool = require('../src/config/database');

describe('Ratings Endpoints', () => {
    let userCookie;
    let mediaId;

    beforeAll(async () => {
        // 1. Create a user
        const userRes = await request(app)
            .post('/api/auth/register')
            .send({ email: 'test.rating.user@example.com', password: 'password123', username: 'ratinguser' });
        
        // 2. Login user
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test.rating.user@example.com', password: 'password123' });
        userCookie = loginRes.headers['set-cookie'];

        // 3. Create a media item to rate
        // We need a creator for this
        const creatorRes = await request(app)
            .post('/api/auth/register')
            .send({ email: 'test.rating.creator@example.com', password: 'password123', username: 'ratingcreator' });
        await pool.query('UPDATE users SET role = "creator" WHERE id = ?', [creatorRes.body.userId]);
        const loginCreatorRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test.rating.creator@example.com', password: 'password123' });
        
        const mediaRes = await request(app)
            .post('/api/media')
            .set('Cookie', loginCreatorRes.headers['set-cookie'])
            .field('title', 'Test Media for Rating');
            // A real test would attach a file, but for simplicity we'll omit it
            // as the rating logic doesn't depend on the file itself.
        
        // This part will fail because the media upload requires a file.
        // For a true isolated test, we should insert media directly into the DB.
        const [result] = await pool.query(
            'INSERT INTO media (user_id, title, url, blob_name, visibility) VALUES (?, ?, ?, ?, ?)',
            [creatorRes.body.userId, 'Test Media for Rating', 'url', 'blob', 'public']
        );
        mediaId = result.insertId;
    });

    afterAll(async () => {
        await pool.query('DELETE FROM ratings WHERE media_id = ?', [mediaId]);
        await pool.query('DELETE FROM media WHERE id = ?', [mediaId]);
        await pool.query('DELETE FROM users WHERE email LIKE "test.rating.%"');
        pool.end();
    });

    it('should fail if user is not authenticated', async () => {
        const res = await request(app)
            .post(`/api/media/${mediaId}/ratings`)
            .send({ rating: 5 });
        expect(res.statusCode).toEqual(401);
    });

    it('should fail if rating is invalid', async () => {
        const res = await request(app)
            .post(`/api/media/${mediaId}/ratings`)
            .set('Cookie', userCookie)
            .send({ rating: 6 });
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe('Rating must be between 1 and 5.');
    });

    it('should allow a user to rate a media item', async () => {
        const res = await request(app)
            .post(`/api/media/${mediaId}/ratings`)
            .set('Cookie', userCookie)
            .send({ rating: 4 });
        expect(res.statusCode).toEqual(201);
        expect(res.body.rating).toBe(4);
    });

    it('should allow a user to update their rating', async () => {
        // First rating
        await request(app)
            .post(`/api/media/${mediaId}/ratings`)
            .set('Cookie', userCookie)
            .send({ rating: 3 });
        
        // Update rating
        const res = await request(app)
            .post(`/api/media/${mediaId}/ratings`)
            .set('Cookie', userCookie)
            .send({ rating: 5 });

        expect(res.statusCode).toEqual(201); // The service returns the updated rating
        expect(res.body.rating).toBe(5);
    });
});
