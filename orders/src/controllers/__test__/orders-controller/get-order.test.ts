import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../../../utils/app';
import { Ticket } from '../../../models/ticket';

it('GET_TICKET: success fetch order', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 23,
  });
  await ticket.save();

  const user = global.getAuthCookie();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send({})
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

it('GET_TICKET: fail when fetched order created by another user', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 23,
  });
  await ticket.save();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', global.getAuthCookie())
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', global.getAuthCookie())
    .send({})
    .expect(401);
});
