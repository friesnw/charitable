import type { Meta, StoryObj } from '@storybook/react-vite';
import { FavoriteButton } from './FavoriteButton';

const meta = {
  title: 'UI/FavoriteButton',
  component: FavoriteButton,
  tags: ['autodocs'],
  args: { onClick: () => {} },
} satisfies Meta<typeof FavoriteButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unfavorited: Story = {
  args: { favorited: false },
};

export const Favorited: Story = {
  args: { favorited: true },
};

export const Loading: Story = {
  args: { favorited: false, loading: true },
};

export const Small: Story = {
  args: { favorited: false, size: 'sm' },
};
