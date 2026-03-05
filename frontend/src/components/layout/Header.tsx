import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gql, useLazyQuery } from '@apollo/client';
import { useAuth } from '../../hooks/useAuth';
import { ButtonLink } from '../ui/Button';

const SEARCH_CHARITIES = gql`
  query SearchCharities($search: String) {
    charities(search: $search) {
      id
      name
      slug
    }
  }
`;

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [runSearch, { data: searchData }] = useLazyQuery(SEARCH_CHARITIES);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchExpanded(false);
        setSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim().length > 1) {
      runSearch({ variables: { search: value.trim() } });
      setSearchOpen(true);
    } else {
      setSearchOpen(false);
    }
  }

  function handleSelectCharity(slug: string) {
    setSearchQuery('');
    setSearchOpen(false);
    setSearchExpanded(false);
    navigate(`/charities/${slug}`);
  }

  function handleSearchIconClick() {
    setSearchExpanded(true);
    setTimeout(() => searchInputRef.current?.focus(), 0);
  }

  return (
    <header className="bg-brand-primary border-b border-white/10">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-heading font-bold text-white" style={{ fontSize: '1.5rem' }}>
          <span>Good<span style={{ color: 'var(--brand-accent)', marginLeft: '0.05em' }}>Local</span></span>
          <img src="/logo-icon.svg" alt="" aria-hidden="true" className="h-6 w-auto" />
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/charities" className="text-white/70 hover:text-white">
            Find Charities
          </Link>

          <div className="relative" ref={searchRef}>
            {searchExpanded ? (
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.trim().length > 1 && setSearchOpen(true)}
                placeholder="search a charity"
                className="w-44 px-2.5 py-1 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:bg-white/15 focus:border-white/40"
              />
            ) : (
              <button
                onClick={handleSearchIconClick}
                className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm"
                aria-label="Search charities"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
                </svg>
                <span>Search</span>
              </button>
            )}
            {searchOpen && searchData?.charities && searchData.charities.length > 0 && (
              <ul className="absolute top-full mt-1 right-0 w-64 bg-bg-primary border border-brand-tertiary rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                {searchData.charities.map((charity: { id: string; name: string; slug: string }) => (
                  <li key={charity.id}>
                    <button
                      onClick={() => handleSelectCharity(charity.slug)}
                      className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-accent"
                    >
                      {charity.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {searchOpen && searchData?.charities && searchData.charities.length === 0 && (
              <div className="absolute top-full mt-1 right-0 w-64 bg-bg-primary border border-brand-tertiary rounded-md shadow-lg z-50 px-4 py-2 text-sm text-text-secondary">
                No charities found
              </div>
            )}
          </div>

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
