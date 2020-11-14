import request from 'supertest';
import { app } from '../../../utils/app';
import { Ticket } from '../../../models/ticket';

import { natsWrapper } from '../../../nats-wrapper';

it('NEW_TICKET: has api handler', async () => {
  const response = await request(app).post('/api/tickets').send({});
  expect(response.status).not.toEqual(404);
});

it('NEW_TICKET: only access by authenticated user', async () => {
  await request(app).post('/api/tickets').send({}).expect(401);
});

it('NEW_TICKET: success access by authenticated user', async () => {
  const cookie = global.getAuthCookie();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({});

  expect(response.status).not.toEqual(401);
});

it('NEW_TICKET: fail if invalid title', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getAuthCookie())
    .send({
      title: '',
      price: 12,
    })
    .expect(400);
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getAuthCookie())
    .send({
      price: 12,
    })
    .expect(400);
});

it('NEW_TICKET: fail if invalid price', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getAuthCookie())
    .send({
      title: 'this is title',
      price: 'reahroe',
    })
    .expect(400);
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getAuthCookie())
    .send({
      title: 'this is title',
    })
    .expect(400);
});

it('NEW_TICKET: success create ticket with valid inputs', async () => {
  let tickets = await Ticket.find();
  const beforeLength = tickets.length;
  expect(beforeLength).toEqual(0);

  const title = 'this is title';
  const price = 12;
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getAuthCookie())
    .send({ title, price })
    .expect(201);

  tickets = await Ticket.find();
  const afterLength = tickets.length;

  expect(afterLength).toEqual(1);
  expect(tickets[0].title).toEqual(title);
  expect(tickets[0].price).toEqual(price);
});

it('NEW_TICKET: published an event', async () => {
  const title = 'this is title';
  const price = 12;
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getAuthCookie())
    .send({ title, price })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
