import { useState } from 'react';
import Router from 'next/router';

import useRequest from '../../hooks/useRequest';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { errors, doRequest } = useRequest({
    url: '/api/users/signIn',
    method: 'post',
    body: {
      email,
      password,
    },
    onSuccess: () => Router.push('/'),
  });

  const handleSubmit = async e => {
    e.preventDefault();

    const data = await doRequest();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Sign In</h1>
      <div className='form-group'>
        <label htmlFor=''>Email Address</label>
        <input
          type='text'
          className='form-control'
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      <div className='form-group'>
        <label htmlFor=''>Password</label>
        <input
          type='password'
          className='form-control'
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>
      {errors}

      <button className='btn btn-primary' type='submit'>
        Sign In
      </button>
    </form>
  );
};

export default SignIn;
