import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Mic,
  Maximize2,
  Sparkles,
  Quote,
  CheckCircle2,
} from 'lucide-react';
import { PresentationOutline, SlideItem } from '../types';

interface InAppPresenterProps {
  outline: PresentationOutline;
  onClose: () => void;
  initialSlideIndex?: number;
}

export const InAppPresenter: React.FC<InAppPresenterProps> = ({
  outline,
  onClose,
  initialSlideIndex = 0,
}) => {
  const [slideIndex, setSlideIndex] = useState(initialSlideIndex);
  const [revealedBulletCount, setRevealedBulletCount] = useState(1);
  const [showNotes, setShowNotes] = useState(false);

  const slides = outline.slides;
  const currentSlide: SlideItem = slides[slideIndex] || slides[0];
  const isTitle = !!currentSlide.isTitleSlide;
  const layoutMode = outline.layoutMode;
  const hasPhoto = !!(currentSlide.hasImage && currentSlide.photo?.url && layoutMode !== 'no-images');
  const isOverlayMode = isTitle || layoutMode === 'background-overlay';
  const isPhotoRight = !isTitle && layoutMode === 'photo-right' && hasPhoto;

  // Reset revealed bullets when switching slides
  useEffect(() => {
    setRevealedBulletCount(1);
  }, [slideIndex]);

  // Advance next (either next bullet or next slide)
  const handleAdvance = useCallback(() => {
    if (revealedBulletCount < currentSlide.bullets.length) {
      setRevealedBulletCount((prev) => prev + 1);
    } else if (slideIndex < slides.length - 1) {
      setSlideIndex((prev) => prev + 1);
    }
  }, [revealedBulletCount, currentSlide.bullets.length, slideIndex, slides.length]);

  // Step back (either previous bullet or previous slide)
  const handleBack = useCallback(() => {
    if (revealedBulletCount > 1) {
      setRevealedBulletCount((prev) => prev - 1);
    } else if (slideIndex > 0) {
      const prevSlide = slides[slideIndex - 1];
      setSlideIndex((prev) => prev - 1);
      setRevealedBulletCount(prevSlide.bullets.length);
    }
  }, [revealedBulletCount, slideIndex, slides]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleAdvance();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'Backspace') {
        e.preventDefault();
        handleBack();
      } else if (e.key.toLowerCase() === 'n') {
        setShowNotes((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAdvance, handleBack, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between overflow-hidden select-none">
      {/* Top HUD */}
      <div className="z-20 px-6 py-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <span
            className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"
            style={{
              backgroundColor: `${currentSlide.accentColor}33`,
              color: currentSlide.accentColor,
              border: `1px solid ${currentSlide.accentColor}66`,
            }}
          >
            {isTitle
              ? 'Title Slide'
              : `${currentSlide.sectionTitle || `Section 0${currentSlide.slideNumber}`}`}
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            {outline.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showNotes
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
            title="Toggle Speaker Notes (N)"
          >
            <Mic className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Speaker Note (N)</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            title="Exit Presentation (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Slide Canvas */}
      <div
        onClick={handleAdvance}
        className="flex-1 relative flex items-center justify-center p-4 sm:p-12 cursor-pointer overflow-hidden"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative w-full max-w-6xl aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col justify-between p-8 sm:p-14"
          >
            {/* Background Image with gentle Ken Burns zoom */}
            {hasPhoto && isOverlayMode ? (
              <>
                <motion.div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${currentSlide.photo!.url})` }}
                  animate={{ scale: [1.0, 1.08] }}
                  transition={{
                    duration: 12,
                    ease: 'easeInOut',
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                />
                {/* 55% Scrim overlay for high contrast readability */}
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px]" />
              </>
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse at top right, rgba(30, 41, 59, 1), rgba(15, 23, 42, 1))',
                }}
              />
            )}

            {/* Top Accent Stripe */}
            <div
              className="absolute top-0 left-0 right-0 h-2 z-10"
              style={{ backgroundColor: currentSlide.accentColor }}
            />

            {/* Slide Body Content */}
            <div className="relative z-10 flex-1 flex flex-col justify-center">
              {isPhotoRight ? (
                /* Split Layout: Text left, Photo Right */
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-7 space-y-4">
                    <span
                      className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider inline-block"
                      style={{
                        backgroundColor: `${currentSlide.accentColor}33`,
                        color: currentSlide.accentColor,
                      }}
                    >
                      {currentSlide.sectionTitle}
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                      {currentSlide.title}
                    </h2>

                    <div className="space-y-3 pt-2">
                      {currentSlide.bullets.map((bullet, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{
                            opacity: idx < revealedBulletCount ? 1 : 0.15,
                            y: idx < revealedBulletCount ? 0 : 5,
                          }}
                          transition={{ duration: 0.25 }}
                          className="flex items-start gap-3"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full mt-2 shrink-0"
                            style={{ backgroundColor: currentSlide.accentColor }}
                          />
                          <p className="text-sm sm:text-lg text-slate-200 leading-relaxed">
                            {bullet}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-5 flex justify-center">
                    <div className="rounded-xl overflow-hidden shadow-2xl border border-white/20 aspect-[4/3] w-full max-w-sm">
                      <img
                        src={currentSlide.photo!.url}
                        alt={currentSlide.photo!.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              ) : currentSlide.slideType === 'quote' ? (
                /* Quote Layout */
                <div className="max-w-3xl mx-auto text-center space-y-6">
                  <Quote
                    className="w-12 h-12 mx-auto opacity-70"
                    style={{ color: currentSlide.accentColor }}
                  />
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug italic">
                    “{currentSlide.title}”
                  </h2>
                  <p
                    className="text-base sm:text-xl font-semibold"
                    style={{ color: currentSlide.accentColor }}
                  >
                    — {currentSlide.quoteAuthor || 'Core Thesis'}
                  </p>

                  <div className="space-y-2 pt-4">
                    {currentSlide.bullets.map((b, idx) => (
                      <motion.p
                        key={idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: idx < revealedBulletCount ? 1 : 0.2 }}
                        className="text-sm sm:text-base text-slate-300"
                      >
                        • {b}
                      </motion.p>
                    ))}
                  </div>
                </div>
              ) : (
                /* Standard Overlay or Full Layout */
                <div className="space-y-6 max-w-3xl">
                  {isTitle ? (
                    <div className="space-y-4">
                      <span
                        className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider inline-block"
                        style={{
                          backgroundColor: `${currentSlide.accentColor}33`,
                          color: currentSlide.accentColor,
                          border: `1px solid ${currentSlide.accentColor}66`,
                        }}
                      >
                        Presentation Overview
                      </span>
                      <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                        {currentSlide.title}
                      </h1>
                      {currentSlide.subtitle && (
                        <p className="text-lg sm:text-2xl text-slate-300 font-medium">
                          {currentSlide.subtitle}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <span
                        className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider inline-block mb-2"
                        style={{
                          backgroundColor: `${currentSlide.accentColor}33`,
                          color: currentSlide.accentColor,
                        }}
                      >
                        {currentSlide.sectionTitle}
                      </span>
                      <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                        {currentSlide.title}
                      </h2>
                    </div>
                  )}

                  {/* Bullet Points with Progressive Animation */}
                  <div className="space-y-3 pt-2">
                    {currentSlide.bullets.map((bullet, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{
                          opacity: idx < revealedBulletCount ? 1 : 0.15,
                          x: idx < revealedBulletCount ? 0 : -5,
                        }}
                        transition={{ duration: 0.25 }}
                        className="flex items-start gap-3.5"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full mt-2.5 shrink-0 transition-colors"
                          style={{ backgroundColor: currentSlide.accentColor }}
                        />
                        <p className="text-base sm:text-xl text-slate-100 font-normal leading-relaxed">
                          {bullet}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Credits & Page Indicator */}
            <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-white/10">
              <span>
                {hasPhoto && currentSlide.photo ? (
                  <span>
                    Photo by {currentSlide.photo.photographer} on Unsplash
                  </span>
                ) : (
                  <span>Topic to Slides</span>
                )}
              </span>
              <span>
                Slide {slideIndex + 1} of {slides.length}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Speaker Notes Drawer */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="z-30 max-w-2xl mx-auto w-full px-6 mb-2"
          >
            <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-4 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
                <Mic className="w-3.5 h-3.5" />
                <span>Presenter Talking Point</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {currentSlide.speakerNote || 'Introduce this concept to your audience.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Toolbar */}
      <div className="z-20 px-6 py-4 flex items-center justify-between bg-gradient-to-t from-black/90 to-transparent">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>Click anywhere or use Space / Right Arrow to advance</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleBack();
            }}
            disabled={slideIndex === 0 && revealedBulletCount <= 1}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous (Left Arrow)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="font-mono text-xs text-slate-300 px-2">
            {slideIndex + 1} / {slides.length}
            {currentSlide.bullets.length > 1 && (
              <span className="text-slate-500 ml-1">
                (bullet {revealedBulletCount}/{currentSlide.bullets.length})
              </span>
            )}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAdvance();
            }}
            disabled={
              slideIndex === slides.length - 1 &&
              revealedBulletCount >= currentSlide.bullets.length
            }
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Next (Right Arrow or Space)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
