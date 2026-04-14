import type { Meta, StoryObj } from '@storybook/react-vite';
import { ShareButton } from './ShareButton';

const meta = {
  title: 'UI/ShareButton',
  component: ShareButton,
  tags: ['autodocs'],
} satisfies Meta<typeof ShareButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    url: 'https://goodlocal.org/charities/denver-food-bank',
    title: 'Denver Food Bank — GoodLocal',
    text: 'Check out Denver Food Bank on GoodLocal',
  },
};

export const CustomLabel: Story = {
  args: {
    url: 'https://goodlocal.org/favorites/42',
    title: "Nick's favorite nonprofits on GoodLocal",
    label: 'Share list',
  },
};
