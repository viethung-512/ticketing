import { connectDB } from './utils/db';
import { app } from './utils/app';

app.listen(3000, () => {
  console.log('Starting up...');

  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }
  console.log('Listening on port 3000...');
  connectDB()
    .then(() => {
      console.log('Mongodb connected...');
    })
    .catch(err => {
      console.error(err);
    });
});
