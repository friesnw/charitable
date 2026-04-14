import { useState } from 'react';
import { Icon } from './Icon';

interface ShareButtonProps {
  url: string;
  title: string;
  text?: string;
  label?: string;
  className?: string;
}

export function ShareButton({ url, title, text, label = 'Share', className = '' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // user cancelled or error — do nothing
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // clipboard not available — do nothing
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${className}`}
    >
      <Icon name="share" className="w-4 h-4 shrink-0" />
      {copied ? 'Copied!' : label}
    </button>
  );
}
