import { useParams, Link } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';

const GET_CHARITY = gql`
  query GetCharity($slug: String!) {
    charity(slug: $slug) {
      id
      name
      slug
      description
      websiteUrl
      volunteerUrl
      primaryAddress
      ein
      foundedYear
      everyOrgSlug
      causeTags
      locations {
        id
        label
        description
        address
      }
    }
  }
`;

interface CharityLocation {
  id: string;
  label: string;
  description: string | null;
  address: string | null;
}

interface Charity {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  websiteUrl: string | null;
  volunteerUrl: string | null;
  primaryAddress: string | null;
  ein: string;
  foundedYear: number | null;
  everyOrgSlug: string | null;
  causeTags: string[];
  locations: CharityLocation[];
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
      <Link to="/charities" className="text-brand-primary hover:underline text-sm mb-4 inline-block">
        &larr; Back to charities
      </Link>

      <h1 className="text-xl font-bold text-text-primary mb-1">{charity.name}</h1>

      <div className="text-text-secondary text-sm mb-4 space-x-3">
        {charity.foundedYear && <span>Founded {charity.foundedYear}</span>}
        <span>EIN: {charity.ein}</span>
      </div>

      {charity.description && (
        <div className="mb-6">
          <h2 className="font-bold text-text-primary mb-1">About</h2>
          <p className="text-text-secondary">{charity.description}</p>
        </div>
      )}

      {charity.causeTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
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

      {charity.primaryAddress && (
        <div className="mb-6">
          <h2 className="font-bold text-text-primary mb-1">Address</h2>
          <p className="text-text-secondary">{charity.primaryAddress}</p>
        </div>
      )}

      {charity.locations.length > 0 && (
        <div className="mb-6">
          <h2 className="font-bold text-text-primary mb-2">Locations</h2>
          <ul className="space-y-3">
            {charity.locations.map((loc) => (
              <li key={loc.id} className="p-3 border border-brand-tertiary rounded-md">
                <p className="font-medium text-text-primary">{loc.label}</p>
                {loc.address && (
                  <p className="text-text-secondary text-sm">{loc.address}</p>
                )}
                {loc.description && (
                  <p className="text-text-secondary text-sm mt-1">{loc.description}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {charity.everyOrgSlug && (
          <a
            href={`https://www.every.org/${charity.everyOrgSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-brand-primary text-white px-4 py-2 rounded-md hover:opacity-90"
          >
            Donate
          </a>
        )}

        {charity.volunteerUrl && (
          <a
            href={charity.volunteerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-brand-primary text-brand-primary px-4 py-2 rounded-md hover:bg-bg-accent"
          >
            Volunteer
          </a>
        )}

        {charity.websiteUrl && (
          <a
            href={charity.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-brand-primary hover:underline px-4 py-2"
          >
            Visit website
          </a>
        )}
      </div>
    </div>
  );
}
