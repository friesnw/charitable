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
