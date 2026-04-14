import { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { trackEvent } from '../../utils/analytics';

interface PageShellProps {
  children: ReactNode;
  fullWidth?: boolean;
  background?: string;
}

// Module-level: shared across all PageShell instances, survives remounts
let lastTrackedPath: string | null = null;

export function PageShell({ children, fullWidth, background }: PageShellProps) {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== lastTrackedPath) {
      lastTrackedPath = location.pathname;
      trackEvent('page_view', { page: location.pathname });
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: background ?? 'var(--bg-primary)' }}>
      <Header />
      <main className={`flex-1 ${fullWidth ? '' : 'container mx-auto px-4 py-8'}`}>
        {children}
      </main>
      <footer className="border-t border-brand-tertiary mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-text-secondary">
          GoodLocal was built from a desire to be more connected with what's around us. If you have thoughts or suggestions, contact{' '}
          <a href="mailto:nick@goodlocal.org" className="text-text-primary hover:underline">nick@goodlocal.org</a>
        </div>
      </footer>
    </div>
  );
}
