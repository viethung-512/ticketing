function OrderList({ orders }) {
  console.log({ orders });
  return (
    <div>
      <h1>Order List</h1>
      <ul>
        {orders.map(order => (
          <li key={order.id}>
            {order.ticket.title} - {order.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

OrderList.getInitialProps = async (context, client) => {
  const { data } = await client.get('/api/orders');

  return { orders: data };
};

export default OrderList;
