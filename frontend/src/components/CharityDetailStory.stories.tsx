import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { CharityDetailStory } from './CharityDetailStory';

const MOCK_CHARITY = {
  id: '1',
  name: 'Denver Food Bank',
  slug: 'denver-food-bank',
  description:
    'The Food Bank of the Rockies is a nonprofit food bank dedicated to ending hunger in Colorado and Wyoming. Since 1978, we have been distributing food and connecting people in need with resources in their community.',
  logoUrl: null,
  coverPhotoUrl: null,
  contentPhotoUrl1: null,
  contentPhotoUrl2: null,
  websiteUrl: 'https://www.foodbankrockies.org',
  volunteerUrl: 'https://www.foodbankrockies.org/volunteer',
  primaryAddress: '10700 E 45th Ave, Denver, CO 80239',
  ein: '84-0772722',
  foundedYear: 1978,
  donateUrl: 'https://www.foodbankrockies.org/donate',
  causeTags: ['food-security', 'hunger'],
  impact: '500K+ meals distributed annually\n12,000 families served each month',
  programHighlights: '(heart)Serving families since 1978\n(people)12,000 families per month\n(star)Award-winning distribution network',
  usageCredit: null,
  locationDescription: null,
  locations: [
    {
      id: 'loc-1',
      label: 'Main Distribution Center',
      description: 'Our primary food distribution hub serving the Denver metro area.',
      address: '10700 E 45th Ave, Denver, CO 80239',
      latitude: 39.7739,
      longitude: -104.8328,
      photoUrl: null,
    },
    {
      id: 'loc-2',
      label: 'Curtis Park Pantry',
      description: 'Community pantry serving Five Points and Curtis Park neighborhoods.',
      address: '2700 Curtis St, Denver, CO 80205',
      latitude: 39.7572,
      longitude: -104.9791,
      photoUrl: null,
    },
  ],
};

const TAG_LABELS = new Map([
  ['food-security', 'Food Security'],
  ['hunger', 'Hunger'],
  ['housing', 'Housing'],
]);

const meta = {
  title: 'Components/CharityDetailStory',
  component: CharityDetailStory,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof CharityDetailStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDistance: Story = {
  args: {
    charity: MOCK_CHARITY,
    tagLabels: TAG_LABELS,
    // userDistance removed: 0.4,
  },
};

export const NoDistance: Story = {
  args: {
    charity: MOCK_CHARITY,
    tagLabels: TAG_LABELS,
    // userDistance removed: null,
  },
};

export const NeighborhoodDetected: Story = {
  args: {
    charity: {
      ...MOCK_CHARITY,
      primaryAddress: '2700 Curtis St, Denver, CO 80205',
    },
    tagLabels: TAG_LABELS,
    // userDistance removed: 0.2,
  },
};
