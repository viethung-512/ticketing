import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../../utils/app';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

it('UPDATE_TICKET: return 404 if id not exists', async () => {
  await request(app)
    .put('/api/tickets/feoajrpeojap')
    .set('Cookie', global.getAuthCookie())
    .send({
      title: 'this is title',
      price: 12,
    })
    .expect(404);
});

it('UPDATE_TICKET: return 401 - if the user not authenticated', async () => {
  await request(app)
    .put('/api/tickets/feoajrpeojap')
    .send({
      title: 'this is title',
      price: 12,
    })
    .expect(401);
});

it('UPDATE_TICKET: return 401 if the user not own the ticket', async () => {
  const ticket = { title: 'ticket1', price: 12 };
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getAuthCookie())
    .send(ticket)
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.getAuthCookie())
    .send({
      title: 'reiaroe',
      price: 12,
    })
    .expect(401);
});

it('UPDATE_TICKET: return 400 if invalid title or price', async () => {
  const ticket = { title: 'ticket1', price: 12 };
  const cookie = global.getAuthCookie();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send(ticket)
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 12,
    })
    .expect(400);
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      price: 12,
    })
    .expect(400);
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'htrefoajro',
      price: -12,
    })
    .expect(400);
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
    })
    .expect(400);
});

it('UPDATE_TICKET: return 200, success if the input is valid', async () => {
  const ticket = { title: 'ticket1', price: 12 };
  const cookie = global.getAuthCookie();
  const updateTicket = { title: 'this is title', price: 11 };

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send(ticket)
    .expect(201);

  const updateResponse = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send(updateTicket)
    .expect(200);

  expect(updateResponse.body.title).toEqual(updateTicket.title);
  expect(updateResponse.body.price).toEqual(updateTicket.price);
});

it('UPDATE_TICKET: published an event', async () => {
  const ticket = { title: 'ticket1', price: 12 };
  const cookie = global.getAuthCookie();
  const updateTicket = { title: 'this is title', price: 11 };

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send(ticket)
    .expect(201);

  const updateResponse = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send(updateTicket)
    .expect(200);

  expect(updateResponse.body.title).toEqual(updateTicket.title);
  expect(updateResponse.body.price).toEqual(updateTicket.price);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('UPDATE_TICKET: reject update ticket if the ticket is reserved', async () => {
  const user = global.getAuthCookie();
  const { body: ticket } = await request(app)
    .post('/api/tickets')
    .set('Cookie', user)
    .send({
      title: 'irejaor',
      price: 23,
    })
    .expect(201);

  const createdTicket = await Ticket.findById(ticket.id);
  createdTicket!.orderId = new mongoose.Types.ObjectId().toHexString();
  await createdTicket!.save();

  await request(app)
    .put(`/api/tickets/${createdTicket!.id}`)
    .set('Cookie', user)
    .send({ title: 'some', price: 23 })
    .expect(400);
});
