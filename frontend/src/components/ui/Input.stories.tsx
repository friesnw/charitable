import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';

const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: { label: 'Name', placeholder: 'Enter your name', type: 'text' },
};

export const Email: Story = {
  args: { label: 'Email', placeholder: 'you@example.com', type: 'email' },
};

export const WithError: Story = {
  args: { label: 'Email', value: 'invalid', error: 'Please enter a valid email', type: 'email' },
};
