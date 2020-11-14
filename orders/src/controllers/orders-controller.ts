import { Request, Response } from 'express';
import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
} from '@btickets/common';

import { Ticket } from '../models/ticket';
import { Order, OrderStatus } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

const getAllOrder = async (req: Request, res: Response) => {
  const orders = await Order.find({
    userId: req.currentUser!.id,
  }).populate('ticket');

  res.send(orders);
};

const getOrder = async (req: Request, res: Response) => {
  const { id: orderId } = req.params;
  const order = await Order.findById(orderId).populate('ticket');

  if (!order) {
    throw new NotFoundError();
  }
  if (order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError();
  }

  res.send(order);
};

const createOrder = async (req: Request, res: Response) => {
  const { ticketId } = req.body;

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new NotFoundError();
  }

  const existingOrder = await ticket.isReserved();
  if (existingOrder) {
    throw new BadRequestError('Ticket is already reserved');
  }

  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

  const order = await Order.build({
    userId: req.currentUser!.id,
    status: OrderStatus.CREATED,
    expiresAt: expiration,
    ticket: ticket,
  });
  await order.save();

  await new OrderCreatedPublisher(natsWrapper.client).publish({
    id: order.id,
    status: order.status,
    userId: order.userId,
    expiresAt: order.expiresAt.toISOString(),
    version: order.version,
    ticket: {
      id: order.ticket.id,
      price: order.ticket.price,
    },
  });

  res.status(201).send(order);
};

const cancelOrder = async (req: Request, res: Response) => {
  const { id: orderId } = req.params;

  const order = await Order.findById(orderId).populate('ticket');
  if (!order) {
    throw new NotFoundError();
  }
  if (order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError();
  }

  order.status = OrderStatus.CANCELLED;
  await order.save();

  await new OrderCancelledPublisher(natsWrapper.client).publish({
    id: order.id,
    version: order.version,
    ticket: {
      id: order.ticket.id,
    },
  });

  res.status(204).send(order);
};

const ordersController = {
  getAllOrder,
  getOrder,
  createOrder,
  cancelOrder,
};

export default ordersController;
