import { createBrowserRouter } from 'react-router-dom';
import { PageShell } from './components/layout/PageShell';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Verify } from './pages/Verify';
import { Dashboard } from './pages/Dashboard';
import { Preferences } from './pages/Preferences';
import { Charities } from './pages/Charities';
import { CharityDetail } from './pages/CharityDetail';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PageShell><Home /></PageShell>,
  },
  {
    path: '/login',
    element: <PageShell><Login /></PageShell>,
  },
  {
    path: '/auth/verify',
    element: <PageShell><Verify /></PageShell>,
  },
  {
    path: '/preferences',
    element: (
      <ProtectedRoute>
        <PageShell><Preferences /></PageShell>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <PageShell><Dashboard /></PageShell>
      </ProtectedRoute>
    ),
  },
  {
    path: '/charities',
    element: <PageShell><Charities /></PageShell>,
  },
  {
    path: '/charities/:slug',
    element: <PageShell><CharityDetail /></PageShell>,
  },
]);
