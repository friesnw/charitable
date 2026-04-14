import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';

interface ShareButtonProps {
  url: string;
  title: string;
  text?: string;
  label?: string;
  className?: string;
}

interface ShareModalProps {
  url: string;
  text?: string;
  onClose: () => void;
}

function ShareModal({ url, text, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const displayUrl = url.replace(/^https?:\/\//, '');

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  }

  function openMessages() {
    const body = text ? `${text} ${url}` : url;
    window.open(`sms:?&body=${encodeURIComponent(body)}`);
  }

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-text-primary">Share</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 -mr-1"
            aria-label="Close"
          >
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* URL preview */}
          <button
            type="button"
            onClick={copyLink}
            className="w-full flex items-center gap-3 px-4 py-3 bg-bg-secondary border border-brand-tertiary rounded-xl hover:border-brand-secondary transition-colors group text-left"
          >
            <span className="text-sm text-text-secondary truncate flex-1 font-mono leading-tight">
              {displayUrl}
            </span>
            <span className="flex-shrink-0 text-gray-400 group-hover:text-brand-secondary transition-colors">
              {copied
                ? <Icon name="check-circle-solid" className="w-4 h-4 text-green-500" />
                : <Icon name="link" className="w-4 h-4" />
              }
            </span>
          </button>

          {/* Action buttons */}
          <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {/* Copy link */}
            <button
              type="button"
              onClick={copyLink}
              className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-brand-tertiary hover:border-brand-secondary hover:bg-bg-secondary transition-colors"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--brand-primary)' }}>
                {copied
                  ? <Icon name="check-circle-solid" className="w-5 h-5 text-white" />
                  : <Icon name="link" className="w-5 h-5 text-white" />
                }
              </div>
              <span className="text-sm font-medium text-text-primary">
                {copied ? 'Copied!' : 'Copy link'}
              </span>
            </button>

            {/* Messages — mobile only */}
            {isMobile && (
              <button
                type="button"
                onClick={openMessages}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-brand-tertiary hover:border-brand-secondary hover:bg-bg-secondary transition-colors"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#34C759' }}>
                  <Icon name="chat-bubble" className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-text-primary">Messages</span>
              </button>
            )}
          </div>
        </div>

        {/* Safe area padding for mobile home bar */}
        <div className="sm:hidden h-safe-bottom" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

export function ShareButton({ url, title, text, label = 'Share', className = '' }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  void title;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${className}`}
      >
        <Icon name="arrow-up-tray" className="w-4 h-4 shrink-0" />
        {label}
      </button>
      {open && <ShareModal url={url} text={text} onClose={() => setOpen(false)} />}
    </>
  );
}
