import jwt from 'jsonwebtoken';
import { BadRequestError } from '@btickets/common';

import { Password } from './../services/password';
import { Request, Response } from 'express';
import { User } from '../models/user';

const signIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new BadRequestError('Invalid credentials');
  }

  const matchPassword = await Password.compare(user.password, password);
  if (!matchPassword) {
    throw new BadRequestError('Invalid credentials');
  }

  const userJwt = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_KEY!
  );

  req.session = { jwt: userJwt };

  res.status(200).send(user);
};

const signOut = async (req: Request, res: Response) => {
  req.session = null;

  res.send({ message: 'Sign out success' });
};

const signUp = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new BadRequestError('Email in use');
  }

  const user = User.build({ email, password });
  await user.save();

  const userJwt = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_KEY!
  );

  req.session = { jwt: userJwt };

  res.status(201).send(user);
};

const getCurrentUser = async (req: Request, res: Response) => {
  res.send({ currentUser: req.currentUser || null });
};

export const authController = {
  signIn,
  signOut,
  signUp,
  getCurrentUser,
};
