import { ReactNode } from 'react';
import { Header } from './Header';

interface PageShellProps {
  children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
