import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../../utils/app';
import { Order, OrderStatus } from '../../../models/order';
import { Payment } from '../../../models/payment';
import { stripe } from '../../../stripe';

it('CREATE_PAYMENT: return 404 when purchasing the order does not exists', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getAuthCookie())
    .send({
      token: 'rioeajroe',
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('CREATE_PAYMENT: return 401 when purchasing the order does not belong to the user', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 22,
    status: OrderStatus.CREATED,
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getAuthCookie())
    .send({
      token: 'riehaorhe',
      orderId: order.id,
    })
    .expect(401);
});

it('CREATE_PAYMENT: return 400 when purchasing the cancelled order', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 22,
    status: OrderStatus.CANCELLED,
    version: 1,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getAuthCookie(order.userId))
    .send({
      token: 'riehaorhe',
      orderId: order.id,
    })
    .expect(400);
});

it('CREATE_PAYMENT: return 204 with valid inputs', async () => {
  const amount = Math.floor(Math.random() * 100000);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: amount,
    status: OrderStatus.CREATED,
    version: 1,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getAuthCookie(order.userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  const { data: charges } = await stripe.charges.list({ limit: 50 });
  const charge = charges.find(c => c.amount === amount * 100);

  expect(charge).toBeDefined();

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: charge!.id,
  });
  expect(payment).not.toBeNull();
});
