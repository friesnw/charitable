import { useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';

interface DonateButtonProps {
  nonprofitSlug: string;
  color?: string;
  className?: string;
}

export function DonateButton({ nonprofitSlug, color, className }: DonateButtonProps) {
  // Use context directly (null-safe) so this works outside AuthProvider (e.g. Storybook)
  const auth = useContext(AuthContext);
  const user = auth?.user ?? null;

  // Stable per-instance ID — safe across re-renders but unique per mount
  const elementId = useRef(`donate-${nonprofitSlug}-${Math.random().toString(36).slice(2)}`).current;

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

  return (
    <div
      id={elementId}
      className={`text-center py-2.5 rounded-lg text-sm font-medium text-white cursor-pointer${className ? ` ${className}` : ''}`}
      style={{ backgroundColor: color ?? 'var(--color-brand-secondary)' }}
    >
      Donate
    </div>
  );
}
