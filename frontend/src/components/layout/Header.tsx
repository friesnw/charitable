import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="bg-bg-primary border-b border-brand-tertiary">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-text-primary">
          Charitable
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/charities" className="text-text-secondary hover:text-text-primary">
            Find Charities
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-text-secondary hover:text-text-primary">
                Dashboard
              </Link>
              <span className="text-text-secondary">{user?.email}</span>
              <button
                onClick={logout}
                className="text-text-secondary hover:text-text-primary"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-brand-primary text-white px-4 py-2 rounded-md hover:opacity-90"
            >
              Log in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
