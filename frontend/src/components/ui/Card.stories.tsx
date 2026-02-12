import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CharityCard } from './Card';

const cardMeta = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default cardMeta;
type Story = StoryObj<typeof cardMeta>;

export const Default: Story = {
  args: { children: 'This is a basic card with some content inside.' },
};

export const Charity: StoryObj<typeof CharityCard> = {
  render: (args) => <CharityCard {...args} />,
  args: {
    name: 'Denver Rescue Mission',
    mission: 'Providing hope and help for those experiencing homelessness and addiction.',
    tags: ['homelessness', 'hunger', 'housing'],
  },
};
