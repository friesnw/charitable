import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { NearbyCharityCard } from './NearbyCharityCard';

const MOCK_CHARITY = {
  id: '1',
  name: 'Denver Food Bank',
  slug: 'denver-food-bank',
  description: 'Feeding families across the Denver metro since 1978. We distribute millions of pounds of food annually through a network of partner agencies.',
  causeTags: ['food-security', 'hunger'],
  locations: [
    {
      id: 'loc-1',
      photoUrl: null,
      latitude: 39.7119,
      longitude: -104.9494,
    },
  ],
};

const TAG_LABELS = new Map([
  ['food-security', 'Food Security'],
  ['hunger', 'Hunger'],
  ['housing', 'Housing'],
  ['education', 'Education'],
]);

const meta = {
  title: 'Components/NearbyCharityCard',
  component: NearbyCharityCard,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ maxWidth: 320, padding: 16 }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof NearbyCharityCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDistance: Story = {
  args: {
    charity: MOCK_CHARITY,
    distance: 0.4,
    tagLabels: TAG_LABELS,
  },
};

export const InNeighborhood: Story = {
  args: {
    charity: MOCK_CHARITY,
    distance: 0.2,
    tagLabels: TAG_LABELS,
  },
};

export const NoDistance: Story = {
  args: {
    charity: MOCK_CHARITY,
    distance: null,
    tagLabels: TAG_LABELS,
  },
};

export const HousingCharity: Story = {
  args: {
    charity: {
      ...MOCK_CHARITY,
      id: '2',
      name: 'Denver Housing Authority',
      slug: 'denver-housing',
      description: 'Providing affordable housing solutions to Denver residents in need.',
      causeTags: ['housing'],
    },
    distance: 1.2,
    tagLabels: TAG_LABELS,
  },
};

export const Grid: StoryObj = {
  render: () => (
    <MemoryRouter>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 16, maxWidth: 700 }}>
        {[
          { id: '1', name: 'Denver Food Bank', slug: 'food-bank', description: 'Feeding families since 1978.', causeTags: ['food-security'], locations: [{ id: 'l1', photoUrl: null, latitude: 39.71, longitude: -104.94 }] },
          { id: '2', name: 'Mile High Housing', slug: 'mile-high', description: 'Affordable housing for all.', causeTags: ['housing'], locations: [{ id: 'l2', photoUrl: null, latitude: 39.73, longitude: -104.98 }] },
          { id: '3', name: 'Denver Art Alliance', slug: 'art-alliance', description: 'Bringing art to the community.', causeTags: ['arts'], locations: [{ id: 'l3', photoUrl: null, latitude: 39.74, longitude: -104.99 }] },
          { id: '4', name: 'Green Denver', slug: 'green-denver', description: 'Environmental stewardship for a greener city.', causeTags: ['environment'], locations: [{ id: 'l4', photoUrl: null, latitude: 39.72, longitude: -104.97 }] },
        ].map((c, i) => (
          <NearbyCharityCard
            key={c.id}
            charity={c}
            distance={[0.3, 0.8, 1.5, 2.1][i]}
            tagLabels={TAG_LABELS}
          />
        ))}
      </div>
    </MemoryRouter>
  ),
};
