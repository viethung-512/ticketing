import express from 'express';
import { requireAuth, validateRequest } from '@btickets/common';

import paymentsController from '../controllers/payments-controller';
import { createPaymentValidator } from '../validators/payments-validator';

const router = express.Router();

router.post(
  '/',
  requireAuth,
  createPaymentValidator,
  validateRequest,
  paymentsController.createPayment
);

export default router;
