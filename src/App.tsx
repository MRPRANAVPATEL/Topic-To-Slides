/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from './services/auth';
import { createGoogleSlidesPresentation } from './services/slides';
import { Header } from './components/Header';
import { GeneratorForm } from './components/GeneratorForm';
import { OutlinePreview } from './components/OutlinePreview';
import { InAppPresenter } from './components/InAppPresenter';
import { ExportConfirmModal } from './components/ExportConfirmModal';
import { ExportProgressModal } from './components/ExportProgressModal';
import { SuccessBanner } from './components/SuccessBanner';
import { ErrorAlert } from './components/ErrorAlert';
import {
  PresentationOutline,
  SlideItem,
  SlideLevel,
  DeckLayoutMode,
  ExportResult,
} from './types';
import {
  Presentation,
  Sparkles,
  Layers,
  Palette,
  Image as ImageIcon,
  Play,
  Sliders,
} from 'lucide-react';

export default function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Generator input state
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<SlideLevel>('student');
  const [layoutMode, setLayoutMode] = useState<DeckLayoutMode>('background-overlay');
  const [isGenerating, setIsGenerating] = useState(false);

  // Outline state
  const [outline, setOutline] = useState<PresentationOutline | null>(null);

  // Presenter mode state
  const [isPresenting, setIsPresenting] = useState(false);
  const [presenterSlideIndex, setPresenterSlideIndex] = useState(0);

  // Export state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgressMessage, setExportProgressMessage] = useState('');
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);

  // Error handling
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser) => {
        setUser(currentUser);
      },
      () => {
        setUser(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Handle Google Sign In
  const handleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMessage(null);
    setIsAuthError(false);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(
          'Failed to sign in with Google. Please check your browser popup settings and try again.'
        );
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Sign Out
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Generate presentation outline with Gemini and search photos in parallel
  const handleGenerateOutline = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setErrorMessage(null);
    setIsAuthError(false);
    setExportResult(null);

    try {
      const response = await fetch('/api/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), level, layoutMode }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Server responded with ${response.status}. Please check your connection.`
        );
      }

      const data: PresentationOutline = await response.json();
      setOutline(data);
    } catch (err: any) {
      console.error('Generate error:', err);
      setErrorMessage(
        err?.message ||
          'Could not generate outline. Please try a different topic or try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Update a single slide during preview editing
  const handleUpdateSlide = (updatedSlide: SlideItem) => {
    if (!outline) return;
    const newSlides = outline.slides.map((s) =>
      s.id === updatedSlide.id ? updatedSlide : s
    );
    setOutline({ ...outline, slides: newSlides });
  };

  // Update deck layout mode ('background-overlay' | 'photo-right' | 'no-images')
  const handleUpdateLayoutMode = (mode: DeckLayoutMode) => {
    setLayoutMode(mode);
    if (outline) {
      setOutline({ ...outline, layoutMode: mode });
    }
  };

  // Toggle progressive bullet builds across slides
  const handleToggleBuildBullets = (enabled: boolean) => {
    if (outline) {
      setOutline({ ...outline, buildBulletsAcrossSlides: enabled });
    }
  };

  // Start animated in-app presenter mode
  const handleStartPresenting = (slideIndex = 0) => {
    setPresenterSlideIndex(slideIndex);
    setIsPresenting(true);
  };

  // Trigger export flow
  const handleStartExport = () => {
    setErrorMessage(null);
    setIsAuthError(false);

    // If user is not authenticated yet, prompt sign-in first
    if (!user || !getAccessToken()) {
      setIsAuthError(true);
      setErrorMessage(
        'Please connect your Google Account so Topic to Slides can create the presentation in your Google Slides.'
      );
      handleLogin();
      return;
    }

    // Show explicit user confirmation dialog
    setShowConfirmModal(true);
  };

  // Confirm and execute Google Slides export
  const handleConfirmExport = async () => {
    if (!outline) return;

    const token = getAccessToken();
    if (!token) {
      setShowConfirmModal(false);
      setIsAuthError(true);
      setErrorMessage(
        'Google authorization token is missing or expired. Please sign in again.'
      );
      handleLogin();
      return;
    }

    setShowConfirmModal(false);
    setIsExporting(true);
    setExportProgressMessage('Initializing presentation in Google Slides...');
    setErrorMessage(null);

    try {
      const result = await createGoogleSlidesPresentation(
        token,
        outline,
        (progressStep) => setExportProgressMessage(progressStep)
      );
      setExportResult(result);
    } catch (err: any) {
      console.error('Slides export failed:', err);
      const isAuthIssue =
        err?.message?.includes('expired') ||
        err?.message?.includes('authorization') ||
        err?.message?.includes('401');

      setIsAuthError(isAuthIssue);
      setErrorMessage(
        err?.message ||
          'Failed to create presentation in Google Slides. Please verify your connection and permissions.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Reset to create another presentation
  const handleReset = () => {
    setOutline(null);
    setExportResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-amber-100 selection:text-amber-900">
      {/* Top Header */}
      <Header
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Friendly Error Alert */}
        {errorMessage && (
          <ErrorAlert
            message={errorMessage}
            onDismiss={() => setErrorMessage(null)}
            onRetry={outline ? handleConfirmExport : handleGenerateOutline}
            onSignIn={handleLogin}
            isAuthError={isAuthError}
          />
        )}

        {/* Success Banner when presentation is created */}
        {exportResult && (
          <SuccessBanner
            result={exportResult}
            onNewPresentation={handleReset}
          />
        )}

        {/* View Mode: Either Outline Preview or Generator Form */}
        {outline ? (
          <OutlinePreview
            outline={outline}
            onUpdateSlide={handleUpdateSlide}
            onUpdateLayoutMode={handleUpdateLayoutMode}
            onToggleBuildBullets={handleToggleBuildBullets}
            onExport={handleStartExport}
            onReset={handleReset}
            onStartPresenting={handleStartPresenting}
            isExporting={isExporting}
            hasGoogleAuth={!!user}
          />
        ) : (
          <div className="space-y-8">
            {/* Hero Introduction */}
            <div className="text-center max-w-2xl mx-auto space-y-3 pt-2 sm:pt-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100/80 border border-amber-200 text-amber-900 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>AI Slide Architect with HD Photography</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                From any topic to a cinematic Google Slides deck in seconds.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Gemini structures a 6-slide deck with varied layouts, HD landscape
                photos, colorful section themes, speaker notes, and animated
                presentation capabilities.
              </p>
            </div>

            {/* Input & Options Form */}
            <div className="max-w-3xl mx-auto">
              <GeneratorForm
                topic={topic}
                onTopicChange={setTopic}
                level={level}
                onLevelChange={setLevel}
                layoutMode={layoutMode}
                onLayoutModeChange={handleUpdateLayoutMode}
                onGenerate={handleGenerateOutline}
                isLoading={isGenerating}
              />
            </div>

            {/* Feature Highlights Grid */}
            <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  HD Photos & Backgrounds
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Automatic high-res landscape photos via Unsplash with readable scrim overlays and photographer credits.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                  <Play className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Animated Presenter & Builds
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Present in-app with Ken Burns zoom and step-by-step bullet reveals, or generate progressive build slides for Google Slides.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  <Presentation className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Direct Google Slides Sync
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Creates an editable presentation in your Google Drive with one accent color per section and embedded speaker notes.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* In-App Animated Presenter Mode */}
      {isPresenting && outline && (
        <InAppPresenter
          outline={outline}
          initialSlideIndex={presenterSlideIndex}
          onClose={() => setIsPresenting(false)}
        />
      )}

      {/* Confirmation Modal before making Google Slides calls */}
      <ExportConfirmModal
        isOpen={showConfirmModal}
        outline={outline}
        onConfirm={handleConfirmExport}
        onCancel={() => setShowConfirmModal(false)}
        isCreating={isExporting}
      />

      {/* Live Export Progress Modal */}
      <ExportProgressModal
        isOpen={isExporting}
        stepMessage={exportProgressMessage}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/50 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Presentation className="w-4 h-4 text-amber-600" />
            <span className="font-semibold text-slate-700">Topic to Slides</span>
            <span>• Powered by Gemini & Google Slides API</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>HD Photo Integration</span>
            <span>•</span>
            <span>Animated Presentation Mode</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
