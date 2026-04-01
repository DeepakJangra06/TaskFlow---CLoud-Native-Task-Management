const request = require('supertest');
const app = require('./server'); // Import app from server.js

describe('API Health Check', () => {
  it('should return a 200 OK for the health endpoint', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'OK');
  });
});

describe('Authentication API', () => {
  it('should return 401 for unauthorized task access', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toEqual(401);
  });
});
