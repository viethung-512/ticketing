import express from 'express';
import { requireAuth, validateRequest } from '@btickets/common';

import ordersController from '../controllers/orders-controller';
import { createOrderValidator } from '../validators/orders-validator';

const router = express.Router();

router.get('/', requireAuth, ordersController.getAllOrder);
router.get('/:id', requireAuth, ordersController.getOrder);
router.post(
  '/',
  requireAuth,
  createOrderValidator,
  validateRequest,
  ordersController.createOrder
);

router.delete('/:id', requireAuth, ordersController.cancelOrder);

export default router;
