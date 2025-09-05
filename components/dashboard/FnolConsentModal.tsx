
import React, { useState, useEffect, useCallback } from 'react';
import { X, Loader2, ShieldCheck } from 'lucide-react';

interface FnolConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

const FnolConsentModal: React.FC<FnolConsentModalProps> = ({ isOpen, onClose, onConfirm, isSubmitting }) => {
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHasConsented(false);
    }
  }, [isOpen]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" onClick={onClose}>
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-neutral-700">
                <h2 className="text-xl font-bold text-white flex items-center">
                    <ShieldCheck size={24} className="mr-3 text-green-400" />
                    Consent to Share Information
                </h2>
                <button onClick={onClose} className="p-2 rounded-full text-neutral-400 hover:bg-neutral-700"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4">
                <p className="text-neutral-300">
                    To create an insurance claim (First Notice of Loss - FNOL), we need to send details of this incident to our third-party insurance provider.
                </p>
                <p className="text-sm text-neutral-400">
                    This includes the incident type, location, timestamp, reporter details, and any associated media. This information will be used solely for the purpose of processing the insurance claim.
                </p>
                <div className="flex items-center space-x-3 mt-4 p-3 bg-neutral-900/50 rounded-md">
                    <input
                        id="consent-checkbox"
                        type="checkbox"
                        checked={hasConsented}
                        onChange={(e) => setHasConsented(e.target.checked)}
                        className="h-5 w-5 rounded border-neutral-600 bg-neutral-700 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="consent-checkbox" className="text-sm font-medium text-white">
                        I consent to share this incident's data with the insurance provider.
                    </label>
                </div>
            </div>

            <div className="p-4 border-t border-neutral-700 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md bg-neutral-600 hover:bg-neutral-500 text-white">
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={!hasConsented || isSubmitting}
                    className="px-4 py-2 text-sm font-medium rounded-md bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center w-36 disabled:bg-neutral-600 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Proceed'}
                </button>
            </div>
        </div>
    </div>
  );
};

export default FnolConsentModal;
