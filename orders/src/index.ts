import { connectDB } from './utils/db';
import { app } from './utils/app';
import { natsWrapper } from './nats-wrapper';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener';

app.listen(3000, () => {
  console.log('Starting...');

  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined');
  }

  console.log('Listening on port 3000...');

  natsWrapper
    .connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    )
    .then(() => {
      natsWrapper.client.on('close', () => {
        console.log('NATS connection closed');
        process.exit();
      });
      process.on('SIGINT', () => natsWrapper.client.close());
      process.on('SIGTERM', () => natsWrapper.client.close());

      new TicketCreatedListener(natsWrapper.client).listen();
      new TicketUpdatedListener(natsWrapper.client).listen();
      new ExpirationCompleteListener(natsWrapper.client).listen();
      new PaymentCreatedListener(natsWrapper.client).listen();

      return connectDB();
    })
    .then(() => {
      console.log('MongoDB connected...');
    })
    .catch(err => {
      console.error(err);
    });
});
