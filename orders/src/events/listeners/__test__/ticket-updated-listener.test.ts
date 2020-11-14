import mongoose from 'mongoose';
import { TicketUpdatedEvent } from '@btickets/common';

import { Ticket } from '../../../models/ticket';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  // create listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // create and save ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 23,
  });
  await ticket.save();

  // create fake data && msg
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    title: 'new concert',
    price: 32,
    version: ticket.version + 1,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  // return all
  return { listener, data, msg, ticket };
};

it('finds, updates, and save a ticket', async () => {
  const { listener, data, msg, ticket } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('ack the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skipped version number', async () => {
  const { msg, data, listener, ticket } = await setup();

  data.version = 10;

  try {
    await listener.onMessage(data, msg);
  } catch (error) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
