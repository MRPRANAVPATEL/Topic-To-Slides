import React, { useEffect, useState } from 'react';
import { Presentation, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import {
  auth,
  provider,
  getRedirectResult,
  signInWithRedirect,
  GoogleAuthProvider,
} from '../services/auth';

export const AuthTab: React.FC = () => {
  const [status, setStatus] = useState<'initiating' | 'processing' | 'success' | 'error'>('initiating');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const channel = typeof BroadcastChannel !== 'undefined'
      ? new BroadcastChannel('topic_to_slides_auth')
      : null;

    const runAuth = async () => {
      try {
        // Step 1: Check if this tab just received the redirect back from Google OAuth
        setStatus('processing');
        const result = await getRedirectResult(auth);

        if (result && result.user) {
          // Authentication successfully completed via redirect!
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const accessToken = credential?.accessToken || null;

          if (!accessToken) {
            throw new Error('Google did not return an access token for Slides permissions.');
          }

          const userPayload = {
            uid: result.user.uid,
            displayName: result.user.displayName,
            email: result.user.email,
            photoURL: result.user.photoURL,
          };

          // Notify the main application tab via BroadcastChannel
          if (channel) {
            channel.postMessage({
              type: 'AUTH_SUCCESS',
              user: userPayload,
              accessToken,
            });
          }

          // Also notify via window.opener if available
          if (window.opener && !window.opener.closed) {
            try {
              window.opener.postMessage(
                {
                  type: 'AUTH_SUCCESS',
                  user: userPayload,
                  accessToken,
                },
                window.location.origin
              );
            } catch (postErr) {
              console.warn('postMessage to opener failed:', postErr);
            }
          }

          if (isMounted) {
            setStatus('success');
          }

          // Try to close tab automatically after notifying
          setTimeout(() => {
            try {
              window.close();
            } catch {
              // Browser may prevent closing, user can close manually
            }
          }, 1500);

          return;
        }

        // Step 2: If we are not returning from a redirect, initiate the redirect to Google
        const params = new URLSearchParams(window.location.search);
        if (params.get('action') === 'login') {
          setStatus('initiating');
          await signInWithRedirect(auth, provider);
        } else {
          // No action specified and no redirect result
          setStatus('error');
          setErrorMessage('No authentication flow requested. You can close this tab.');
        }
      } catch (err: any) {
        console.error('Redirect OAuth error in auth tab:', err);
        if (isMounted) {
          setStatus('error');
          let friendlyMsg = err?.message || 'Google sign-in could not be completed.';

          if (err?.code === 'auth/unauthorized-domain') {
            friendlyMsg =
              'This domain is not authorized in Firebase. Please add this domain to Authorized Domains in Firebase Console > Authentication > Settings.';
          } else if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
            friendlyMsg = 'Sign in was cancelled.';
          }

          setErrorMessage(friendlyMsg);

          // Broadcast error to opener
          if (channel) {
            channel.postMessage({
              type: 'AUTH_ERROR',
              error: friendlyMsg,
              code: err?.code,
            });
          }

          if (window.opener && !window.opener.closed) {
            try {
              window.opener.postMessage(
                {
                  type: 'AUTH_ERROR',
                  error: friendlyMsg,
                  code: err?.code,
                },
                window.location.origin
              );
            } catch (_) {}
          }
        }
      }
    };

    runAuth();

    return () => {
      isMounted = false;
      if (channel) {
        channel.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl max-w-md w-full p-8 shadow-2xl text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center mx-auto shadow-md">
          <Presentation className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Topic to Slides
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Google Workspace OAuth Authentication
          </p>
        </div>

        {status === 'initiating' && (
          <div className="space-y-3 py-4">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
            <p className="text-sm text-slate-300 font-medium">
              Redirecting to Google Accounts...
            </p>
            <p className="text-xs text-slate-500">
              Please choose your account and approve Google Slides permissions.
            </p>
          </div>
        )}

        {status === 'processing' && (
          <div className="space-y-3 py-4">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
            <p className="text-sm text-slate-300 font-medium">
              Verifying Google authorization...
            </p>
            <p className="text-xs text-slate-500">
              Finalizing secure token and syncing with Topic to Slides...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-3 py-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm text-emerald-200 font-bold">
              Connected Successfully!
            </p>
            <p className="text-xs text-slate-300">
              You are signed in with Google Slides permissions. This tab will close
              automatically, or you can close it and return to Topic to Slides.
            </p>
            <button
              onClick={() => window.close()}
              className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Close this Tab
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3 py-4 bg-rose-950/40 border border-rose-500/30 rounded-xl p-4">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-sm text-rose-200 font-bold">
              Authentication Notice
            </p>
            <p className="text-xs text-rose-300 leading-relaxed">
              {errorMessage || 'Sign-in could not be completed.'}
            </p>
            <button
              onClick={() => window.close()}
              className="mt-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-colors"
            >
              Close this Tab
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
