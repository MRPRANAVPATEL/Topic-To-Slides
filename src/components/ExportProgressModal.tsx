import React from 'react';
import { Presentation, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

interface ExportProgressModalProps {
  isOpen: boolean;
  stepMessage: string;
}

export const ExportProgressModal: React.FC<ExportProgressModalProps> = ({
  isOpen,
  stepMessage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200">
        <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-amber-100 animate-pulse"></div>
          <Presentation className="w-8 h-8 text-amber-600 relative z-10 animate-bounce" />
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-1">
          Creating Google Slides Deck
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Please wait while we format your deck and attach speaker notes...
        </p>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-3 text-xs text-slate-700 text-left">
          <Loader2 className="w-4 h-4 text-amber-500 animate-spin shrink-0" />
          <span className="font-medium text-slate-800 truncate">
            {stepMessage || 'Communicating with Google Slides...'}
          </span>
        </div>
      </div>
    </div>
  );
};
