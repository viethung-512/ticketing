import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

jest.mock('../nats-wrapper.ts');
// jest.mock('../stripe.ts');

let mongo: any;

declare global {
  namespace NodeJS {
    interface Global {
      getAuthCookie(id?: string): string[];
    }
  }
}

beforeAll(async () => {
  process.env.JWT_KEY = 'my-key';

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.getAuthCookie = (id?: string) => {
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
  };

  const token = jwt.sign(payload, process.env.JWT_KEY!);
  const session = { jwt: token };

  const sessionJson = JSON.stringify(session);
  const base64 = Buffer.from(sessionJson).toString('base64');

  return [`express:sess=${base64}`];
};
