import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../../../utils/app';
import { Ticket } from '../../../models/ticket';

const createRandomTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  return ticket;
};

it('GET_TICKETS: success fetch order for an particular user', async () => {
  const ticket1 = await createRandomTicket();
  const ticket2 = await createRandomTicket();
  const ticket3 = await createRandomTicket();

  const userOne = global.getAuthCookie();
  const userTwo = global.getAuthCookie();

  await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticket1.id })
    .expect(201);
  const { body: orderOne } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticket2.id })
    .expect(201);
  const { body: orderTwo } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticket3.id })
    .expect(201);

  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', userTwo)
    .send({})
    .expect(200);

  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderOne.id);
  expect(response.body[1].id).toEqual(orderTwo.id);
});
