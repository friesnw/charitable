import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Home() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div>
      <h1 className="text-xl font-bold text-text-primary mb-4">Home</h1>

      {isAuthenticated ? (
        <div className="space-y-4">
          <p className="text-text-secondary">You are logged in.</p>
          <button
            onClick={logout}
            className="text-brand-primary hover:underline"
          >
            Log out
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-text-secondary">Welcome to Charitable.</p>
          <Link
            to="/login"
            className="inline-block bg-brand-primary text-white px-4 py-2 rounded-md hover:opacity-90"
          >
            Log in
          </Link>
        </div>
      )}
    </div>
  );
}
