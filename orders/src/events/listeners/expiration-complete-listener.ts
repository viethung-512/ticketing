import { Listener, Subjects, ExpirationCompleteEvent } from '@btickets/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Order, OrderStatus } from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';

export class ExpirationCompleteListener extends Listener<
  ExpirationCompleteEvent
> {
  subject: Subjects.EXPIRATION_COMPLETE = Subjects.EXPIRATION_COMPLETE;
  queueGroupName = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    const { orderId } = data;
    const order = await Order.findById(orderId).populate('ticket');

    if (!order) {
      throw new Error('Order not found');
    }
    if (order.status === OrderStatus.COMPLETE) {
      return msg.ack();
    }

    order.status = OrderStatus.CANCELLED;
    await order.save();
    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    msg.ack();
  }
}
