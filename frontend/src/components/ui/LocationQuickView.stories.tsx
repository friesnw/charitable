import type { Meta, StoryObj } from '@storybook/react';
import { LocationQuickView } from './LocationQuickView';

const meta: Meta<typeof LocationQuickView> = {
  component: LocationQuickView,
  title: 'UI/LocationQuickView',
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof LocationQuickView>;

const tagLabels = new Map([
  ['hunger', 'Hunger'],
  ['homelessness', 'Homelessness'],
  ['youth', 'Youth'],
]);

const baseGroup = {
  lat: 39.7392,
  lng: -104.9847,
  entries: [
    {
      charity: {
        name: 'Denver Rescue Mission',
        logoUrl: null,
        causeTags: ['hunger', 'homelessness'],
        description: 'Serving those in need across the Denver metro area.',
      },
      location: {
        label: 'Lawrence Street Community Center',
        photoUrl: null,
        latitude: 39.7392,
        longitude: -104.9847,
        isSublocation: false,
      },
    },
  ],
};

export const Default: Story = {
  args: {
    group: baseGroup,
    tagLabels,
    onExpand: () => {},
    onClose: () => {},
  },
};

export const MultipleEntries: Story = {
  args: {
    group: {
      ...baseGroup,
      entries: [
        ...baseGroup.entries,
        {
          charity: {
            name: 'Food Bank of the Rockies',
            logoUrl: null,
            causeTags: ['hunger'],
            description: 'Ending hunger in the Rocky Mountain region.',
          },
          location: {
            label: 'Food Bank of the Rockies — Shared Space',
            photoUrl: null,
            latitude: 39.7392,
            longitude: -104.9847,
            isSublocation: true,
          },
        },
      ],
    },
    tagLabels,
    onExpand: () => {},
    onClose: () => {},
  },
};
