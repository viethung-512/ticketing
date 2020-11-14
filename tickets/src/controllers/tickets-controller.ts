import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
} from '@btickets/common';
import { Request, Response } from 'express';

import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { Ticket } from '../models/ticket';
import { natsWrapper } from '../nats-wrapper';

const getAllTicket = async (req: Request, res: Response) => {
  const tickets = await Ticket.find({ orderId: undefined });

  res.send(tickets);
};

const getTicket = async (req: Request, res: Response) => {
  const { id } = req.params;
  const ticket = await Ticket.findById(id);

  if (!ticket) {
    throw new NotFoundError();
  }

  res.send(ticket);
};

const createTicket = async (req: Request, res: Response) => {
  const { title, price } = req.body;
  const newTicket = Ticket.build({
    title,
    price,
    userId: req.currentUser?.id!,
  });
  await newTicket.save();
  await new TicketCreatedPublisher(natsWrapper.client).publish({
    id: newTicket.id,
    title: newTicket.title,
    price: newTicket.price,
    userId: newTicket.userId,
    version: newTicket.version,
  });

  res.status(201).send(newTicket);
};

const updateTicket = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, price } = req.body;
  const ticket = await Ticket.findById(id);

  if (!ticket) {
    throw new NotFoundError();
  }
  if (ticket.orderId) {
    throw new BadRequestError('Can not edit a reserved ticket');
  }
  if (ticket.userId !== req.currentUser?.id) {
    throw new NotAuthorizedError();
  }

  ticket.set({ title, price });
  await ticket.save();
  await new TicketUpdatedPublisher(natsWrapper.client).publish({
    id: ticket.id,
    title: ticket.title,
    price: ticket.price,
    userId: ticket.userId,
    version: ticket.version,
  });

  res.send(ticket);
};

const ticketsController = {
  getAllTicket,
  getTicket,
  createTicket,
  updateTicket,
};

export default ticketsController;
