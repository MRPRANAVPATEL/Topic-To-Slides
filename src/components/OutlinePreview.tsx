import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Layers,
  Sparkles,
  Presentation,
  RefreshCw,
  Play,
  Sliders,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { PresentationOutline, SlideItem, DeckLayoutMode } from '../types';
import { SlideCard } from './SlideCard';

interface OutlinePreviewProps {
  outline: PresentationOutline;
  onUpdateSlide: (updatedSlide: SlideItem) => void;
  onUpdateLayoutMode: (mode: DeckLayoutMode) => void;
  onToggleBuildBullets: (enabled: boolean) => void;
  onExport: () => void;
  onReset: () => void;
  onStartPresenting: (slideIndex?: number) => void;
  isExporting: boolean;
  hasGoogleAuth: boolean;
}

export const OutlinePreview: React.FC<OutlinePreviewProps> = ({
  outline,
  onUpdateSlide,
  onUpdateLayoutMode,
  onToggleBuildBullets,
  onExport,
  onReset,
  onStartPresenting,
  isExporting,
  hasGoogleAuth,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');

  const slides = outline.slides;
  const currentSlide = slides[currentSlideIndex] || slides[0];

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Deck Controls Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 uppercase tracking-wide">
              {outline.level} Level
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">
              6 Slides (1 Title + 5 Content)
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              HD Photos Linked
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {outline.title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{outline.subtitle}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Animated In-App Presenter Mode */}
          <button
            type="button"
            onClick={() => onStartPresenting(currentSlideIndex)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-transform active:scale-[0.98] cursor-pointer"
            title="Present preview with Ken Burns animations and bullet build steps"
          >
            <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Present Preview</span>
          </button>

          {/* View toggle (Slide vs Grid) */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center">
            <button
              type="button"
              onClick={() => setViewMode('carousel')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'carousel'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Slide View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid View</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors flex items-center gap-1.5"
            title="Start over with a new topic"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Topic</span>
          </button>

          {/* Create in Google Slides Button */}
          <button
            type="button"
            onClick={onExport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-sm transition-all text-sm active:scale-[0.98] cursor-pointer disabled:opacity-60"
          >
            <Presentation className="w-4 h-4" />
            <span>Create in Google Slides</span>
          </button>
        </div>
      </div>

      {/* Deck Layout & Animation Settings Bar */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Layout Mode Selector (Requirement 2) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-700 shrink-0 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-600" />
            Deck Layout:
          </span>
          <div className="grid grid-cols-3 gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => onUpdateLayoutMode('background-overlay')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all text-center ${
                outline.layoutMode === 'background-overlay'
                  ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Photo Overlay
            </button>
            <button
              type="button"
              onClick={() => onUpdateLayoutMode('photo-right')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all text-center ${
                outline.layoutMode === 'photo-right'
                  ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Photo on Right
            </button>
            <button
              type="button"
              onClick={() => onUpdateLayoutMode('no-images')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all text-center ${
                outline.layoutMode === 'no-images'
                  ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              No Images
            </button>
          </div>
        </div>

        {/* Progressive Bullets Toggle (Requirement 4) */}
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={outline.buildBulletsAcrossSlides}
              onChange={(e) => onToggleBuildBullets(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            <span className="ml-2.5 text-xs font-semibold text-slate-800">
              Build bullets across slides
            </span>
          </label>
          <span
            className="text-[11px] text-slate-400 hidden sm:inline"
            title="Creates progressive build slides in Google Slides so bullet points appear step-by-step when presenting"
          >
            (Progressive presentation animation)
          </span>
        </div>
      </div>

      {/* Rate limit friendly notice */}
      {outline.photoNotice && (
        <div className="flex items-center gap-2.5 text-xs text-amber-900 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-medium">{outline.photoNotice}</span>
        </div>
      )}

      {/* Interactive Edit Notice */}
      <div className="flex items-center justify-between text-xs text-amber-900 bg-amber-50/70 border border-amber-200/60 rounded-xl px-4 py-2.5">
        <span className="flex items-center gap-2 font-medium">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Interactive Preview:</strong> Edit titles, bullets, speaker
            notes, or click <strong>Swap</strong> to switch photos before creating
            your Google Slides deck.
          </span>
        </span>
      </div>

      {/* Carousel View Mode */}
      {viewMode === 'carousel' ? (
        <div className="space-y-4">
          {/* Navigation Tab Bar */}
          <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl p-2 px-3">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                    currentSlideIndex === idx
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: s.accentColor }}
                  />
                  <span>
                    {idx === 0 ? 'Title Slide' : `Slide ${idx + 1}`}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 pl-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentSlideIndex === 0}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-500 px-1 font-mono">
                {currentSlideIndex + 1}/{slides.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                disabled={currentSlideIndex === slides.length - 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Current Slide Canvas Preview */}
          <div className="max-w-4xl mx-auto">
            <SlideCard
              slide={currentSlide}
              totalSlides={slides.length}
              layoutMode={outline.layoutMode}
              onUpdateSlide={onUpdateSlide}
              isActive={true}
            />
          </div>
        </div>
      ) : (
        /* Grid View Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {slides.map((slide) => (
            <SlideCard
              key={slide.id}
              slide={slide}
              totalSlides={slides.length}
              layoutMode={outline.layoutMode}
              onUpdateSlide={onUpdateSlide}
              isActive={false}
            />
          ))}
        </div>
      )}

      {/* Bottom Export Callout */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 border border-amber-200/80 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Ready to generate your Google Slides deck?
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Will create a presentation in your Google Drive with HD photos,
            colorful section themes, formatted bullets, and presenter notes.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onStartPresenting(0)}
            className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors shadow-2xs"
          >
            <Play className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Present Preview</span>
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md transition-all text-sm active:scale-[0.98] cursor-pointer disabled:opacity-60 shrink-0"
          >
            <Presentation className="w-4 h-4" />
            <span>Generate Google Slides Deck</span>
          </button>
        </div>
      </div>
    </div>
  );
};
