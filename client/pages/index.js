import Link from 'next/link';

function LandingPage({ currentUser, tickets }) {
  const ticketList = tickets.map(t => (
    <tr key={t.id}>
      <td>{t.title}</td>
      <td>{t.price}</td>
      <td>
        <Link href='/tickets/[id]' as={`/tickets/${t.id}`}>
          <a>View</a>
        </Link>
      </td>
    </tr>
  ));

  return (
    <div>
      <h1>Tickets</h1>
      <table className='table'>
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>{tickets.length > 0 && ticketList}</tbody>
      </table>
    </div>
  );
}

LandingPage.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get('/api/tickets');
  return {
    tickets: data,
  };
};

export default LandingPage;
