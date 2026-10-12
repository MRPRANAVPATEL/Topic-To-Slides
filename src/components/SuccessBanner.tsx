import React, { useState } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  Presentation,
  Sparkles,
  CheckCircle2,
  PlusCircle,
  Lightbulb,
  Layers,
} from 'lucide-react';
import { ExportResult } from '../types';

interface SuccessBannerProps {
  result: ExportResult;
  onNewPresentation: () => void;
}

export const SuccessBanner: React.FC<SuccessBannerProps> = ({
  result,
  onNewPresentation,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.presentationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50 border-2 border-emerald-300/80 rounded-2xl p-6 sm:p-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <Presentation className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Presentation Created in Google Slides!
              </span>
              <span className="text-xs text-slate-500">
                {result.slideCount} Slides Generated
              </span>
              {result.buildBulletsApplied && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                  Progressive Animation Applied
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {result.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              Your presentation is live in your Google Drive with HD photography,
              colorful section themes, formatted bullets, and embedded presenter notes.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-2xs"
            title="Copy presentation URL"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Copied Link!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copy Deck Link</span>
              </>
            )}
          </button>

          {/* Primary requirement: Button 'Open in Google Slides' with the link */}
          <a
            href={result.presentationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            <Presentation className="w-4 h-4" />
            <span>Open in Google Slides</span>
            <ExternalLink className="w-4 h-4 ml-0.5" />
          </a>
        </div>
      </div>

      {/* Pro Tip on Transitions (Requirement 4) */}
      <div className="bg-amber-100/70 border border-amber-300/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-950">
        <Lightbulb className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Pro Tip: </span>
          <span>
            To add transitions in Google Slides: <strong>Slide</strong>, then{' '}
            <strong>Transition</strong>, then <strong>Apply to all slides</strong>.
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-emerald-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
        <span className="truncate max-w-md font-mono text-[11px] text-slate-500">
          {result.presentationUrl}
        </span>
        <button
          type="button"
          onClick={onNewPresentation}
          className="text-amber-800 hover:text-amber-950 font-semibold inline-flex items-center gap-1.5 transition-colors shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Create Another Presentation</span>
        </button>
      </div>
    </div>
  );
};
