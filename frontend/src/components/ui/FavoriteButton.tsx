import { Icon } from './Icon';

interface FavoriteButtonProps {
  favorited: boolean;
  loading?: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function FavoriteButton({ favorited, loading = false, onClick, className = '', size = 'md' }: FavoriteButtonProps) {
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!loading) onClick(e);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={favorited ? 'Remove from saved' : 'Save nonprofit'}
      className={`flex items-center justify-center rounded-full transition-colors ${
        favorited
          ? 'text-rose-500 hover:text-rose-400'
          : 'text-gray-400 hover:text-rose-400'
      } ${loading ? 'opacity-50 cursor-default' : ''} ${className}`}
    >
      <Icon name={favorited ? 'heart' : 'heart-outline'} className={iconSize} />
    </button>
  );
}
