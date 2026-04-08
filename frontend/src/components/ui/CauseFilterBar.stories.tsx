import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { CauseFilterBar } from './CauseFilterBar';

const SAMPLE_CAUSES = [
  { tag: 'hunger', label: 'Hunger' },
  { tag: 'youth', label: 'Youth' },
  { tag: 'education', label: 'Education' },
  { tag: 'housing', label: 'Housing' },
  { tag: 'health', label: 'Health' },
  { tag: 'environment', label: 'Environment' },
  { tag: 'homelessness', label: 'Homelessness' },
  { tag: 'animals', label: 'Animals' },
];

const meta: Meta<typeof CauseFilterBar> = {
  title: 'UI/CauseFilterBar',
  component: CauseFilterBar,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof CauseFilterBar>;

export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);
    return <CauseFilterBar causes={SAMPLE_CAUSES} selectedTags={selected} onChange={setSelected} />;
  },
};

export const WithSelection: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>(['housing']);
    return <CauseFilterBar causes={SAMPLE_CAUSES} selectedTags={selected} onChange={setSelected} />;
  },
};
