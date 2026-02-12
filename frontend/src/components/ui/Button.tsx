import { type ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand-primary text-white hover:opacity-90',
  secondary: 'bg-brand-tertiary text-text-primary hover:opacity-80',
};

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
      className={`inline-flex items-center justify-center px-4 py-2 font-sans text-base rounded-md transition-opacity ${variantClasses[variant]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
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
