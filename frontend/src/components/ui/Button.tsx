import { type ButtonHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

export type ButtonVariant = 'primary' | 'secondary' | 'secondary-dark' | 'outline' | 'link';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

export const variantClasses: Record<ButtonVariant, string> = {
  primary:          'bg-brand-secondary text-white hover:opacity-90',
  secondary:        'bg-brand-tertiary text-text-primary hover:opacity-80',
  'secondary-dark': 'bg-white/10 text-white border border-white/20 hover:bg-white/20',
  outline:          'bg-transparent text-text-primary border border-brand-tertiary hover:border-brand-secondary hover:text-brand-secondary',
  link:             'bg-transparent text-brand-secondary hover:underline px-0 py-0',
};

const baseClasses = 'inline-flex items-center justify-center px-4 py-2 font-sans text-base rounded-md transition-colors';

export function ButtonLink({
  variant = 'primary',
  className = '',
  ...props
}: LinkProps & { variant?: ButtonVariant; className?: string }) {
  return (
    <Link
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}

export function Button({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
