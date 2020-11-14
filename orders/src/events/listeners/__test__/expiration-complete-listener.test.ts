import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { ExpirationCompleteEvent } from '@btickets/common';
import { natsWrapper } from '../../../nats-wrapper';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { Order, OrderStatus } from '../../../models/order';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 22,
  });
  await ticket.save();

  const order = Order.build({
    status: OrderStatus.CREATED,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, order, data, msg };
};

it('update the order status to cancelled', async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.CANCELLED);
});

it('emits an OrderCancelled event', async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);
  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  console.log({ eventData });

  expect(natsWrapper.client.publish).toHaveBeenCalled();
  expect(eventData.id).toEqual(order.id);
});

it('ack the msg', async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
