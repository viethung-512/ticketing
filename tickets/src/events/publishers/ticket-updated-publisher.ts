import { Publisher, Subjects, TicketUpdatedEvent } from '@btickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TICKET_UPDATED = Subjects.TICKET_UPDATED;
}
