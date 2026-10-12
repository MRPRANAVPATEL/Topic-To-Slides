import React from 'react';
import { Presentation, ShieldAlert, X } from 'lucide-react';
import { PresentationOutline } from '../types';

interface ExportConfirmModalProps {
  isOpen: boolean;
  outline: PresentationOutline | null;
  onConfirm: () => void;
  onCancel: () => void;
  isCreating: boolean;
}

export const ExportConfirmModal: React.FC<ExportConfirmModalProps> = ({
  isOpen,
  outline,
  onConfirm,
  onCancel,
  isCreating,
}) => {
  if (!isOpen || !outline) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-150">
        <button
          onClick={onCancel}
          disabled={isCreating}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Presentation className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              Create in Google Slides?
            </h3>
            <p className="text-xs text-slate-500">
              Workspace presentation export
            </p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 mb-5 space-y-2 text-xs text-slate-700">
          <div className="flex justify-between pb-1 border-b border-slate-200/60 font-medium">
            <span className="text-slate-500">Presentation Title:</span>
            <span className="text-slate-900 font-semibold truncate max-w-[200px]">
              {outline.title}
            </span>
          </div>
          <div className="flex justify-between pb-1 border-b border-slate-200/60 font-medium">
            <span className="text-slate-500">Slide Count:</span>
            <span className="text-slate-900 font-semibold">
              {outline.slides.length} slides (1 title + 5 content)
            </span>
          </div>
          <div className="flex justify-between font-medium">
            <span className="text-slate-500">Speaker Notes:</span>
            <span className="text-emerald-700 font-semibold">
              Included on all slides
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          This will create a new presentation file in your Google Drive with a
          clean colorful theme for each section. You will be able to edit,
          present, and share it anytime.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isCreating}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isCreating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <Presentation className="w-4 h-4" />
            <span>Confirm & Create Deck</span>
          </button>
        </div>
      </div>
    </div>
  );
};
