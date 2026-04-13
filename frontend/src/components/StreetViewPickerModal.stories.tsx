import type { Meta, StoryObj } from '@storybook/react-vite';
import { MockedProvider } from '@apollo/client/testing';
import { StreetViewPickerModal } from './StreetViewPickerModal';

const meta = {
  title: 'Admin/StreetViewPickerModal',
  component: StreetViewPickerModal,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MockedProvider>
        <Story />
      </MockedProvider>
    ),
  ],
} satisfies Meta<typeof StreetViewPickerModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    locationId: '42',
    initialAddress: '1355 S Broadway, Denver, CO 80210',
    onSaved: (url) => console.log('Saved:', url),
    onClose: () => console.log('Closed'),
  },
};

export const NoAddress: Story = {
  args: {
    locationId: '99',
    initialAddress: '',
    onSaved: (url) => console.log('Saved:', url),
    onClose: () => console.log('Closed'),
  },
};
