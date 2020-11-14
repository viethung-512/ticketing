import request from 'supertest';
import { app } from '../../../utils/app';

it('GET_TICKETS: return list tickets', async () => {
  const tickets = [
    { title: 'ticket1', price: 12 },
    { title: 'ticket2', price: 10 },
    { title: 'ticket3', price: 14 },
  ];

  const cookie = global.getAuthCookie();

  await Promise.all(
    tickets.map(async ticket => {
      await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send(ticket)
        .expect(201);
      return null;
    })
  );

  const response = await request(app).get('/api/tickets').expect(200);

  const ticketsResponse = response.body;

  expect(ticketsResponse.length).toEqual(tickets.length);
  ticketsResponse.forEach((t: { title: string; price: number }) => {
    const ticket = tickets.find(
      tic => tic.title === t.title && tic.price === t.price
    );
    expect(ticket?.title).not.toBeNull();
  });
});
