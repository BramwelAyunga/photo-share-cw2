const request = require('supertest');
const app = require('../src/index'); // Assuming app is exported from index.js

// A basic smoke test
describe('GET /', () => {
    it('should respond with a 200 OK and a welcome message', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('Photo-Share API is running!');
    });
});

// We need to close the server after tests are done
// This is a simplified setup. A more robust setup would handle the server lifecycle better.
afterAll(done => {
    // The server started in index.js is not the one supertest uses,
    // so we don't have a server to close here unless we refactor index.js significantly.
    // For this smoke test, we'll assume the app object can be tested directly.
    done();
});
