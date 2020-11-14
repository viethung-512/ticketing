import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
} from '@btickets/common';
import { Request, Response } from 'express';
import { Order, OrderStatus } from '../models/order';
import { Payment } from '../models/payment';
import { stripe } from '../stripe';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const createPayment = async (req: Request, res: Response) => {
  const { token, orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new NotFoundError();
  }
  if (order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError();
  }
  if (order.status === OrderStatus.CANCELLED) {
    throw new BadRequestError('Can not pay for an cancelled order');
  }

  const charge = await stripe.charges.create({
    currency: 'usd',
    amount: order.price * 100,
    source: token,
  });

  const payment = Payment.build({
    orderId: order.id,
    stripeId: charge.id,
  });
  await payment.save();
  await new PaymentCreatedPublisher(natsWrapper.client).publish({
    id: payment.id,
    orderId: payment.orderId,
    stripeId: payment.stripeId,
  });

  res.status(201).send({ paymentId: payment.id });
};

const paymentsController = {
  createPayment,
};

export default paymentsController;
