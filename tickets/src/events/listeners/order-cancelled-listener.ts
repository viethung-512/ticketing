import { Message } from 'node-nats-streaming';
import { Listener, OrderCancelledEvent, Subjects } from '@btickets/common';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.ORDER_CANCELLED = Subjects.ORDER_CANCELLED;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const {
      id,
      ticket: { id: ticketId },
    } = data;
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.orderId = undefined;
    await ticket.save();
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
    });

    msg.ack();
  }
}
