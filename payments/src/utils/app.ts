import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, currentUser, NotFoundError } from '@btickets/common';

import paymentsRoute from '../routes/payments-routes';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);
app.use(currentUser);

app.use('/api/payments', paymentsRoute);
app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };