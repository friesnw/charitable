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
    selector: string;
    nonprofitSlug: string;
    webhookToken?: string;
    primaryColor?: string;
    email?: string;
    firstName?: string;
    partnerMetadata?: string;
    defaultDonationAmount?: number;
    minDonationAmount?: number;
    addAmounts?: number[];
    defaultFrequency?: 'once' | 'monthly';
  }): void;
  show(): void;
  setOptions(options: Record<string, unknown>): void;
}

interface Window {
  everyDotOrgDonateButton?: EveryDotOrgDonateButton;
}
