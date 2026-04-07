import { createBrowserRouter } from 'react-router-dom';
import { PageShell } from './components/layout/PageShell';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminRoute } from './components/layout/AdminRoute';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Verify } from './pages/Verify';
import { Preferences } from './pages/Preferences';
import { Charities } from './pages/Charities';
import { CharityDetail } from './pages/CharityDetail';
import { Admin } from './pages/Admin';
import { AdminCharityEdit } from './pages/AdminCharityEdit';
import { CharitiesLocationFirstPOC } from './pages/CharitiesLocationFirstPOC';
import { Organizations } from './pages/Organizations';
import { Causes } from './pages/Causes';
import { OrganizationsDirectory } from './pages/OrganizationsDirectory';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PageShell fullWidth><Home /></PageShell>,
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
    path: '/map',
    element: <PageShell fullWidth><Charities /></PageShell>,
  },
  {
    path: '/causes',
    element: <PageShell background="var(--bg-secondary)"><Causes /></PageShell>,
  },
  {
    path: '/list',
    element: <PageShell background="var(--bg-secondary)"><Organizations /></PageShell>,
  },
  {
    path: '/list/explore',
    element: <PageShell background="var(--bg-secondary)"><OrganizationsDirectory /></PageShell>,
  },
{
    path: '/charities/poc-2',
    element: <PageShell fullWidth><CharitiesLocationFirstPOC /></PageShell>,
  },
  {
    path: '/charities/:slug',
    element: <PageShell background="var(--bg-secondary)"><CharityDetail /></PageShell>,
  },
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <PageShell><Admin /></PageShell>
      </AdminRoute>
    ),
  },
  {
    path: '/admin/charities/:slug',
    element: (
      <AdminRoute>
        <PageShell><AdminCharityEdit /></PageShell>
      </AdminRoute>
    ),
  },
]);
