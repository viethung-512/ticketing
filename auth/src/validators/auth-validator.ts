import { body } from 'express-validator';

export const signInValidator = [
  body('email').isEmail().withMessage('Must be a valid email address'),
  body('password').trim().notEmpty().withMessage('Password is required'),
];

export const signUpValidator = [
  body('email').isEmail().withMessage('Must be a valid email address'),
  body('password')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Password length must between 4 and 20 characters'),
];
