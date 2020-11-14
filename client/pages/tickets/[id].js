import Router from 'next/router';
import useRequest from '../../hooks/useRequest';

function TicketDetail({ ticket }) {
  const { doRequest, errors } = useRequest({
    method: 'post',
    url: '/api/orders',
    body: { ticketId: ticket.id },
    onSuccess: order => Router.push('/orders/[id]', `/orders/${order.id}`),
  });

  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>Price: {ticket.price}</h4>
      {errors}
      <button className='btn btn-primary' onClick={() => doRequest()}>
        Purchase
      </button>
    </div>
  );
}

TicketDetail.getInitialProps = async (context, client) => {
  const { id } = context.query;
  const { data } = await client.get(`/api/tickets/${id}`);

  return { ticket: data };
};

export default TicketDetail;
