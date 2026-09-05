import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        💰 Expense Tracker
      </Link>
      <ul className="nav-links">
        <li>
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            to="/expenses"
            className={`nav-link ${location.pathname === '/expenses' ? 'active' : ''}`}
          >
            Expenses
          </Link>
        </li>
        <li>
          <Link
            to="/expenses/add"
            className={`nav-link ${location.pathname === '/expenses/add' ? 'active' : ''}`}
          >
            + Add Expense
          </Link>
        </li>
      </ul>
    </nav>
  );
}
