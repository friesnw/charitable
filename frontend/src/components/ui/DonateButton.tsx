import { useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AuthContext } from '../../context/AuthContext';

interface DonateButtonProps {
  nonprofitSlug: string;
  charityName?: string;
  color?: string;
  className?: string;
}

export function DonateButton({ nonprofitSlug, charityName, color, className }: DonateButtonProps) {
  const auth = useContext(AuthContext);
  const user = auth?.user ?? null;

  const elementId = useRef(`donate-${nonprofitSlug}-${Math.random().toString(36).slice(2)}`).current;
  const [introOpen, setIntroOpen] = useState(false);

  useEffect(() => {
    const webhookToken = import.meta.env.VITE_EVERY_ORG_WEBHOOK_TOKEN;

    const init = () => {
      if (!window.everyDotOrgDonateButton) return;

      const options: Parameters<typeof window.everyDotOrgDonateButton.createWidget>[0] = {
        selector: `#${elementId}`,
        nonprofitSlug,
      };

      if (webhookToken) options.webhookToken = webhookToken;
      if (color) options.primaryColor = color;
      if (user?.email) options.email = user.email;
      if (user?.name) options.firstName = user.name.split(' ')[0];
      if (user?.id) {
        const numericId = parseInt(user.id, 10);
        if (!isNaN(numericId)) {
          options.partnerMetadata = btoa(JSON.stringify({ userId: numericId }));
        }
      }

      window.everyDotOrgDonateButton.createWidget(options);
    };

    if (window.everyDotOrgDonateButton) {
      init();
    } else {
      const script = document.getElementById('every-donate-btn-js');
      if (script) {
        script.addEventListener('load', init);
        return () => script.removeEventListener('load', init);
      }
    }
  }, [elementId, nonprofitSlug, color, user]);

  const handleContinue = () => {
    setIntroOpen(false);
    // Let the modal unmount before the Every.org overlay opens
    requestAnimationFrame(() => window.everyDotOrgDonateButton?.show());
  };

  const displayName = charityName ?? 'this organization';

  return (
    <>
      {/* Hidden Every.org widget target — initialized off-screen so .show() works */}
      <div
        id={elementId}
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}
      />

      {/* Visible button — opens our intro modal */}
      <div
        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium text-white cursor-pointer${className ? ` ${className}` : ''}`}
        style={{ backgroundColor: '#CB6740' }}
        onClick={() => setIntroOpen(true)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="m9.653 16.915-.005-.003-.019-.01a20.759 20.759 0 0 1-1.162-.682 22.045 22.045 0 0 1-2.582-2.184C4.045 12.289 2 9.876 2 7a4 4 0 0 1 7.26-2.317A4 4 0 0 1 18 7c0 2.876-2.045 5.29-3.885 7.036a22.04 22.04 0 0 1-2.582 2.184 20.757 20.757 0 0 1-1.181.692l-.019.01-.005.003h-.002a.75.75 0 0 1-.69 0h-.002Z" />
        </svg>
        Donate
      </div>

      {/* Intro modal — portaled to body to avoid stacking context issues */}
      {introOpen && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setIntroOpen(false); }}
        >
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm p-6 relative">
            {/* Close */}
            <button
              onClick={() => setIntroOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 leading-none"
              aria-label="Close"
            >
              ✕
            </button>

            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Support {displayName}
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              GoodLocal partners with Every.org to process donations. Every.org is a trusted nonprofit platform that powers giving for thousands of organizations. Aside from standard credit card processing fees, 100% of your donation will reach {displayName}.
            </p>

            <ul className="space-y-2.5 mb-5">
              {[
                `0% platform fee — 100% of your donation reaches ${displayName}`,
                'Tax-deductible receipt sent to your email',
                'Pay by card, bank transfer, PayPal, Venmo, and more',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-500 font-bold flex-shrink-0 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <p className="text-xs text-gray-400 mb-5">
              Your payment information is handled entirely by Every.org — GoodLocal never sees it.
            </p>

            <button
              onClick={handleContinue}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: '#CB6740' }}
            >
              Continue to donate →
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
