import { Message } from 'node-nats-streaming';
import {
  Listener,
  NotFoundError,
  Subjects,
  TicketUpdatedEvent,
} from '@btickets/common';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TICKET_UPDATED = Subjects.TICKET_UPDATED;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const { id, price, title, version } = data;
    const ticket = await Ticket.findByEvent(data);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.title = title;
    ticket.price = price;
    await ticket.save();

    msg.ack();
  }
}
