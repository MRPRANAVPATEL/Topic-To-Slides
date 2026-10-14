import React, { useState } from 'react';
import {
  Mic,
  Plus,
  Trash2,
  Edit2,
  Check,
  Palette,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  ImageOff,
  ExternalLink,
  Quote,
} from 'lucide-react';
import { SlideItem, DeckLayoutMode, SlidePhoto } from '../types';

interface SlideCardProps {
  slide: SlideItem;
  totalSlides: number;
  layoutMode: DeckLayoutMode;
  onUpdateSlide: (updatedSlide: SlideItem) => void;
  isActive?: boolean;
}

const PRESET_COLORS = [
  '#4F46E5', // Indigo
  '#2563EB', // Blue
  '#059669', // Emerald
  '#0D9488', // Teal
  '#D97706', // Amber
  '#EA580C', // Orange
  '#DC2626', // Red
  '#E11D48', // Rose
  '#7C3AED', // Purple
  '#475569', // Slate
];

export const SlideCard: React.FC<SlideCardProps> = ({
  slide,
  totalSlides,
  layoutMode,
  onUpdateSlide,
  isActive = true,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isSwappingPhoto, setIsSwappingPhoto] = useState(false);
  const [isCustomSearchOpen, setIsCustomSearchOpen] = useState(false);
  const [customSearchQuery, setCustomSearchQuery] = useState(slide.imageQuery || '');

  const isTitle = !!slide.isTitleSlide;
  const hasPhoto = !!(slide.hasImage && slide.photo?.url && layoutMode !== 'no-images');
  const isOverlayMode = isTitle || layoutMode === 'background-overlay';
  const isPhotoRight = !isTitle && layoutMode === 'photo-right' && hasPhoto;

  const handleTitleChange = (newTitle: string) => {
    onUpdateSlide({ ...slide, title: newTitle });
  };

  const handleBulletChange = (index: number, newText: string) => {
    const updatedBullets = [...slide.bullets];
    updatedBullets[index] = newText;
    onUpdateSlide({ ...slide, bullets: updatedBullets });
  };

  const handleAddBullet = () => {
    if (slide.bullets.length >= 6) return;
    onUpdateSlide({
      ...slide,
      bullets: [...slide.bullets, 'New discussion point'],
    });
  };

  const handleRemoveBullet = (index: number) => {
    if (slide.bullets.length <= 1) return;
    const updatedBullets = slide.bullets.filter((_, i) => i !== index);
    onUpdateSlide({ ...slide, bullets: updatedBullets });
  };

  const handleSpeakerNoteChange = (newNote: string) => {
    onUpdateSlide({ ...slide, speakerNote: newNote });
  };

  const handleColorChange = (color: string) => {
    onUpdateSlide({ ...slide, accentColor: color });
    setShowColorPicker(false);
  };

  // Swap photo to next candidate or search
  const handleSwapPhoto = async () => {
    if (isSwappingPhoto) return;
    setIsSwappingPhoto(true);

    try {
      // If we have candidate photos pre-fetched, cycle through them
      const candidates = slide.candidatePhotos || [];
      const currentUrl = slide.photo?.url;
      const currentIndex = candidates.findIndex((p) => p.url === currentUrl);

      if (candidates.length > 1 && currentIndex !== -1 && currentIndex < candidates.length - 1) {
        // Next pre-fetched candidate
        const nextPhoto = candidates[currentIndex + 1];
        onUpdateSlide({
          ...slide,
          photo: nextPhoto,
          hasImage: true,
        });
      } else {
        // Fetch new search result from server
        const res = await fetch('/api/search-photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: slide.imageQuery || slide.title,
            slideIndex: slide.slideNumber,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.candidates && data.candidates.length > 0) {
            // Pick a different one if possible
            const chosen =
              data.candidates.find((c: SlidePhoto) => c.url !== currentUrl) || data.primary;
            onUpdateSlide({
              ...slide,
              photo: chosen,
              candidatePhotos: data.candidates,
              hasImage: true,
            });
          }
        }
      }
    } catch (err) {
      console.warn('Swap photo error:', err);
    } finally {
      setIsSwappingPhoto(false);
    }
  };

  // Custom search query submission
  const handleCustomSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSearchQuery.trim() || isSwappingPhoto) return;
    setIsSwappingPhoto(true);

    try {
      const res = await fetch('/api/search-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: customSearchQuery.trim(),
          slideIndex: slide.slideNumber,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onUpdateSlide({
          ...slide,
          imageQuery: customSearchQuery.trim(),
          photo: data.primary,
          candidatePhotos: data.candidates,
          hasImage: true,
        });
        setIsCustomSearchOpen(false);
      }
    } catch (err) {
      console.warn('Custom search photo error:', err);
    } finally {
      setIsSwappingPhoto(false);
    }
  };

  const handleToggleRemoveImage = () => {
    onUpdateSlide({
      ...slide,
      hasImage: !slide.hasImage,
    });
  };

  return (
    <div
      className={`rounded-2xl bg-white border transition-all duration-200 overflow-hidden shadow-sm ${
        isActive
          ? 'border-slate-300 ring-2 ring-slate-400/20 shadow-md'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* 16:9 Presentation Canvas Preview */}
      <div className="relative aspect-[16/9] w-full flex flex-col justify-between p-6 sm:p-8 select-text overflow-hidden bg-slate-900">
        {/* Slide Background: Full-bleed photo with dark scrim overlay OR solid gradient */}
        {hasPhoto && isOverlayMode ? (
          <>
            <div
              className={`absolute inset-0 bg-cover bg-center transition-all duration-500 ${
                isSwappingPhoto ? 'opacity-40 scale-105' : 'opacity-100 scale-100'
              }`}
              style={{ backgroundImage: `url(${slide.photo!.url})` }}
            />
            {/* 55% Scrim overlay for high contrast readability */}
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[0.5px]" />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                layoutMode === 'no-images'
                  ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                  : 'radial-gradient(ellipse at top right, rgba(30, 41, 59, 1), rgba(15, 23, 42, 1))',
            }}
          />
        )}

        {/* Top Accent Stripe */}
        <div
          className="absolute top-0 left-0 right-0 h-2 z-10 transition-colors duration-300"
          style={{ backgroundColor: slide.accentColor }}
        />

        {/* Top Bar: Section badge + Image & Color Controls */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors shadow-2xs"
                style={{
                  backgroundColor:
                    hasPhoto && isOverlayMode
                      ? 'rgba(0,0,0,0.5)'
                      : `${slide.accentColor}18`,
                  color:
                    hasPhoto && isOverlayMode
                      ? '#ffffff'
                      : slide.accentColor,
                  border: `1px solid ${slide.accentColor}55`,
                }}
              >
                {isTitle
                  ? 'Title Slide'
                  : `Slide ${slide.slideNumber} • ${slide.sectionTitle || 'Section'}`}
              </span>

              {isTitle && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium border border-amber-400/40 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  Hero
                </span>
              )}

              {slide.slideType === 'quote' && !isTitle && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium border border-purple-400/40">
                  Quote
                </span>
              )}
            </div>

            {/* Quick Action Buttons for Photo & Accent Color */}
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md rounded-xl p-1 border border-white/10">
              {/* Swap Photo Button */}
              {layoutMode !== 'no-images' && (
                <>
                  <button
                    type="button"
                    onClick={handleSwapPhoto}
                    disabled={isSwappingPhoto}
                    className="flex items-center gap-1 text-[11px] text-slate-200 hover:text-white px-2 py-1 rounded-lg hover:bg-white/15 transition-colors disabled:opacity-50"
                    title="Swap to next candidate photo"
                  >
                    <RefreshCw
                      className={`w-3 h-3 ${
                        isSwappingPhoto ? 'animate-spin text-amber-400' : ''
                      }`}
                    />
                    <span>Swap</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleRemoveImage}
                    className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/15 transition-colors"
                    title={slide.hasImage ? 'Remove photo' : 'Restore photo'}
                  >
                    {slide.hasImage ? (
                      <ImageOff className="w-3.5 h-3.5 text-rose-300" />
                    ) : (
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-300" />
                    )}
                  </button>
                </>
              )}

              {/* Accent Color Picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/15 transition-colors flex items-center"
                  title="Change slide accent color"
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs"
                    style={{ backgroundColor: slide.accentColor }}
                  />
                </button>

                {showColorPicker && (
                  <div className="absolute right-0 top-8 z-30 p-2.5 bg-slate-900 rounded-xl shadow-2xl border border-white/20 grid grid-cols-5 gap-1.5 w-44">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleColorChange(c)}
                        className="w-6 h-6 rounded-full border-2 border-white/40 hover:scale-110 transition-transform shadow-xs"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Slide Title (Editable) */}
          <div className="mb-3">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={slide.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  autoFocus
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setIsEditingTitle(false);
                  }}
                  className={`w-full text-lg sm:text-2xl font-extrabold border-b-2 border-amber-500 bg-transparent focus:outline-none pb-0.5 ${
                    hasPhoto && isOverlayMode ? 'text-white' : 'text-slate-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(false)}
                  className="p-1 rounded bg-white/20 hover:bg-white/30 text-white"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            ) : (
              <div className="group flex items-start gap-2">
                <h3
                  onClick={() => setIsEditingTitle(true)}
                  className={`text-base sm:text-2xl font-extrabold tracking-tight cursor-pointer transition-colors leading-snug ${
                    hasPhoto && isOverlayMode
                      ? 'text-white hover:text-slate-200'
                      : layoutMode === 'no-images'
                      ? 'text-slate-900 hover:text-slate-700'
                      : 'text-white hover:text-slate-200'
                  }`}
                >
                  {slide.title || 'Click to edit title'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(true)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-white"
                  title="Edit title"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Subtitle if title slide */}
            {isTitle && slide.subtitle && (
              <p
                className={`text-xs sm:text-sm font-medium mt-1 ${
                  hasPhoto && isOverlayMode ? 'text-slate-200' : 'text-slate-500'
                }`}
              >
                {slide.subtitle}
              </p>
            )}
          </div>

          {/* Body Content / Bullets Area */}
          <div className="relative">
            {isPhotoRight ? (
              /* Photo on right layout */
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-8 space-y-1.5">
                  {slide.bullets.map((bullet, idx) => (
                    <div
                      key={idx}
                      className="group flex items-start gap-2 p-1 -mx-1 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <span
                        className="w-2 h-2 rounded-full mt-2 shrink-0 transition-colors"
                        style={{ backgroundColor: slide.accentColor }}
                      />
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => handleBulletChange(idx, e.target.value)}
                        className="w-full text-xs sm:text-sm font-medium text-slate-100 bg-transparent focus:outline-none focus:bg-black/30 rounded px-1.5 py-0.5 leading-relaxed"
                        placeholder="Bullet point..."
                      />
                      {slide.bullets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBullet(idx)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="sm:col-span-4 flex justify-end">
                  <div className="relative rounded-xl overflow-hidden shadow-lg border border-white/20 aspect-[4/3] w-full max-w-[170px]">
                    <img
                      src={slide.photo!.url}
                      alt={slide.photo!.alt}
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-[9px] text-slate-300">
                      Photo
                    </div>
                  </div>
                </div>
              </div>
            ) : slide.slideType === 'quote' ? (
              /* Quote Layout Preview */
              <div className="space-y-2 py-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 italic">
                  <Quote className="w-3.5 h-3.5" />
                  <span>Attribution: {slide.quoteAuthor || 'Core Thesis'}</span>
                </div>
                <div className="space-y-1.5">
                  {slide.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                        style={{ backgroundColor: slide.accentColor }}
                      />
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => handleBulletChange(idx, e.target.value)}
                        className="w-full text-xs sm:text-sm text-slate-200 bg-transparent focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Standard Bullets List */
              <div className="space-y-1.5">
                {slide.bullets.map((bullet, idx) => (
                  <div
                    key={idx}
                    className="group flex items-start gap-2 p-1 -mx-1 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <span
                      className="w-2 h-2 rounded-full mt-2 shrink-0 transition-colors"
                      style={{ backgroundColor: slide.accentColor }}
                    />
                    <input
                      type="text"
                      value={bullet}
                      onChange={(e) => handleBulletChange(idx, e.target.value)}
                      className={`w-full text-xs sm:text-sm font-medium bg-transparent focus:outline-none focus:bg-black/30 rounded px-1.5 py-0.5 leading-relaxed ${
                        hasPhoto && isOverlayMode
                          ? 'text-slate-100'
                          : layoutMode === 'no-images'
                          ? 'text-slate-700'
                          : 'text-slate-100'
                      }`}
                      placeholder="Enter bullet point..."
                    />
                    {slide.bullets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveBullet(idx)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-rose-400"
                        title="Remove bullet"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}

                {slide.bullets.length < 6 && (
                  <button
                    type="button"
                    onClick={handleAddBullet}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white px-2 py-0.5 rounded-lg transition-colors mt-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add bullet</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer info: Photographer credit & slide number */}
        <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-slate-400">
          <div className="flex items-center gap-2 truncate max-w-sm">
            {hasPhoto && slide.photo ? (
              <span className="truncate">
                {slide.photo.source === 'AI' ? (
                  <>
                    Visual: <strong className="text-slate-300">AI Generated</strong>
                  </>
                ) : (
                  <>
                    Photo by <strong className="text-slate-300">{slide.photo.photographer}</strong>
                    {slide.photo.source === 'Unsplash' ? ' on Unsplash' : ` (${slide.photo.source})`}
                  </>
                )}
              </span>
            ) : (
              <span>Topic to Slides</span>
            )}
          </div>
          <span className="shrink-0 font-mono">
            Slide {slide.slideNumber} of {totalSlides}
          </span>
        </div>
      </div>

      {/* Speaker Note Drawer & Photo Keyword Search */}
      <div className="bg-slate-50/90 p-4 border-t border-slate-200/70 space-y-3">
        {/* Photo Query Pill & Custom Keyword Search Trigger */}
        {layoutMode !== 'no-images' && slide.hasImage && (
          <div className="flex items-center justify-between gap-2 text-xs text-slate-600 bg-white border border-slate-200/80 rounded-xl px-3 py-2">
            <div className="flex items-center gap-2 truncate">
              <ImageIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-slate-500 shrink-0">Photo Query:</span>
              <span className="font-semibold text-slate-800 truncate">
                "{slide.imageQuery}"
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsCustomSearchOpen(!isCustomSearchOpen)}
              className="text-xs text-amber-700 hover:text-amber-900 font-semibold shrink-0"
            >
              {isCustomSearchOpen ? 'Close' : 'Change Query'}
            </button>
          </div>
        )}

        {/* Custom Search Form */}
        {isCustomSearchOpen && (
          <form
            onSubmit={handleCustomSearchSubmit}
            className="flex items-center gap-2 pt-1"
          >
            <input
              type="text"
              value={customSearchQuery}
              onChange={(e) => setCustomSearchQuery(e.target.value)}
              placeholder="e.g. coral reef, solar flare, deep forest..."
              className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={isSwappingPhoto}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shrink-0 disabled:opacity-50"
            >
              Search
            </button>
          </form>
        )}

        {/* Speaker Note Editor */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Mic className="w-3.5 h-3.5 text-amber-600" />
              <span>Speaker Note (Presenter Guidance)</span>
            </div>
            <span className="text-[10px] text-slate-400">
              Exported to Google Slides presenter notes
            </span>
          </div>
          <textarea
            value={slide.speakerNote}
            onChange={(e) => handleSpeakerNoteChange(e.target.value)}
            rows={2}
            className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 resize-none leading-relaxed"
            placeholder="One-line talking point or presenter cue..."
          />
        </div>
      </div>
    </div>
  );
};
