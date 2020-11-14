import { body } from 'express-validator';

export const createPaymentValidator = [
  body('token').not().isEmpty().withMessage('Token is required'),
  body('orderId').not().isEmpty().withMessage('Order Id is required'),
];
