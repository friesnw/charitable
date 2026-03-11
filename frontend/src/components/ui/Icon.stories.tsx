import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon, ICON_NAMES } from './Icon';

const meta = {
  title: 'UI/Icon',
  component: Icon,
  tags: ['autodocs'],
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllIcons: Story = {
  args: { name: 'heart' },
  render: () => (
    <div className="flex flex-wrap gap-6 p-4">
      {ICON_NAMES.map((name) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 text-gray-600">
            <Icon name={name} className="w-4 h-4" />
          </div>
          <span className="text-xs text-gray-500">{name}</span>
        </div>
      ))}
    </div>
  ),
};

export const Single: Story = {
  args: {
    name: 'heart',
    className: 'w-6 h-6',
  },
};
