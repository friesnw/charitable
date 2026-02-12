import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { children: 'Donate', variant: 'primary' },
};

export const Secondary: Story = {
  args: { children: 'Learn More', variant: 'secondary' },
};

export const Disabled: Story = {
  args: { children: 'Unavailable', disabled: true },
};

export const Loading: Story = {
  args: { children: 'Submitting...', loading: true },
};
