import request from 'supertest';
import { app } from '../../../utils/app';

it('CURRENT_USER: response with details of current users', async () => {
  const cookie = await global.getAuthCookie();

  const response = await request(app)
    .get('/api/users/currentUser')
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual('test@test.com');
});

it('CURRENT_USER: fails with not authenticated user', async () => {
  const response = await request(app)
    .get('/api/users/currentUser')
    .send()
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
});
