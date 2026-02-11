import { createBrowserRouter } from 'react-router-dom';
import { PageShell } from './components/layout/PageShell';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Verify } from './pages/Verify';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
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
    path: '/onboarding',
    element: (
      <ProtectedRoute>
        <PageShell><Onboarding /></PageShell>
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
