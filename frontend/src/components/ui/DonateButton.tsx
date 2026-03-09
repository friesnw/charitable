import { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

interface DonateButtonProps {
  nonprofitSlug: string;
  charityName?: string;
  color?: string;
  className?: string;
}

type Step = 1 | 2 | 4;

const DONATE_COLOR = '#CB6740';

export function DonateButton({ nonprofitSlug, className }: DonateButtonProps) {
  const auth = useContext(AuthContext);
  const user = auth?.user ?? null;

  const [step, setStep] = useState<Step | null>(null);
  const [frequency, setFrequency] = useState<'once' | 'monthly'>('monthly');

  const openModal = () => {
    setStep(1);
    setFrequency('monthly');
  };

  const closeModal = () => setStep(null);

  const handleStep2Continue = () => {
    const url = `https://www.every.org/${nonprofitSlug}/donate#frequency=${frequency}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setStep(4);
  };

  return (
    <>
      {/* Visible button */}
      <div
        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium text-white cursor-pointer${className ? ` ${className}` : ''}`}
        style={{ backgroundColor: DONATE_COLOR }}
        onClick={openModal}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="m9.653 16.915-.005-.003-.019-.01a20.759 20.759 0 0 1-1.162-.682 22.045 22.045 0 0 1-2.582-2.184C4.045 12.289 2 9.876 2 7a4 4 0 0 1 7.26-2.317A4 4 0 0 1 18 7c0 2.876-2.045 5.29-3.885 7.036a22.04 22.04 0 0 1-2.582 2.184 20.757 20.757 0 0 1-1.181.692l-.019.01-.005.003h-.002a.75.75 0 0 1-.69 0h-.002Z" />
        </svg>
        Donate
      </div>

      {step !== null && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 leading-none"
              aria-label="Close"
            >
              ✕
            </button>

            {/* Step 1 — Intro */}
            {step === 1 && (
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Processing your donation</h2>
                <p className="text-sm text-gray-600 mb-4">
                  To process your payment, GoodLocal partners with Every.org, a nonprofit payment platform for charitable giving without platform fees.
                </p>
                <p className="text-sm font-semibold text-gray-700 mb-2">How it works:</p>
                <ul className="space-y-2 mb-6">
                  {[
                    'Pay however you prefer (card, bank, Venmo, and more)',
                    'Your donation is saved to GoodLocal so you can track all giving history in one place',
                    "You'll get a tax-deductible receipt sent to your email",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 font-bold flex-shrink-0 mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white"
                  style={{ backgroundColor: DONATE_COLOR }}
                >
                  Let's go →
                </button>
              </>
            )}

            {/* Step 2 — Frequency */}
            {step === 2 && (
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Recurring or one-time donation?</h2>
                <p className="text-sm text-gray-600 mb-5">
                  Monthly donations can be more powerful than a single larger gift. Organizations with steady, predictable funding can plan ahead and create lasting change. With giving as part of your monthly financial plan, your impact compounds over time.
                </p>

                <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
                  {[
                    { value: 'monthly' as const, label: 'Give monthly', sub: 'A recurring donation — cancel anytime' },
                    { value: 'once' as const, label: 'Once', sub: 'A single donation' },
                  ].map(({ value, label, sub }, i, arr) => (
                    <button
                      key={value}
                      onClick={() => setFrequency(value)}
                      className={`w-full flex items-center justify-between px-4 py-4 text-left transition-colors ${
                        i < arr.length - 1 ? 'border-b border-gray-200' : ''
                      } ${frequency === value ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{label}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{sub}</p>
                      </div>
                      <div
                        className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ml-4"
                        style={frequency === value
                          ? { borderColor: '#343D47', backgroundColor: '#343D47' }
                          : { borderColor: '#D1D5DB' }}
                      >
                        {frequency === value && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-600 border border-gray-300 hover:bg-gray-50"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleStep2Continue}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
                    style={{ backgroundColor: DONATE_COLOR }}
                  >
                    Continue →
                  </button>
                </div>
              </>
            )}

            {/* Step 4 — Thank You */}
            {step === 4 && (
              <div className="text-center py-4">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Thanks for supporting your community
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  We've opened Every.org in a new tab so you can complete your donation securely. Once done, Every.org will email you a tax-deductible receipt.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={closeModal}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white"
                    style={{ backgroundColor: DONATE_COLOR }}
                  >
                    Done
                  </button>
                  {user && (
                    <Link
                      to="/dashboard"
                      onClick={closeModal}
                      className="w-full py-3 rounded-xl text-sm font-semibold text-center text-gray-700 border border-gray-300 hover:bg-gray-50"
                    >
                      View my giving history →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
