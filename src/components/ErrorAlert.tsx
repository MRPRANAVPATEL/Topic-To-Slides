import React from 'react';
import { AlertCircle, X, RefreshCw, LogIn } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onDismiss: () => void;
  onRetry?: () => void;
  onSignIn?: () => void;
  isAuthError?: boolean;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  onDismiss,
  onRetry,
  onSignIn,
  isAuthError = false,
}) => {
  const [showTroubleshoot, setShowTroubleshoot] = React.useState(false);
  if (!message) return null;

  const isOAuthIssue =
    isAuthError ||
    message.toLowerCase().includes('google') ||
    message.toLowerCase().includes('access blocked') ||
    message.toLowerCase().includes('authorized domain') ||
    message.toLowerCase().includes('test user') ||
    message.toLowerCase().includes('oauth');

  return (
    <div className="bg-rose-50 border border-rose-200/90 rounded-2xl p-4 sm:p-5 text-rose-900 shadow-xs flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <div>
              <h4 className="text-sm font-bold text-rose-950">Notice</h4>
              <p className="text-xs text-rose-800 leading-relaxed mt-0.5">
                {message}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {isAuthError && onSignIn && (
                <button
                  type="button"
                  onClick={onSignIn}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Retry Google Sign-in</span>
                </button>
              )}
              {isOAuthIssue && (
                <button
                  type="button"
                  onClick={() => setShowTroubleshoot(!showTroubleshoot)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <span>{showTroubleshoot ? 'Hide Fix Guide' : 'How to Fix Google Error'}</span>
                </button>
              )}
              {onRetry && !isAuthError && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-200 hover:bg-rose-300 text-rose-900 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="p-1 text-rose-400 hover:text-rose-700 rounded-lg hover:bg-rose-100/60 transition-colors"
          title="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {showTroubleshoot && (
        <div className="mt-2 pt-3 border-t border-rose-200/80 text-xs text-slate-700 space-y-3 bg-white/70 p-3.5 rounded-xl">
          <p className="font-bold text-slate-900">
            Why Google blocks sign-in or shows "Request details":
          </p>
          <ol className="list-decimal list-inside space-y-2 text-slate-600 leading-relaxed">
            <li>
              <strong className="text-slate-800">Add Test Users:</strong> Because Google Slides permission (<code className="bg-slate-100 px-1 py-0.5 rounded text-rose-700">presentations</code>) is sensitive, Google Cloud restricts access in "Testing" mode. Go to <strong>Google Cloud Console &gt; APIs &amp; Services &gt; OAuth consent screen &gt; Test users</strong> and add your email.
            </li>
            <li>
              <strong className="text-slate-800">Add Authorized Domain in Firebase:</strong> In <strong>Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains</strong>, add <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700">topic-to-slides.vercel.app</code>.
            </li>
            <li>
              <strong className="text-slate-800">Add Authorized Origins in Google Cloud:</strong> Under <strong>APIs &amp; Services &gt; Credentials &gt; OAuth 2.0 Client IDs</strong>, ensure <code className="bg-slate-100 px-1 py-0.5 rounded">https://topic-to-slides.vercel.app</code> is in Authorized JavaScript origins.
            </li>
          </ol>
        </div>
      )}
    </div>
  );
};
