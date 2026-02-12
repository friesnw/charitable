import type { Meta, StoryObj } from '@storybook/react-vite';

const tokenGroups = [
  {
    label: 'Background',
    tokens: [
      { name: '--bg-primary', value: '#ffffff' },
      { name: '--bg-accent', value: '#f8fafc' },
    ],
  },
  {
    label: 'Brand',
    tokens: [
      { name: '--brand-primary', value: '#2563eb' },
      { name: '--brand-secondary', value: '#64748b' },
      { name: '--brand-tertiary', value: '#e2e8f0' },
    ],
  },
  {
    label: 'Semantic',
    tokens: [
      { name: '--color-success', value: '#22c55e' },
      { name: '--color-error', value: '#ef4444' },
    ],
  },
  {
    label: 'Text',
    tokens: [
      { name: '--text-primary', value: '#0f172a' },
      { name: '--text-secondary', value: '#64748b' },
    ],
  },
];

function Swatch({ name, value }: { name: string; value: string }) {
  const isLight = ['#ffffff', '#f8fafc', '#e2e8f0'].includes(value.toLowerCase());
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 6,
          backgroundColor: `var(${name})`,
          border: isLight ? '1px solid #e2e8f0' : 'none',
          flexShrink: 0,
        }}
      />
      <div>
        <div style={{ fontFamily: 'monospace', fontSize: 13 }}>{name}</div>
        <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>{value}</div>
      </div>
    </div>
  );
}

function ColorTokensPage() {
  return (
    <div style={{ maxWidth: 600, fontFamily: 'var(--font-sans)' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>Color Tokens</h1>
      {tokenGroups.map((group) => (
        <div key={group.label} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12, color: '#64748b' }}>
            {group.label}
          </h2>
          {group.tokens.map((token) => (
            <Swatch key={token.name} name={token.name} value={token.value} />
          ))}
        </div>
      ))}
    </div>
  );
}

const meta = {
  title: 'Styleguide/Color Tokens',
  component: ColorTokensPage,
  parameters: { controls: { disable: true } },
} satisfies Meta<typeof ColorTokensPage>;

export default meta;

export const AllColors: StoryObj<typeof meta> = {};
