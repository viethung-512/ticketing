import request from 'supertest';
import { app } from '../../../utils/app';

it('SIGN_IN: returns a 400 with a invalid email', async () => {
  await request(app)
    .post('/api/users/signIn')
    .send({
      email: 'test.com',
      password: 'password',
    })
    .expect(400);
});

it('SIGN_IN: returns a 400 with missing email or password', async () => {
  await request(app)
    .post('/api/users/signIn')
    .send({
      email: 'test@test.com',
    })
    .expect(400);
  await request(app)
    .post('/api/users/signIn')
    .send({
      password: '123',
    })
    .expect(400);
});

it('SIGN_IN: fails when email is not signed up', async () => {
  await request(app)
    .post('/api/users/signIn')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(400);
});

it('SIGN_IN: fails when incorrect password', async () => {
  await request(app)
    .post('/api/users/signUp')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);

  await request(app)
    .post('/api/users/signIn')
    .send({
      email: 'test@test.com',
      password: 'pass',
    })
    .expect(400);
});

it('SIGN_IN: successful response with cookie', async () => {
  await request(app)
    .post('/api/users/signUp')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signIn')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});
