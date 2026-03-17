import type { Meta, StoryObj } from '@storybook/react';
import { Toast } from './Toast';

const meta: Meta<typeof Toast> = {
  component: Toast,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof Toast>;

export const WithAction: Story = {
  args: {
    message: 'Near Cap Hill',
    action: { label: 'Change', onClick: () => {} },
    onDismiss: () => {},
    duration: 999999,
  },
};

export const MessageOnly: Story = {
  args: {
    message: 'Near 80203',
    onDismiss: () => {},
    duration: 999999,
  },
};
