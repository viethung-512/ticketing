import request from 'supertest';
import { app } from '../../../utils/app';

it('GET_TICKET: return 404 if can not found ticket', async () => {
  await request(app).get('/api/tickets/ofjdaojroer').send({}).expect(404);
});

it('GET_TICKET: return ticket if found ticket', async () => {
  const title = 'this is title';
  const price = 12;
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getAuthCookie())
    .send({ title: 'this is title', price: 12 })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send({})
    .expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});
