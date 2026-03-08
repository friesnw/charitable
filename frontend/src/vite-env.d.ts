/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_MAPBOX_TOKEN: string;
  readonly VITE_EVERY_ORG_WEBHOOK_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface EveryDotOrgDonateButton {
  createWidget(options: {
    selector?: string;
    nonprofitSlug: string;
    fundraiserSlug?: string;
    methods?: string[];
    openAt?: string;
    show?: boolean;
    primaryColor?: string;
    defaultDonationAmount?: number;
    amount?: number;
    minDonationAmount?: number;
    frequency?: 'once' | 'monthly';
    defaultFrequency?: 'once' | 'monthly';
    addAmounts?: number[];
    completeDonationInNewTab?: boolean;
    noExit?: boolean;
    showGiftCardOption?: boolean;
    webhookToken?: string;
    email?: string;
    firstName?: string;
    partnerMetadata?: string;
  }): void;
  show(): void;
  setOptions(options: Record<string, unknown>): void;
}

interface Window {
  everyDotOrgDonateButton?: EveryDotOrgDonateButton;
}
