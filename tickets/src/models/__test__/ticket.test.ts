import { Ticket } from '../ticket';

it('implement optimistic concurrency control', async done => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: 'rehaorheoarhjeoho',
  });
  await ticket.save();

  const ticket1 = await Ticket.findById(ticket.id);
  const ticket2 = await Ticket.findById(ticket.id);

  ticket1!.price = 11;
  ticket2!.price = 22;

  await ticket1!.save();
  try {
    await ticket2!.save();
  } catch (err) {
    return done();
  }

  throw new Error('Should not reach this point!');
});

it('auto increment version after update', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: 'rehaorheo',
  });
  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
