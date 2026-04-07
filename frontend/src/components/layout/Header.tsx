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
  const { isAuthenticated, isLoading: authLoading, user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [runSearch, { data: searchData }] = useLazyQuery(SEARCH_CHARITIES);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

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
    setMobileMenuOpen(false);
    navigate(`/charities/${slug}`);
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
    setSearchQuery('');
    setSearchOpen(false);
  }

  return (
    <>
      <header className="bg-brand-primary border-b border-white/10">
        <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 font-heading font-bold text-white" style={{ fontSize: '1.5rem' }}>
              <span>Good<span style={{ color: 'var(--brand-accent)', marginLeft: '0.05em' }}>Local</span></span>
              <img src="/logo-icon.svg" alt="" aria-hidden="true" className="h-6 w-auto" />
            </Link>
            <div className="hidden lg:flex items-center gap-6 ml-4 mt-1">
              <Link to="/map" className="text-white/70 hover:text-white text-sm">Explore Map</Link>
              <Link to="/list" className="text-white/70 hover:text-white text-sm">Browse Nonprofits</Link>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Desktop search */}
            <div
              className={`relative hidden lg:flex items-center`}
              ref={searchRef}
            >
              <div className={`${searchExpanded ? 'flex items-center flex-1' : 'hidden lg:flex'} items-center`}>
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

            {!authLoading && (isAuthenticated ? (
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
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <ButtonLink to="/login" variant="secondary-dark">Log in</ButtonLink>
                <ButtonLink to="/login" variant="primary">Sign up</ButtonLink>
              </div>
            ))}

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex flex-col items-center justify-center w-11 h-11 gap-1.5"
              aria-label="Menu"
            >
              <span className={`block w-5 h-0.5 bg-white transition-transform origin-center ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-white transition-transform origin-center ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile full-screen menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-brand-primary flex flex-col lg:hidden">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="flex items-center gap-2 font-heading font-bold text-white"
              style={{ fontSize: '1.5rem' }}
            >
              <span>Good<span style={{ color: 'var(--brand-accent)', marginLeft: '0.05em' }}>Local</span></span>
              <img src="/logo-icon.svg" alt="" aria-hidden="true" className="h-6 w-auto" />
            </Link>
            <button
              onClick={closeMobileMenu}
              className="flex items-center justify-center w-11 h-11 text-white/80 hover:text-white"
              aria-label="Close menu"
            >
              <Icon name="close" className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="px-4 pt-5 pb-3 shrink-0">
            <div className="relative">
              <Icon name="search" className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search charities..."
                className="w-full pl-11 pr-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/40 text-base focus:outline-none focus:bg-white/15 focus:border-white/40"
              />
            </div>
            {searchOpen && searchData?.charities && searchData.charities.length > 0 && (
              <ul className="mt-2 bg-bg-primary border border-brand-tertiary rounded-xl shadow-lg max-h-52 overflow-y-auto">
                {searchData.charities.map((charity: { id: string; name: string; slug: string }) => (
                  <li key={charity.id}>
                    <button
                      onClick={() => handleSelectCharity(charity.slug)}
                      className="w-full text-left px-4 py-3 text-sm text-text-primary hover:bg-bg-accent first:rounded-t-xl last:rounded-b-xl"
                    >
                      {charity.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {searchOpen && searchData?.charities && searchData.charities.length === 0 && (
              <div className="mt-2 bg-bg-primary border border-brand-tertiary rounded-xl shadow-lg px-4 py-3 text-sm text-text-secondary">
                No charities found
              </div>
            )}
          </div>

          {/* Nav links */}
          <nav className="flex-1 px-4 py-2 overflow-y-auto">
            <Link
              to="/map"
              onClick={closeMobileMenu}
              className="flex items-center px-2 py-4 text-lg text-white border-b border-white/10"
            >
              Explore Map
            </Link>
            <Link
              to="/list"
              onClick={closeMobileMenu}
              className="flex items-center px-2 py-4 text-lg text-white border-b border-white/10"
            >
              Browse Nonprofits
            </Link>
            {isAuthenticated && (
              <Link
                to="/preferences"
                onClick={closeMobileMenu}
                className="flex items-center px-2 py-4 text-lg text-white border-b border-white/10"
              >
                Preferences
              </Link>
            )}
            {user?.isAdmin && (
              <Link
                to="/admin"
                onClick={closeMobileMenu}
                className="flex items-center px-2 py-4 text-lg text-white border-b border-white/10"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Auth section */}
          <div className="px-4 pt-4 pb-10 border-t border-white/10 shrink-0">
            {!authLoading && (isAuthenticated ? (
              <>
                <p className="text-sm text-white/50 mb-4 truncate">{user?.email}</p>
                <button
                  onClick={() => { closeMobileMenu(); logout(); }}
                  className="w-full text-left px-4 py-3 text-sm text-white/70 hover:text-white border border-white/20 rounded-full text-center"
                >
                  Log out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <ButtonLink
                  to="/login"
                  variant="secondary-dark"
                  className="w-full justify-center"
                  onClick={closeMobileMenu}
                >
                  Log in
                </ButtonLink>
                <ButtonLink
                  to="/login"
                  variant="primary"
                  className="w-full justify-center"
                  onClick={closeMobileMenu}
                >
                  Sign up
                </ButtonLink>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
