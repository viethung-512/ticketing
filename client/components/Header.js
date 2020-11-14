import Link from 'next/link';

function Header({ currentUser }) {
  const links = [
    !currentUser && { label: 'Sign Up', href: '/auth/signUp' },
    !currentUser && { label: 'Sign In', href: '/auth/signIn' },
    currentUser && { label: 'Sell Tickets', href: '/tickets/new' },
    currentUser && { label: 'My Orders', href: '/orders/' },
    currentUser && { label: 'Sign Out', href: '/auth/signOut' },
  ]
    .filter(link => link)
    .map(link => (
      <li key={link.href} className='nav-item'>
        <Link href={link.href}>
          <a href='#' className='nav-link'>
            {link.label}
          </a>
        </Link>
      </li>
    ));

  return (
    <nav className='navbar navbar-light bg-light'>
      <Link href='/'>
        <a href='#' className='navbar-brand'>
          GitTix
        </a>
      </Link>
      <div className='d-flex justify-content-end'>
        <ul className='nav d-flex align-items-center'>{links}</ul>
      </div>
    </nav>
  );
}

export default Header;
