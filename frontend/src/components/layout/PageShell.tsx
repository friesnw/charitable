import { ReactNode } from 'react';
import { Header } from './Header';

interface PageShellProps {
  children: ReactNode;
  fullWidth?: boolean;
}

export function PageShell({ children, fullWidth }: PageShellProps) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />
      <main className={fullWidth ? '' : 'container mx-auto px-4 py-8'}>
        {children}
      </main>
    </div>
  );
}
