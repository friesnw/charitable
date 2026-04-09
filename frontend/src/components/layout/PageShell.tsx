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
    <div className="min-h-screen" style={{ backgroundColor: background ?? 'var(--bg-primary)' }}>
      <Header />
      <main className={fullWidth ? '' : 'container mx-auto px-4 py-8'}>
        {children}
      </main>
    </div>
  );
}
