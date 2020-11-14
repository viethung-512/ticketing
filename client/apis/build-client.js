import axios from 'axios';

export const buildClient = ({ req }) => {
  if (typeof window === 'undefined') {
    // server side

    return axios.create({
      baseURL: `${req['x-forwarded-proto']}://${req.headers.host}`,
      headers: req.headers,
    });
  } else {
    // client side

    return axios.create({
      baseURL: '',
    });
  }
};
