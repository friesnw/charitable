export const CAUSE_ICONS: Record<string, string> = {
  animals: '🐾',
  arts: '🎨',
  education: '📚',
  environment: '🌿',
  families: '👨‍👩‍👧',
  health: '❤️',
  housing: '🏠',
  hunger: '🍎',
  'mental-health': '🧠',
  seniors: '🌟',
  youth: '⚡',
};

export function causeIcon(tags: string[]): string {
  for (const tag of tags) {
    if (CAUSE_ICONS[tag]) return CAUSE_ICONS[tag];
  }
  return '⭐';
}

export const CAUSE_COLORS: Record<string, string> = {
  animals: '#F59E0B',
  arts: '#6366F1',
  education: '#3B82F6',
  environment: '#22C55E',
  families: '#EC4899',
  health: '#EF4444',
  housing: '#A855F7',
  hunger: '#F97316',
  'mental-health': '#8B5CF6',
  seniors: '#6B7280',
  youth: '#06B6D4',
};

export const DEFAULT_CAUSE_COLOR = '#0EA5E9';

// Muted / desaturated palette for refined tag styling (Style A)
export const CAUSE_COLORS_MUTED: Record<string, string> = {
  animals: '#C4813A',
  arts: '#7278C2',
  education: '#4A7EC4',
  environment: '#3D9E5F',
  families: '#C4548A',
  health: '#C45252',
  housing: '#8E4EC4',
  hunger: '#C4672C',
  'mental-health': '#7A52C4',
  seniors: '#7B8592',
  youth: '#2A98B4',
};

const DEFAULT_CAUSE_COLOR_MUTED = '#5A95B4';

export function causeColorMuted(tags: string[]): string {
  for (const tag of tags) {
    if (CAUSE_COLORS_MUTED[tag]) return CAUSE_COLORS_MUTED[tag];
  }
  return DEFAULT_CAUSE_COLOR_MUTED;
}

export const FEATURED_TAGS = [
  'hunger',
  'youth',
  'education',
  'housing',
  'health',
  'environment',
];

export function causeColor(tags: string[]): string {
  for (const tag of tags) {
    if (CAUSE_COLORS[tag]) return CAUSE_COLORS[tag];
  }
  return DEFAULT_CAUSE_COLOR;
}

export function causesToTagLabels(causes: { tag: string; label: string }[]): Map<string, string> {
  return new Map(causes.map(c => [c.tag, c.label]));
}
