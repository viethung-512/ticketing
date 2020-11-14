import request from 'supertest';
import { app } from '../../../utils/app';

it('SIGN_UP: returns a 201 on successful', async () => {
  return request(app)
    .post('/api/users/signUp')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);
});

it('SIGN_UP: returns a 400 with a invalid email', async () => {
  return request(app)
    .post('/api/users/signUp')
    .send({
      email: 'test.com',
      password: 'password',
    })
    .expect(400);
});

it('SIGN_UP: returns a 400 with a invalid password', async () => {
  return request(app)
    .post('/api/users/signUp')
    .send({
      email: 'test@test.com',
      password: '123',
    })
    .expect(400);
});

it('SIGN_UP: returns a 400 with missing email or password', async () => {
  await request(app)
    .post('/api/users/signUp')
    .send({
      email: 'test@test.com',
    })
    .expect(400);
  await request(app)
    .post('/api/users/signUp')
    .send({
      password: '123',
    })
    .expect(400);
});

it('SIGN_UP: disallows duplicate emails', async () => {
  await request(app)
    .post('/api/users/signUp')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);

  await request(app)
    .post('/api/users/signUp')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(400);
});

it('SIGN_UP: sets a cookie after successful', async () => {
  const response = await request(app)
    .post('/api/users/signUp')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();
});
