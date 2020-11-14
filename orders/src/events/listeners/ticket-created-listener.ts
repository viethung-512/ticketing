import { Message } from 'node-nats-streaming';
import { TicketCreatedEvent, Subjects, Listener } from '@btickets/common';

import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TICKET_CREATED = Subjects.TICKET_CREATED;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const { id, title, price } = data;

    const ticket = Ticket.build({ title, price, id });
    await ticket.save();

    msg.ack();
  }
}
