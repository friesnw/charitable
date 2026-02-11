import { Link } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';

const GET_CHARITIES = gql`
  query GetCharities {
    charities {
      id
      slug
      name
      description
      causeTags
    }
  }
`;

interface Charity {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  causeTags: string[];
}

export function Charities() {
  const { loading, error, data } = useQuery(GET_CHARITIES);

  if (loading) {
    return <p className="text-text-secondary">Loading charities...</p>;
  }

  if (error) {
    return <p className="text-error">Error: {error.message}</p>;
  }

  const charities: Charity[] = data?.charities || [];

  return (
    <div>
      <h1 className="text-xl font-bold text-text-primary mb-4">Find Charities</h1>

      {charities.length === 0 ? (
        <p className="text-text-secondary">No charities found.</p>
      ) : (
        <ul className="space-y-4">
          {charities.map((charity) => (
            <li key={charity.id}>
              <Link
                to={`/charities/${charity.slug}`}
                className="block p-4 border border-brand-tertiary rounded-lg hover:border-brand-primary"
              >
                <h2 className="font-bold text-text-primary">{charity.name}</h2>
                {charity.description && (
                  <p className="text-text-secondary mt-1">{charity.description}</p>
                )}
                {charity.causeTags.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {charity.causeTags.map((tag) => (
                      <span
                        key={tag}
                        className="text-sm px-2 py-1 bg-bg-accent text-text-secondary rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
