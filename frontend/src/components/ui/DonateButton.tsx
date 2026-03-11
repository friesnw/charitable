interface DonateButtonProps {
  donateUrl: string;
  charityName?: string;
  color?: string;
  className?: string;
}

export function DonateButton({ donateUrl, className }: DonateButtonProps) {
  return (
    <div
      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium text-white cursor-pointer bg-brand-secondary${className ? ` ${className}` : ''}`}
      onClick={() => window.open(donateUrl, '_blank', 'noopener,noreferrer')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="m9.653 16.915-.005-.003-.019-.01a20.759 20.759 0 0 1-1.162-.682 22.045 22.045 0 0 1-2.582-2.184C4.045 12.289 2 9.876 2 7a4 4 0 0 1 7.26-2.317A4 4 0 0 1 18 7c0 2.876-2.045 5.29-3.885 7.036a22.04 22.04 0 0 1-2.582 2.184 20.757 20.757 0 0 1-1.181.692l-.019.01-.005.003h-.002a.75.75 0 0 1-.69 0h-.002Z" />
      </svg>
      Donate
    </div>
  );
}
