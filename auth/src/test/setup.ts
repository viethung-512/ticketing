import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { app } from '../utils/app';

let mongo: any;

declare global {
  namespace NodeJS {
    interface Global {
      getAuthCookie(): Promise<string[]>;
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
  const collections = await mongoose.connection.db.collections();

  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.getAuthCookie = async () => {
  const email = 'test@test.com';
  const password = 'password';

  const response = await request(app)
    .post('/api/users/signUp')
    .send({
      email,
      password,
    })
    .expect(201);

  const cookie = response.get('Set-Cookie');
  return cookie;
};
