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
  if (!message) return null;

  return (
    <div className="bg-rose-50 border border-rose-200/90 rounded-2xl p-4 sm:p-5 text-rose-900 shadow-xs flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="space-y-2">
          <div>
            <h4 className="text-sm font-bold text-rose-950">Notice</h4>
            <p className="text-xs text-rose-800 leading-relaxed mt-0.5">
              {message}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            {isAuthError && onSignIn && (
              <button
                type="button"
                onClick={onSignIn}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Connect Google Account</span>
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
  );
};
