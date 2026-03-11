import { Icon } from './Icon';

interface DonateButtonProps {
  donateUrl: string;
  charityName?: string;
  color?: string;
  className?: string;
}

export function DonateButton({ donateUrl, className }: DonateButtonProps) {
  return (
    <button
      type="button"
      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium text-white bg-brand-secondary hover:opacity-90 active:opacity-75 transition-opacity${className ? ` ${className}` : ''}`}
      onClick={() => window.open(donateUrl, '_blank', 'noopener,noreferrer')}
    >
      <Icon name="heart" className="w-4 h-4" />
      Donate
    </button>
  );
}
