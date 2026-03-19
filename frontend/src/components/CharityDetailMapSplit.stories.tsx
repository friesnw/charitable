import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CharityDetailMapSplit } from './CharityDetailMapSplit';

const ONE_LOCATION = [
  {
    id: 'loc-1',
    label: 'Urban Peak',
    description: 'Drop-in services, shelter, and outreach for youth experiencing homelessness.',
    address: '730 21st St, Denver, CO 80205',
    latitude: 39.7543,
    longitude: -104.9863,
    photoUrl: null,
  },
];

const MANY_LOCATIONS = [
  { id: 'loc-1', label: 'City Park Garden', description: 'Vegetable beds open to the public.', address: '2001 Colorado Blvd, Denver, CO 80205', latitude: 39.7472, longitude: -104.9496, photoUrl: null },
  { id: 'loc-2', label: 'Globeville Plot', description: 'Community plot near I-25.', address: '4600 N Pecos St, Denver, CO 80211', latitude: 39.7832, longitude: -104.9972, photoUrl: null },
  { id: 'loc-3', label: 'Swansea Garden', description: 'Youth gardening programs.', address: '4650 Columbine St, Denver, CO 80216', latitude: 39.7748, longitude: -104.9543, photoUrl: null },
  { id: 'loc-4', label: 'Clayton Beds', description: 'Raised beds in Clayton neighborhood.', address: '3300 Dahlia St, Denver, CO 80207', latitude: 39.7428, longitude: -104.9280, photoUrl: null },
  { id: 'loc-5', label: 'Cole Community Plot', description: null, address: '3540 Humboldt St, Denver, CO 80205', latitude: 39.7593, longitude: -104.9766, photoUrl: null },
  { id: 'loc-6', label: 'Overland Garden', description: 'South Denver plot near the South Platte.', address: '1000 W Jewell Ave, Denver, CO 80223', latitude: 39.6909, longitude: -105.0151, photoUrl: null },
  { id: 'loc-7', label: 'Sun Valley Beds', description: 'Near Mile High Stadium.', address: '1100 Decatur St, Denver, CO 80204', latitude: 39.7413, longitude: -105.0165, photoUrl: null },
  { id: 'loc-8', label: 'Montbello Garden', description: 'Far northeast community plot.', address: '12150 Albrook Dr, Denver, CO 80239', latitude: 39.7878, longitude: -104.8452, photoUrl: null },
  { id: 'loc-9', label: 'Barnum West Plot', description: null, address: '520 Hooker St, Denver, CO 80204', latitude: 39.7093, longitude: -105.0237, photoUrl: null },
  { id: 'loc-10', label: 'Harvey Park Garden', description: 'Southwest Denver neighborhood beds.', address: '2800 S Utica St, Denver, CO 80219', latitude: 39.6713, longitude: -105.0387, photoUrl: null },
  { id: 'loc-11', label: 'Stapleton Plot', description: 'Central Park community garden.', address: '8900 E 29th Ave, Denver, CO 80238', latitude: 39.7489, longitude: -104.8807, photoUrl: null },
  { id: 'loc-12', label: 'Lincoln Park', description: null, address: '1000 Osage St, Denver, CO 80204', latitude: 39.7348, longitude: -105.0087, photoUrl: null },
];

const meta = {
  title: 'Components/CharityDetailMapSplit',
  component: CharityDetailMapSplit,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof CharityDetailMapSplit>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OneLocation: Story = {
  render: () => {
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
    return (
      <CharityDetailMapSplit
        locations={ONE_LOCATION}
        causeTags={['housing', 'youth']}
        color="#A855F7"
        locationDescription="Urban Peak serves youth experiencing homelessness in downtown Denver."
        selectedLocationId={selectedLocationId}
        onSelectLocation={setSelectedLocationId}
      />
    );
  },
};

export const ManyLocations: Story = {
  render: () => {
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
    return (
      <CharityDetailMapSplit
        locations={MANY_LOCATIONS}
        causeTags={['environment', 'hunger']}
        color="#22C55E"
        locationDescription="Denver Urban Gardens maintains over 180 community garden sites across the city."
        selectedLocationId={selectedLocationId}
        onSelectLocation={setSelectedLocationId}
      />
    );
  },
};
