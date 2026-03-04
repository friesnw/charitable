import type { Meta, StoryObj } from '@storybook/react-vite';
import { DonateButton } from './DonateButton';

const meta = {
  title: 'UI/DonateButton',
  component: DonateButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Renders an Every.org embedded donate widget. Requires the Every.org script to be loaded (`button.js?explicit=1`). In Storybook the widget script is not present, so only the container div renders.',
      },
    },
  },
} satisfies Meta<typeof DonateButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { nonprofitSlug: 'habitat-for-humanity' },
};

export const WithColor: Story = {
  args: { nonprofitSlug: 'habitat-for-humanity', color: '#2B6CB0' },
};

export const Stretched: Story = {
  args: { nonprofitSlug: 'habitat-for-humanity', color: '#38A169', className: 'w-full' },
};
