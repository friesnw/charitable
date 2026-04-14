import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  action?: { label: string; onClick: () => void };
  onDismiss: () => void;
  duration?: number;
  bottom?: number;
}

export function Toast({ message, action, onDismiss, duration = 4000, bottom }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showId = requestAnimationFrame(() => setVisible(true));
    const dismissId = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, duration);
    return () => {
      cancelAnimationFrame(showId);
      clearTimeout(dismissId);
    };
  }, []);

  return (
    <div
      className="absolute left-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-gray-200 shadow-xl text-sm transition-all duration-300 whitespace-nowrap"
      style={{ bottom: bottom ?? 32, opacity: visible ? 1 : 0, transform: visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(12px)' }}
    >
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600 flex-shrink-0">
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path d="M1.5 5.5L4 8L9.5 2.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="text-gray-800 font-medium">{message}</span>
      {action && (
        <>
          <span className="w-px h-4 bg-gray-200 flex-shrink-0" />
          <button
            onClick={action.onClick}
            className="text-brand-secondary hover:opacity-75 font-medium transition-opacity"
          >
            {action.label}
          </button>
        </>
      )}
    </div>
  );
}
