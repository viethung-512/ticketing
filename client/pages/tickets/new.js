import { useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/useRequest';

function NewTicket(props) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const { doRequest, errors } = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: { title, price },
    onSuccess: data => {
      Router.push('/');
    },
  });

  const submitForm = e => {
    e.preventDefault();
    console.log({ title, price });
    doRequest();
  };

  const onBlur = () => {
    const value = parseFloat(price);
    if (isNaN(value)) {
      return;
    }

    setPrice(value.toFixed(2));
  };

  return (
    <div>
      <h1>create a ticket</h1>
      <form onSubmit={submitForm}>
        <div className='form-group'>
          <label>Title</label>
          <input
            type='text'
            className='form-control'
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div className='form-group'>
          <label>Price</label>
          <input
            type='text'
            className='form-control'
            onBlur={onBlur}
            value={price}
            onChange={e => setPrice(e.target.value)}
          />
        </div>
        {errors}
        <button type='submit' className='btn btn-primary'>
          Submit
        </button>
      </form>
    </div>
  );
}

export default NewTicket;
