import mongoose from 'mongoose';
import { body } from 'express-validator';

export const createOrderValidator = [
  body('ticketId')
    .not()
    .isEmpty()
    .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
    .withMessage('Ticket Id is not valid'),
];
