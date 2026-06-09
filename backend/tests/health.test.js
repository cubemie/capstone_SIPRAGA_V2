const request = require('supertest');
const app = require('../src/app');

describe('Health Check Endpoint', () => {
  it('seharusnya mengembalikan status 200 dan message yang benar', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Server is running normally.');
  });
});
