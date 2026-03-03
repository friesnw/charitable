import { useAuth } from '../hooks/useAuth';
import { ButtonLink } from '../components/ui/Button';

export function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-xl font-bold text-text-primary mb-4">Dashboard</h1>

      <p className="text-text-secondary mb-6">
        Welcome back{user?.name ? `, ${user.name}` : ''}!
      </p>

      {/* Placeholder for future donation stats */}
      <div className="bg-bg-accent border border-brand-tertiary rounded-lg p-6 mb-6">
        <p className="text-text-secondary text-center">
          Donation tracking coming soon
        </p>
      </div>

      <ButtonLink to="/charities" variant="primary">
        Discover charities
      </ButtonLink>
    </div>
  );
}
