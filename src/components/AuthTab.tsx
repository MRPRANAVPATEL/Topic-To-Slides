import React, { useEffect, useState } from 'react';
import { Presentation, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import {
  auth,
  provider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  setCachedAccessToken,
} from '../services/auth';

export const AuthTab: React.FC = () => {
  const [status, setStatus] = useState<'initiating' | 'processing' | 'ready' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPopupProcessing, setIsPopupProcessing] = useState(false);

  // Broadcast success to parent window
  const notifySuccess = (userPayload: any, accessToken: string) => {
    setCachedAccessToken(accessToken);

    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const channel = new BroadcastChannel('topic_to_slides_auth');
        channel.postMessage({
          type: 'AUTH_SUCCESS',
          user: userPayload,
          accessToken,
        });
        channel.close();
      } catch (_) {}
    }

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

    setStatus('success');
    setTimeout(() => {
      try {
        window.close();
      } catch {}
    }, 1500);
  };

  // Direct popup sign in from this tab (100% reliable, immune to cross-domain cookie loss)
  const handleDirectSignIn = async () => {
    setIsPopupProcessing(true);
    setErrorMessage(null);
    try {
      const result = await signInWithPopup(auth, provider);
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

      notifySuccess(userPayload, accessToken);
    } catch (err: any) {
      console.error('Direct sign in error:', err);
      setIsPopupProcessing(false);
      let friendlyMsg = err?.message || 'Google sign-in could not be completed.';
      if (err?.code === 'auth/popup-closed-by-user') {
        friendlyMsg = 'Sign in was cancelled.';
      } else if (err?.code === 'auth/unauthorized-domain') {
        friendlyMsg =
          'This domain is not authorized in Firebase. Please add this domain to Authorized Domains in Firebase Console > Authentication > Settings.';
      }
      setErrorMessage(friendlyMsg);
      setStatus('error');
    }
  };

  useEffect(() => {
    let isMounted = true;

    const runAuth = async () => {
      try {
        // Step 1: Check if this tab just returned from a redirect flow
        setStatus('processing');
        let result = null;
        try {
          result = await getRedirectResult(auth);
        } catch (redirectErr: any) {
          console.warn('getRedirectResult notice:', redirectErr);
        }

        if (result && result.user) {
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

          notifySuccess(userPayload, accessToken);
          return;
        }

        // Step 2: Check URL params and clean them to prevent infinite redirect loops
        const params = new URLSearchParams(window.location.search);
        const action = params.get('action');

        // Immediately clean URL so subsequent reloads never loop
        if (action) {
          try {
            const cleanUrl = window.location.pathname + '?auth_flow=1';
            window.history.replaceState({}, document.title, cleanUrl);
          } catch (_) {}
        }

        // Check if user is already signed in
        if (auth.currentUser) {
          const userPayload = {
            uid: auth.currentUser.uid,
            displayName: auth.currentUser.displayName,
            email: auth.currentUser.email,
            photoURL: auth.currentUser.photoURL,
          };
          // Try to get token from storage
          const storedToken = sessionStorage.getItem('topic_slides_access_token');
          if (storedToken) {
            notifySuccess(userPayload, storedToken);
            return;
          }
        }

        // If action was login, try seamless popup sign-in first or present ready button
        if (action === 'login') {
          // Attempt popup directly if permitted by browser
          try {
            const popupRes = await signInWithPopup(auth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(popupRes);
            const accessToken = credential?.accessToken || null;
            if (accessToken) {
              const userPayload = {
                uid: popupRes.user.uid,
                displayName: popupRes.user.displayName,
                email: popupRes.user.email,
                photoURL: popupRes.user.photoURL,
              };
              notifySuccess(userPayload, accessToken);
              return;
            }
          } catch (autoErr: any) {
            console.log('Auto popup requires user interaction, displaying ready state');
          }
        }

        if (isMounted) {
          setStatus('ready');
        }
      } catch (err: any) {
        console.error('Redirect OAuth error in auth tab:', err);
        if (isMounted) {
          setStatus('error');
          let friendlyMsg = err?.message || 'Google sign-in could not be completed.';

          if (err?.code === 'auth/unauthorized-domain') {
            friendlyMsg =
              'This domain is not authorized in Firebase. Please add this domain to Authorized Domains in Firebase Console > Authentication > Settings.';
          } else if (err?.code === 'auth/popup-closed-by-user') {
            friendlyMsg = 'Sign in was cancelled.';
          }

          setErrorMessage(friendlyMsg);
        }
      }
    };

    runAuth();

    return () => {
      isMounted = false;
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

        {status === 'ready' && (
          <div className="space-y-4 py-3">
            <p className="text-sm text-slate-200 font-medium">
              Ready to connect your Google Account
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click below to approve Google Slides permissions and complete your sign-in without redirect issues.
            </p>
            <button
              onClick={handleDirectSignIn}
              disabled={isPopupProcessing}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              {isPopupProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span>Complete Sign-In with Google</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {status === 'initiating' && (
          <div className="space-y-3 py-4">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
            <p className="text-sm text-slate-300 font-medium">
              Connecting to Google Accounts...
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
          <div className="space-y-3 py-4 bg-rose-950/40 border border-rose-500/30 rounded-xl p-4 text-left">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-sm text-rose-200 font-bold text-center">
              Authentication Notice
            </p>
            <p className="text-xs text-rose-300 leading-relaxed text-center">
              {errorMessage || 'Sign-in could not be completed.'}
            </p>
            
            <div className="mt-3 p-3 bg-slate-900/80 rounded-lg border border-slate-700/80 text-xs text-slate-300 space-y-2">
              <p className="font-semibold text-amber-400">Common fixes for Google OAuth errors:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Add your email to <strong>Test Users</strong> under Google Cloud Console &gt; OAuth consent screen.</li>
                <li>Add <strong className="text-white">topic-to-slides.vercel.app</strong> to <strong>Authorized domains</strong> in Firebase Console &gt; Authentication &gt; Settings.</li>
                <li>Add Vercel domain to <strong>Authorized JavaScript origins</strong> in Google Cloud Credentials.</li>
              </ul>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => window.close()}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-colors"
              >
                Close this Tab
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
