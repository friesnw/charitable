import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-bg-primary border border-brand-tertiary rounded-lg p-6 ${className}`}>
      {children}
    </div>
  );
}

interface CharityCardProps {
  name: string;
  mission?: string;
  tags: string[];
}

export function CharityCard({ name, mission, tags }: CharityCardProps) {
  return (
    <Card>
      <h3 className="font-sans text-lg text-text-primary font-semibold">{name}</h3>
      {mission && <p className="font-sans text-sm text-text-secondary mt-2">{mission}</p>}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-block px-2 py-1 text-sm font-sans bg-bg-accent text-brand-secondary rounded-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
