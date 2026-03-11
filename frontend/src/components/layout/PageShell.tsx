import { ReactNode } from 'react';
import { Header } from './Header';

interface PageShellProps {
  children: ReactNode;
  fullWidth?: boolean;
  background?: string;
}

export function PageShell({ children, fullWidth, background }: PageShellProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: background ?? 'var(--bg-primary)' }}>
      <Header />
      <main className={fullWidth ? '' : 'container mx-auto px-4 py-8'}>
        {children}
      </main>
    </div>
  );
}
