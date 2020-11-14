import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../../../utils/app';
import { Ticket } from '../../../models/ticket';
import { Order, OrderStatus } from '../../../models/order';
import { natsWrapper } from '../../../nats-wrapper';

it('CANCEL_ORDER: fail when try to cancel the order created by another user', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', global.getAuthCookie())
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', global.getAuthCookie())
    .send()
    .expect(401);
});

it('CANCEL_ORDER: success cancel order', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  const user = global.getAuthCookie();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.CANCELLED);
});

it('CANCEL_ORDER: emits a order cancelled event', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  const user = global.getAuthCookie();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.CANCELLED);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
