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
  }): void;
  show(): void;
  setOptions(options: Record<string, unknown>): void;
}

declare global {
  interface Window {
    everyDotOrgDonateButton?: EveryDotOrgDonateButton;
  }
}
