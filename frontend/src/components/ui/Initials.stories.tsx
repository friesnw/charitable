import type { Meta, StoryObj } from '@storybook/react-vite';
import { Initials } from './Initials';

const meta = {
  title: 'UI/Initials',
  component: Initials,
  tags: ['autodocs'],
} satisfies Meta<typeof Initials>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { name: 'Denver Food Bank', size: 40 },
};

export const Small: Story = {
  args: { name: 'Mile High United Way', size: 32 },
};

export const Large: Story = {
  args: { name: 'Boys and Girls Club', size: 64 },
};

export const SingleWord: Story = {
  args: { name: 'Volunteers', size: 40 },
};
