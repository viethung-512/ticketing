import express from 'express';
import { requireAuth, validateRequest } from '@btickets/common';

import ticketsController from '../controllers/tickets-controller';
import {
  createTicketInValidator,
  updateTicketInValidator,
} from '../validators/tickets-validator';

const router = express.Router();

router.post(
  '/',
  requireAuth,
  createTicketInValidator,
  validateRequest,
  ticketsController.createTicket
);
router.get('/:id', ticketsController.getTicket);
router.get('/', ticketsController.getAllTicket);
router.put(
  '/:id',
  requireAuth,
  updateTicketInValidator,
  validateRequest,
  ticketsController.updateTicket
);

export default router;
