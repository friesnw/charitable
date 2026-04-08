import { useState } from 'react';
import { causeColor, causeIcon, FEATURED_TAGS } from '../../lib/causeColors';

interface Cause {
  tag: string;
  label: string;
}

interface CauseFilterBarProps {
  causes: Cause[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export function CauseFilterBar({ causes, selectedTags, onChange }: CauseFilterBarProps) {
  const [showAll, setShowAll] = useState(false);

  const availableTags = causes.map((c) => c.tag);
  const tagLabels = new Map(causes.map((c) => [c.tag, c.label]));

  const featuredTags = FEATURED_TAGS.filter((t) => availableTags.includes(t));
  const remainingTags = availableTags.filter((t) => !FEATURED_TAGS.includes(t)).sort();
  const effectiveShowAll = showAll || selectedTags.some((t) => remainingTags.includes(t));
  const visibleTags = effectiveShowAll ? [...featuredTags, ...remainingTags] : featuredTags;

  function toggle(tag: string) {
    setShowAll(false);
    onChange(
      selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag],
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button
        onClick={() => onChange([])}
        className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
          selectedTags.length === 0
            ? 'bg-gray-900 text-white'
            : 'bg-bg-accent text-text-secondary border border-brand-tertiary hover:bg-bg-primary'
        }`}
      >
        All
      </button>
      {visibleTags.map((tag) => {
        const isActive = selectedTags.includes(tag);
        return (
          <button
            key={tag}
            onClick={() => toggle(tag)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1"
            style={
              isActive
                ? { backgroundColor: causeColor([tag]), color: 'white', border: `2px solid ${causeColor([tag])}` }
                : { backgroundColor: 'var(--bg-accent)', color: 'var(--text-secondary)', border: '1px solid var(--brand-tertiary)' }
            }
          >
            <span style={{ fontSize: 11 }}>{causeIcon([tag])}</span>
            {tagLabels.get(tag) ?? tag}
          </button>
        );
      })}
      {!effectiveShowAll && remainingTags.length > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium bg-bg-accent text-text-secondary border border-brand-tertiary hover:bg-bg-primary"
        >
          + {remainingTags.length} more
        </button>
      )}
    </div>
  );
}
