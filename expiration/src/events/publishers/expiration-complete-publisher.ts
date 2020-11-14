import { Publisher, Subjects, ExpirationCompleteEvent } from '@btickets/common';

export class ExpirationCompletePublisher extends Publisher<
  ExpirationCompleteEvent
> {
  subject: Subjects.EXPIRATION_COMPLETE = Subjects.EXPIRATION_COMPLETE;
}
