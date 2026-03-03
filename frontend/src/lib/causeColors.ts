export const CAUSE_ICONS: Record<string, string> = {
  adoption: '💗',
  animals: '🐾',
  arts: '🎨',
  community: '🤝',
  education: '📚',
  environment: '🌿',
  families: '👨‍👩‍👧',
  'food-security': '🍎',
  health: '❤️',
  homelessness: '🏠',
  housing: '🏠',
  hunger: '🍎',
  'mental-health': '🧠',
  mentorship: '💡',
  pets: '🐾',
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
  adoption: '#F43F5E',
  animals: '#F59E0B',
  arts: '#6366F1',
  community: '#10B981',
  education: '#3B82F6',
  environment: '#22C55E',
  families: '#EC4899',
  'food-security': '#F97316',
  health: '#EF4444',
  homelessness: '#64748B',
  housing: '#A855F7',
  hunger: '#F97316',
  'mental-health': '#8B5CF6',
  mentorship: '#14B8A6',
  pets: '#F59E0B',
  seniors: '#6B7280',
  youth: '#06B6D4',
};

export const DEFAULT_CAUSE_COLOR = '#0EA5E9';

export const FEATURED_TAGS = [
  'food-security',
  'youth',
  'education',
  'homelessness',
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
