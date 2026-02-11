import { useParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';

const GET_CHARITY = gql`
  query GetCharity($slug: String!) {
    charity(slug: $slug) {
      id
      name
      description
      mission
      websiteUrl
      ein
      causeTags
    }
  }
`;

interface Charity {
  id: string;
  name: string;
  description: string | null;
  mission: string | null;
  websiteUrl: string | null;
  ein: string | null;
  causeTags: string[];
}

export function CharityDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { loading, error, data } = useQuery(GET_CHARITY, {
    variables: { slug },
    skip: !slug,
  });

  if (loading) {
    return <p className="text-text-secondary">Loading...</p>;
  }

  if (error) {
    return <p className="text-error">Error: {error.message}</p>;
  }

  const charity: Charity | null = data?.charity;

  if (!charity) {
    return <p className="text-text-secondary">Charity not found.</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-text-primary mb-2">{charity.name}</h1>

      {charity.ein && (
        <p className="text-text-secondary text-sm mb-4">EIN: {charity.ein}</p>
      )}

      {charity.mission && (
        <div className="mb-4">
          <h2 className="font-bold text-text-primary mb-1">Mission</h2>
          <p className="text-text-secondary">{charity.mission}</p>
        </div>
      )}

      {charity.description && (
        <div className="mb-4">
          <h2 className="font-bold text-text-primary mb-1">About</h2>
          <p className="text-text-secondary">{charity.description}</p>
        </div>
      )}

      {charity.causeTags.length > 0 && (
        <div className="flex gap-2 mb-6">
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

      {charity.websiteUrl && (
        <a
          href={charity.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-brand-primary text-white px-4 py-2 rounded-md hover:opacity-90"
        >
          Donate
        </a>
      )}
    </div>
  );
}
