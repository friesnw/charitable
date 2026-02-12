import { type ReactNode } from 'react';

interface TypographyProps {
  children: ReactNode;
  className?: string;
}

export function H1({ children, className = '' }: TypographyProps) {
  return <h1 className={`font-sans text-2xl font-bold text-text-primary ${className}`}>{children}</h1>;
}

export function H2({ children, className = '' }: TypographyProps) {
  return <h2 className={`font-sans text-xl font-semibold text-text-primary ${className}`}>{children}</h2>;
}

export function H3({ children, className = '' }: TypographyProps) {
  return <h3 className={`font-sans text-lg font-semibold text-text-primary ${className}`}>{children}</h3>;
}

export function H4({ children, className = '' }: TypographyProps) {
  return <h4 className={`font-sans text-base font-medium text-text-primary ${className}`}>{children}</h4>;
}

export function Body({ children, className = '' }: TypographyProps) {
  return <p className={`font-sans text-base text-text-primary ${className}`}>{children}</p>;
}

export function Caption({ children, className = '' }: TypographyProps) {
  return <p className={`font-sans text-sm text-text-secondary ${className}`}>{children}</p>;
}
