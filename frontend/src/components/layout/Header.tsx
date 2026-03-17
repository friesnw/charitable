import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gql, useLazyQuery } from '@apollo/client';
import { useAuth } from '../../hooks/useAuth';
import { ButtonLink } from '../ui/Button';
import { Icon } from '../ui/Icon';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchToggleRef = useRef<HTMLButtonElement>(null);

  const [runSearch, { data: searchData }] = useLazyQuery(SEARCH_CHARITIES);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery('');
        setSearchExpanded(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
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

  return (
    <header className="bg-brand-primary border-b border-white/10">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-heading font-bold text-white" style={{ fontSize: '1.5rem' }}>
            <span>Good<span style={{ color: 'var(--brand-accent)', marginLeft: '0.05em' }}>Local</span></span>
            <img src="/logo-icon.svg" alt="" aria-hidden="true" className="h-6 w-auto" />
          </Link>
          <div className="hidden lg:flex items-center gap-6 ml-4 mt-1">
            <Link to="/charities" className="text-white/70 hover:text-white text-sm">Explore Map</Link>
            <Link to="/organizations" className="text-white/70 hover:text-white text-sm">Browse Nonprofits</Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div
            className={`relative ${searchExpanded ? 'absolute inset-x-0 z-40 px-4 flex items-center' : ''} lg:relative lg:inset-auto lg:flex-none`}
            ref={searchRef}
          >
            {/* Search icon button — mobile only, hidden when expanded */}
            <button
              ref={searchToggleRef}
              onClick={() => { setSearchExpanded(true); setTimeout(() => searchInputRef.current?.focus(), 0); }}
              className={`lg:hidden flex items-center justify-center w-11 h-11 rounded-full text-white/80 hover:text-white ${searchExpanded ? 'hidden' : ''}`}
              aria-label="Search charities"
            >
              <Icon name="search" className="w-5 h-5" />
            </button>

            {/* Input wrapper — hidden on mobile until expanded, always shown on desktop */}
            <div className={`${searchExpanded ? 'flex items-center flex-1' : 'hidden lg:flex'} items-center`}>
              {/* Close button — mobile only */}
              <button
                onClick={() => { setSearchExpanded(false); setSearchOpen(false); setSearchQuery(''); }}
                className="lg:hidden flex items-center justify-center w-11 h-11 text-white/70 mr-1"
                aria-label="Close search"
              >
                <Icon name="close" className="w-5 h-5" />
              </button>

              {/* Input */}
              <div className="relative flex-1">
                <Icon name="search" className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery.trim().length > 1 && setSearchOpen(true)}
                  placeholder="Search charities..."
                  className="w-full lg:w-48 pl-8 pr-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:bg-white/15 focus:border-white/40"
                />
              </div>
            </div>

            {searchOpen && searchData?.charities && searchData.charities.length > 0 && (
              <ul className="absolute top-full mt-1 left-0 right-0 lg:left-auto lg:right-0 lg:w-64 bg-bg-primary border border-brand-tertiary rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
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
              <div className="absolute top-full mt-1 left-0 right-0 lg:left-auto lg:right-0 lg:w-64 bg-bg-primary border border-brand-tertiary rounded-md shadow-lg z-50 px-4 py-2 text-sm text-text-secondary">
                No charities found
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <>
              <div className="hidden lg:block relative" ref={menuRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/30"
                  aria-label="Profile menu"
                >
                  <Icon name="user" className="w-5 h-5" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-bg-primary border border-brand-tertiary rounded-md shadow-lg py-1 z-50">
                    <span className="block px-4 py-2 text-sm text-text-secondary truncate">{user?.email}</span>
                    <hr className="border-brand-tertiary" />
                    <Link to="/preferences" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-text-secondary hover:bg-bg-accent hover:text-text-primary">Preferences</Link>
                    {user?.isAdmin && (
                      <Link to="/admin" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-text-secondary hover:bg-bg-accent hover:text-text-primary">Admin</Link>
                    )}
                    <button onClick={() => { setProfileOpen(false); logout(); }} className="block w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-bg-accent hover:text-text-primary">Log out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <ButtonLink to="/login" variant="primary" className="hidden lg:inline-flex">
              Log in
            </ButtonLink>
          )}

          {/* Hamburger — mobile only */}
          <div className="lg:hidden relative" ref={mobileMenuRef}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex flex-col items-center justify-center w-11 h-11 gap-1.5"
              aria-label="Menu"
            >
              <span className={`block w-5 h-0.5 bg-white transition-transform origin-center ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white transition-transform origin-center ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
            {mobileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-bg-primary border border-brand-tertiary rounded-xl shadow-xl py-3 z-50">
                {isAuthenticated ? (
                  <>
                    <span className="block px-4 py-2 text-xs text-text-secondary truncate">{user?.email}</span>
                    <hr className="border-brand-tertiary my-1" />
                    <Link to="/charities" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm text-text-primary hover:bg-bg-accent">Explore Map</Link>
                    <Link to="/organizations" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm text-text-primary hover:bg-bg-accent">Browse Nonprofits</Link>
                    <Link to="/preferences" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm text-text-primary hover:bg-bg-accent">Preferences</Link>
                    {user?.isAdmin && (
                      <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm text-text-primary hover:bg-bg-accent">Admin</Link>
                    )}
                    <hr className="border-brand-tertiary my-1" />
                    <button onClick={() => { setMobileMenuOpen(false); logout(); }} className="block w-full text-left px-4 py-3 text-sm text-text-secondary hover:bg-bg-accent">Log out</button>
                  </>
                ) : (
                  <>
                    <Link to="/charities" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm text-text-primary hover:bg-bg-accent">Explore Map</Link>
                    <Link to="/organizations" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm text-text-primary hover:bg-bg-accent">Browse Nonprofits</Link>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm text-text-primary hover:bg-bg-accent">Log in</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
