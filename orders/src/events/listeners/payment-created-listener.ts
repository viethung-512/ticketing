import { Message } from 'node-nats-streaming';
import { Listener, Subjects, PaymentCreatedEvent } from '@btickets/common';
import { queueGroupName } from './queue-group-name';
import { Order, OrderStatus } from '../../models/order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PAYMENT_CREATED = Subjects.PAYMENT_CREATED;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    order.status = OrderStatus.COMPLETE;
    await order.save();

    msg.ack();
  }
}
