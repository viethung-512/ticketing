import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from './config/env-config';

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY! || STRIPE_SECRET_KEY,
  {
    apiVersion: '2020-08-27',
  }
);
