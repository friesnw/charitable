import type { Meta, StoryObj } from '@storybook/react-vite';
import { DonateButton } from './DonateButton';

const meta = {
  title: 'UI/DonateButton',
  component: DonateButton,
  tags: ['autodocs'],
} satisfies Meta<typeof DonateButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { donateUrl: 'https://www.foodbankrockies.org/donate' },
};

export const WithColor: Story = {
  args: { donateUrl: 'https://www.foodbankrockies.org/donate', color: '#2B6CB0' },
};

export const Stretched: Story = {
  args: { donateUrl: 'https://www.foodbankrockies.org/donate', color: '#38A169', className: 'w-full' },
};
