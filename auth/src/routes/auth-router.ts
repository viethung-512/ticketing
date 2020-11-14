import express from 'express';
import { currentUser, validateRequest } from '@btickets/common';

import { signInValidator, signUpValidator } from '../validators/auth-validator';
import { authController } from '../controllers/auth-controller';

const router = express.Router();

router.post('/signIn', signInValidator, validateRequest, authController.signIn);
router.post('/signOut', authController.signOut);
router.post('/signUp', signUpValidator, validateRequest, authController.signUp);
router.get('/currentUser', currentUser, authController.getCurrentUser);

export default router;
