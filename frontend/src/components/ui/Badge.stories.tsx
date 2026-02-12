import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'housing' },
};

export const MultipleTags: StoryObj = {
  render: () => (
    <div className="flex gap-2">
      <Badge label="homelessness" />
      <Badge label="hunger" />
      <Badge label="housing" />
    </div>
  ),
};
