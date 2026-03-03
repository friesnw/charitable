import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ButtonLink } from '../ui/Button';

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [profileOpen]);

  return (
    <header className="bg-brand-primary border-b border-white/10">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-white">
          Good<span style={{ color: 'var(--brand-accent)' }}>Local</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/charities" className="text-white/70 hover:text-white">
            Find Charities
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-white/70 hover:text-white">
                Dashboard
              </Link>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white hover:text-white"
                  aria-label="Profile menu"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-bg-primary border border-brand-tertiary rounded-md shadow-lg py-1 z-50">
                    <span className="block px-4 py-2 text-sm text-text-secondary truncate">
                      {user?.email}
                    </span>
                    <hr className="border-brand-tertiary" />
                    <Link
                      to="/preferences"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 text-sm text-text-secondary hover:bg-bg-accent hover:text-text-primary"
                    >
                      Preferences
                    </Link>
                    {user?.isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-2 text-sm text-text-secondary hover:bg-bg-accent hover:text-text-primary"
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-bg-accent hover:text-text-primary"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <ButtonLink to="/login" variant="primary">
              Log in
            </ButtonLink>
          )}
        </div>
      </nav>
    </header>
  );
}
