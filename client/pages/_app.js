import 'bootstrap/dist/css/bootstrap.css';

import Header from '../components/Header';
import { buildClient } from '../apis/build-client';

function AppComponent({ Component, pageProps, currentUser }) {
  return (
    <div>
      <Header currentUser={currentUser} />
      <div className='container'>
        <Component {...pageProps} currentUser={currentUser} />
      </div>
    </div>
  );
}

AppComponent.getInitialProps = async appContext => {
  const client = buildClient(appContext.ctx);
  const { data } = await client.get(`/api/users/currentUser`);

  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(
      appContext.ctx,
      client,
      data.currentUser
    );
  }

  return {
    pageProps,
    currentUser: data.currentUser,
  };
};

export default AppComponent;
