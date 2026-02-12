import { type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-sans text-text-primary">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`px-3 py-2 font-sans text-base text-text-primary bg-bg-primary border rounded-md outline-none transition-colors ${error ? 'border-error' : 'border-brand-tertiary focus:border-brand-primary'} ${className}`}
        {...props}
      />
      {error && <span className="text-sm text-error">{error}</span>}
    </div>
  );
}
