import { Message } from 'node-nats-streaming';
import { Listener, Subjects, OrderCancelledEvent } from '@btickets/common';
import { queueGroupName } from './queue-group-name';
import { Order, OrderStatus } from '../../models/order';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.ORDER_CANCELLED = Subjects.ORDER_CANCELLED;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });

    if (!order) {
      throw new Error('Order not found');
    }

    order.status = OrderStatus.CANCELLED;
    await order.save();

    msg.ack();
  }
}
