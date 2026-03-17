import { causeColor, causeIcon } from '../../lib/causeColors';

interface Cause {
  tag: string;
  label: string;
}

interface CauseFilterBarProps {
  causes: Cause[];
  selectedTag: string | null;
  onChange: (tag: string | null) => void;
}

export function CauseFilterBar({ causes, selectedTag, onChange }: CauseFilterBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 flex-wrap">
      <button
        onClick={() => onChange(null)}
        className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
          !selectedTag
            ? 'bg-gray-900 text-white'
            : 'bg-bg-accent text-text-secondary border border-brand-tertiary hover:bg-bg-primary'
        }`}
      >
        All
      </button>
      {causes.map((cause) => (
        <button
          key={cause.tag}
          onClick={() => onChange(cause.tag === selectedTag ? null : cause.tag)}
          className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1"
          style={
            cause.tag === selectedTag
              ? { backgroundColor: causeColor([cause.tag]), color: 'white', border: `2px solid ${causeColor([cause.tag])}` }
              : { backgroundColor: 'var(--bg-accent)', color: 'var(--text-secondary)', border: '1px solid var(--brand-tertiary)' }
          }
        >
          <span style={{ fontSize: 11 }}>{causeIcon([cause.tag])}</span>
          {cause.label}
        </button>
      ))}
    </div>
  );
}
