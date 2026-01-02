const request = require('supertest');
const app = require('../src/index');
const pool = require('../src/config/database');

describe('Comments Endpoints', () => {
    let creatorCookie, userCookie, otherUserCookie;
    let creatorId, userId;
    let mediaId;
    let commentId, replyId;

    beforeAll(async () => {
        // Create users
        const creatorRes = await request(app).post('/api/auth/register').send({ email: 'test.comment.creator@example.com', password: 'p', username: 'comcreator' });
        creatorId = creatorRes.body.userId;
        await pool.query('UPDATE users SET role = "creator" WHERE id = ?', [creatorId]);

        const userRes = await request(app).post('/api/auth/register').send({ email: 'test.comment.user@example.com', password: 'p', username: 'comuser' });
        userId = userRes.body.userId;
        
        await request(app).post('/api/auth/register').send({ email: 'test.comment.other@example.com', password: 'p', username: 'comother' });

        // Login users
        const loginCreator = await request(app).post('/api/auth/login').send({ email: 'test.comment.creator@example.com', password: 'p' });
        creatorCookie = loginCreator.headers['set-cookie'];
        const loginUser = await request(app).post('/api/auth/login').send({ email: 'test.comment.user@example.com', password: 'p' });
        userCookie = loginUser.headers['set-cookie'];
        const loginOther = await request(app).post('/api/auth/login').send({ email: 'test.comment.other@example.com', password: 'p' });
        otherUserCookie = loginOther.headers['set-cookie'];

        // Create media
        const [result] = await pool.query('INSERT INTO media (user_id, title, visibility) VALUES (?, ?, ?)', [creatorId, 'Comment Test Media', 'public']);
        mediaId = result.insertId;
    });

    afterAll(async () => {
        await pool.query('DELETE FROM comments WHERE media_id = ?', [mediaId]);
        await pool.query('DELETE FROM media WHERE id = ?', [mediaId]);
        await pool.query('DELETE FROM users WHERE email LIKE "test.comment.%"');
        pool.end();
    });

    it('should post a new comment', async () => {
        const res = await request(app)
            .post(`/api/media/${mediaId}/comments`)
            .set('Cookie', userCookie)
            .send({ comment: 'This is a test comment.' });
        
        expect(res.statusCode).toEqual(201);
        expect(res.body.comment).toBe('This is a test comment.');
        commentId = res.body.id;
    });

    it('should post a reply to a comment', async () => {
        const res = await request(app)
            .post(`/api/media/${mediaId}/comments`)
            .set('Cookie', creatorCookie)
            .send({ comment: 'This is a reply.', parent_comment_id: commentId });

        expect(res.statusCode).toEqual(201);
        expect(res.body.parent_comment_id).toBe(commentId);
        replyId = res.body.id;
    });

    it('should fetch all comments for a media item', async () => {
        const res = await request(app).get(`/api/media/${mediaId}/comments`);
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1); // Only top-level comments
        expect(res.body[0].replies.length).toBe(1); // Check for nested reply
    });

    it('should not allow a user to delete another user\'s comment', async () => {
        const res = await request(app)
            .delete(`/api/media/${mediaId}/comments/${commentId}`)
            .set('Cookie', otherUserCookie);
        
        expect(res.statusCode).toEqual(403);
    });

    it('should allow a user to delete their own comment', async () => {
        // Post a comment to delete
        const tempCommentRes = await request(app)
            .post(`/api/media/${mediaId}/comments`)
            .set('Cookie', otherUserCookie)
            .send({ comment: 'I will be deleted.' });
        
        const res = await request(app)
            .delete(`/api/media/${mediaId}/comments/${tempCommentRes.body.id}`)
            .set('Cookie', otherUserCookie);

        expect(res.statusCode).toEqual(204);
    });

    it('should allow a creator to delete any comment on their media', async () => {
        const res = await request(app)
            .delete(`/api/media/${mediaId}/comments/${commentId}`)
            .set('Cookie', creatorCookie);

        expect(res.statusCode).toEqual(204);
    });
});
