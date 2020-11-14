import { useState, useEffect, Fragment } from 'react';
import Router from 'next/router';
import StripeCheckout from 'react-stripe-checkout';

import useRequest from '../../hooks/useRequest';

function OrderDetails({ order, currentUser }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order?.id,
    },
    onSuccess: data => Router.push('/orders'),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    if (timeLeft < 0) {
      clearInterval(timerId);
    }

    return () => {
      clearInterval(timerId);
    };
  }, []);

  const onToken = async ({ id }) => {
    await doRequest({ token: id });
  };

  return (
    <div>
      <h1>Order details</h1>
      {timeLeft < 0 ? (
        <p>Order Expired</p>
      ) : (
        <Fragment>
          <p>Time left to pay: {timeLeft}s</p>
          {errors}

          <StripeCheckout
            token={onToken}
            stripeKey='pk_test_51Hn3xjHudqXfXUFkKIsISz1LMRhUprHnvmptKbt4vJtIWggQWQxmxYZf1yWK4NPegUV1UyjllYyjtM5dWqr8kFWu00h3poS3dd'
            email={currentUser.email}
            amount={order.ticket.price * 100}
          />
        </Fragment>
      )}
    </div>
  );
}

OrderDetails.getInitialProps = async (context, client) => {
  const { id } = context.query;
  const { data } = await client.get(`/api/orders/${id}`);

  return { order: data };
};

export default OrderDetails;
