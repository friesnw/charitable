export function Initials({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      className="flex items-center justify-center rounded bg-bg-accent text-text-secondary text-xs font-bold flex-shrink-0"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}
