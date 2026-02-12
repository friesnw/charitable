interface BadgeProps {
  label: string;
  className?: string;
}

export function Badge({ label, className = '' }: BadgeProps) {
  return (
    <span className={`inline-block px-2 py-1 text-sm font-sans bg-bg-accent text-brand-secondary rounded-sm ${className}`}>
      {label}
    </span>
  );
}
