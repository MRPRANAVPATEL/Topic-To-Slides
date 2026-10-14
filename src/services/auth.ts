import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Reuse existing app if already initialized
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Required Google Slides Workspace scope
provider.addScope('https://www.googleapis.com/auth/presentations');
provider.setCustomParameters({ prompt: 'select_account' });

// Flag to indicate if we are in the middle of a sign-in flow
let isSigningIn = false;
// In-memory cache for access token with session fallback
let cachedAccessToken: string | null = null;

if (typeof window !== 'undefined') {
  try {
    cachedAccessToken = sessionStorage.getItem('topic_slides_access_token');
  } catch (_) {}
}

// Initialize auth state listener and cross-tab sync.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  // Listen to cross-tab auth messages via BroadcastChannel
  let channel: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== 'undefined') {
    channel = new BroadcastChannel('topic_to_slides_auth');
    channel.onmessage = (event) => {
      const data = event.data;
      if (data && data.type === 'AUTH_SUCCESS' && data.accessToken) {
        cachedAccessToken = data.accessToken;
        if (auth.currentUser && onAuthSuccess) {
          onAuthSuccess(auth.currentUser, cachedAccessToken);
        }
      } else if (data && data.type === 'AUTH_LOGOUT') {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    };
  }

  // Also listen for postMessage from child tabs
  const handlePostMessage = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    const data = event.data;
    if (data && data.type === 'AUTH_SUCCESS' && data.accessToken) {
      cachedAccessToken = data.accessToken;
      if (auth.currentUser && onAuthSuccess) {
        onAuthSuccess(auth.currentUser, cachedAccessToken);
      }
    }
  };
  window.addEventListener('message', handlePostMessage);

  // Check if current tab is returning from a direct in-page redirect
  getRedirectResult(auth)
    .then((result) => {
      if (result && result.user) {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          cachedAccessToken = credential.accessToken;
          if (onAuthSuccess) onAuthSuccess(result.user, cachedAccessToken);
        }
      }
    })
    .catch(() => {
      // Normal when not returning from a redirect flow
    });

  // Standard Firebase Auth state listener
  const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthSuccess) onAuthSuccess(user, null);
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });

  return () => {
    unsubscribe();
    window.removeEventListener('message', handlePostMessage);
    if (channel) channel.close();
  };
};

/**
 * Initiates the Google Sign-In flow in a new browser tab using redirect OAuth.
 * Avoids popup blockers and auto-close issues by opening directly from user click.
 */
export const openGoogleSignInTab = async (): Promise<{ user: User; accessToken: string }> => {
  if (isSigningIn) {
    throw new Error('Sign-in is already in progress.');
  }

  return new Promise((resolve, reject) => {
    isSigningIn = true;

    // Build the URL for the new auth tab
    const authUrl = `${window.location.origin}${window.location.pathname}?auth_flow=1&action=login`;

    // Open synchronously in the user click handler to prevent browser popup blocking
    const authWindow = window.open(authUrl, '_blank');
    if (!authWindow) {
      isSigningIn = false;
      reject(new Error('Browser blocked opening new tab. Please allow opening tabs for this site.'));
      return;
    }

    let channel: BroadcastChannel | null = null;
    let cleanupTimer: any = null;

    const cleanup = () => {
      isSigningIn = false;
      if (cleanupTimer) clearInterval(cleanupTimer);
      if (channel) {
        channel.close();
        channel = null;
      }
      window.removeEventListener('message', handleMessage);
    };

    // Handler for messages
    const handleSuccess = (userPayload: any, accessToken: string) => {
      cachedAccessToken = accessToken;
      cleanup();

      // Wait a tick for auth.currentUser to sync or use userPayload
      const user = auth.currentUser || (userPayload as User);
      resolve({ user, accessToken });
    };

    const handleFailure = (errorMsg: string) => {
      cleanup();
      reject(new Error(errorMsg || 'Google sign-in was cancelled or failed.'));
    };

    // 1. BroadcastChannel listener
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('topic_to_slides_auth');
      channel.onmessage = (e) => {
        const data = e.data;
        if (data?.type === 'AUTH_SUCCESS') {
          handleSuccess(data.user, data.accessToken);
        } else if (data?.type === 'AUTH_ERROR') {
          handleFailure(data.error);
        }
      };
    }

    // 2. window postMessage listener
    const handleMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const data = e.data;
      if (data?.type === 'AUTH_SUCCESS') {
        handleSuccess(data.user, data.accessToken);
      } else if (data?.type === 'AUTH_ERROR') {
        handleFailure(data.error);
      }
    };
    window.addEventListener('message', handleMessage);

    // 3. Monitor tab closure (if user manually closes tab without logging in)
    cleanupTimer = setInterval(() => {
      if (authWindow.closed) {
        // Tab closed by user
        setTimeout(() => {
          if (isSigningIn) {
            cleanup();
            reject(new Error('Sign-in tab was closed before completing authentication.'));
          }
        }, 1200);
      }
    }, 600);
  });
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
  if (typeof window !== 'undefined') {
    try {
      if (token) {
        sessionStorage.setItem('topic_slides_access_token', token);
      } else {
        sessionStorage.removeItem('topic_slides_access_token');
      }
    } catch (_) {}
  }
};

export const getAccessToken = (): string | null => {
  if (cachedAccessToken) return cachedAccessToken;
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem('topic_slides_access_token');
      if (stored) {
        cachedAccessToken = stored;
        return stored;
      }
    } catch (_) {}
  }
  return null;
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string }> => {
  // If not inside an iframe (e.g. top-level on Vercel or localhost), try signInWithPopup directly
  const isTopWindow = typeof window !== 'undefined' && window.top === window.self;

  if (isTopWindow) {
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken || null;

      if (!accessToken) {
        throw new Error('Google did not return an access token for Slides permissions.');
      }

      setCachedAccessToken(accessToken);
      return { user: result.user, accessToken };
    } catch (popupErr: any) {
      console.warn('Direct popup auth encounter:', popupErr);
      // If user deliberately cancelled/closed popup, don't fallback to tab
      if (
        popupErr?.code === 'auth/popup-closed-by-user' ||
        popupErr?.code === 'auth/cancelled-popup-request'
      ) {
        throw new Error('Sign-in was cancelled.');
      }
      // If popup was blocked or unauthorized domain, try openGoogleSignInTab fallback
      if (popupErr?.code === 'auth/popup-blocked') {
        return openGoogleSignInTab();
      }
      throw popupErr;
    }
  }

  // Inside iframe or constrained environment: use dedicated tab
  return openGoogleSignInTab();
};

export const logout = async () => {
  await signOut(auth);
  setCachedAccessToken(null);

  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const channel = new BroadcastChannel('topic_to_slides_auth');
      channel.postMessage({ type: 'AUTH_LOGOUT' });
      channel.close();
    } catch (_) {}
  }
};

export {
  auth,
  provider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
};
