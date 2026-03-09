import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { CharityPreviewDrawer } from './CharityPreviewDrawer';

const MOCK_CHARITY = {
  id: '1',
  name: 'Denver Food Bank',
  slug: 'denver-food-bank',
  description: 'Feeding families across the Denver metro since 1978. We distribute millions of pounds of food annually through a network of partner agencies.',
  causeTags: ['food-security', 'hunger'],
  donateUrl: 'https://www.foodbankrockies.org/donate',
  locations: [
    {
      id: 'loc-1',
      label: 'Main Distribution Center',
      address: '4500 Cherry Creek Dr S, Denver, CO 80246',
      photoUrl: null,
      latitude: 39.7119,
      longitude: -104.9494,
    },
  ],
};

const MOCK_TAG_LABELS = new Map([
  ['food-security', 'Food Security'],
  ['hunger', 'Hunger'],
]);

const meta = {
  title: 'Components/CharityPreviewDrawer',
  component: CharityPreviewDrawer,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ height: '100vh', position: 'relative', background: '#f3f4f6' }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof CharityPreviewDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    charity: MOCK_CHARITY,
    selectedLocationId: 'loc-1',
    distance: 0.3,
    tagLabels: MOCK_TAG_LABELS,
    onClose: () => {},
  },
};

export const InYourNeighborhood: Story = {
  args: {
    charity: MOCK_CHARITY,
    selectedLocationId: 'loc-1',
    distance: 0.2,
    tagLabels: MOCK_TAG_LABELS,
    onClose: () => {},
  },
};

export const NoDistance: Story = {
  args: {
    charity: MOCK_CHARITY,
    selectedLocationId: 'loc-1',
    distance: null,
    tagLabels: MOCK_TAG_LABELS,
    onClose: () => {},
  },
};

export const Closed: Story = {
  args: {
    charity: MOCK_CHARITY,
    selectedLocationId: null,
    distance: null,
    tagLabels: MOCK_TAG_LABELS,
    onClose: () => {},
  },
};
