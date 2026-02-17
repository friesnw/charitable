import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { H1 } from '../components/ui/Typography';


export function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className=" mx-auto">
      {/* Hero */}
      <section className="text-center py-16 px-4">
        <H1 className="font-sans font-bold text-text-primary leading-tight">
          There's a good cause just around the corner.
        </H1>
        <p className="font-sans text-lg text-text-secondary mt-4 max-w-xl mx-auto">
          Give to Denver nonprofits that make an impact locally.
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <Link
            to="/charities"
            className="inline-flex items-center justify-center px-6 py-3 font-sans text-base rounded-md bg-brand-primary text-white hover:opacity-90 transition-opacity"
          >
            View local charities
          </Link>
          {!isAuthenticated && (
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-3 font-sans text-base rounded-md bg-brand-tertiary text-text-primary hover:opacity-80 transition-opacity"
            >
              Log in
            </Link>
          )}
        </div>
      </section>

      {/* Denver callout */}
      <section className="text-center px-4 py-12">
        <p className="font-sans text-sm text-text-secondary max-w-md mx-auto">
          We're starting in Denver because proximity builds meaning. More cities coming soon.
        </p>
      </section>
    </div>
  );
}
