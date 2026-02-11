import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Location = 'denver' | 'other' | null;

export function Onboarding() {
  const navigate = useNavigate();
  const [location, setLocation] = useState<Location>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) return;

    // TODO: Save preferences via GraphQL mutation
    console.log('Saving preferences:', { location });

    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-bold text-text-primary mb-4">Welcome!</h1>
      <p className="text-text-secondary mb-6">
        Let's get you set up. Where are you located?
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 border border-brand-tertiary rounded-md cursor-pointer hover:border-brand-primary">
            <input
              type="radio"
              name="location"
              value="denver"
              checked={location === 'denver'}
              onChange={() => setLocation('denver')}
              className="text-brand-primary"
            />
            <span className="text-text-primary">Denver, CO</span>
          </label>

          <label className="flex items-center gap-3 p-3 border border-brand-tertiary rounded-md cursor-pointer hover:border-brand-primary">
            <input
              type="radio"
              name="location"
              value="other"
              checked={location === 'other'}
              onChange={() => setLocation('other')}
              className="text-brand-primary"
            />
            <span className="text-text-primary">Other location</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={!location}
          className="w-full bg-brand-primary text-white px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
