import React from 'react';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Compass,
  Image as ImageIcon,
  Key,
} from 'lucide-react';
import { SlideLevel, DeckLayoutMode } from '../types';

interface GeneratorFormProps {
  topic: string;
  onTopicChange: (val: string) => void;
  level: SlideLevel;
  onLevelChange: (val: SlideLevel) => void;
  layoutMode: DeckLayoutMode;
  onLayoutModeChange: (val: DeckLayoutMode) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const SAMPLE_TOPICS = [
  'Introduction to Quantum Computing',
  'Photosynthesis & Plant Biology',
  'Design Thinking: A 5-Step Guide',
  'Sustainable Urban Architecture',
  'Machine Learning Fundamentals',
  'Personal Finance & Investing 101',
];

export const GeneratorForm: React.FC<GeneratorFormProps> = ({
  topic,
  onTopicChange,
  level,
  onLevelChange,
  layoutMode,
  onLayoutModeChange,
  onGenerate,
  isLoading,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isLoading) {
      onGenerate();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 transition-all space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Topic Input */}
        <div>
          <label
            htmlFor="topic-input"
            className="block text-sm font-semibold text-slate-900 mb-2"
          >
            What is your presentation topic?
          </label>
          <div className="relative">
            <input
              id="topic-input"
              type="text"
              value={topic}
              onChange={(e) => onTopicChange(e.target.value)}
              placeholder="e.g. The Future of Renewable Energy, Introduction to Neuroscience..."
              disabled={isLoading}
              className="w-full px-4 py-3.5 pr-28 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-base disabled:opacity-60"
            />
            {topic && (
              <button
                type="button"
                onClick={() => onTopicChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded bg-slate-200/60"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Level Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Select Audience & Depth Level
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Simple */}
            <button
              type="button"
              onClick={() => onLevelChange('simple')}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                level === 'simple'
                  ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                  <BookOpen
                    className={`w-4 h-4 ${
                      level === 'simple' ? 'text-emerald-600' : 'text-slate-500'
                    }`}
                  />
                  Simple
                </span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    level === 'simple'
                      ? 'bg-emerald-200 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  Beginner
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Plain language, relatable everyday analogies, clear and jargon-free.
              </p>
            </button>

            {/* Student */}
            <button
              type="button"
              onClick={() => onLevelChange('student')}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                level === 'student'
                  ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                  <GraduationCap
                    className={`w-4 h-4 ${
                      level === 'student' ? 'text-blue-600' : 'text-slate-500'
                    }`}
                  />
                  Student
                </span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    level === 'student'
                      ? 'bg-blue-200 text-blue-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  Standard
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Foundational concepts, educational definitions, practical examples.
              </p>
            </button>

            {/* Advanced */}
            <button
              type="button"
              onClick={() => onLevelChange('advanced')}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                level === 'advanced'
                  ? 'border-purple-500 bg-purple-50/70 ring-2 ring-purple-500/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                  <Compass
                    className={`w-4 h-4 ${
                      level === 'advanced' ? 'text-purple-600' : 'text-slate-500'
                    }`}
                  />
                  Advanced
                </span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    level === 'advanced'
                      ? 'bg-purple-200 text-purple-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  Expert
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Technical depth, strategic framework, metrics, industry nuances.
              </p>
            </button>
          </div>
        </div>

        {/* Deck Layout Style Selector */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Default Slide Design Style
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => onLayoutModeChange('background-overlay')}
              className={`p-3 rounded-xl border text-left transition-all ${
                layoutMode === 'background-overlay'
                  ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20 font-semibold'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/30 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-slate-900">Photo Overlay</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Full-bleed landscape photo background with dark overlay & white text.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onLayoutModeChange('photo-right')}
              className={`p-3 rounded-xl border text-left transition-all ${
                layoutMode === 'photo-right'
                  ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20 font-semibold'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/30 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-slate-900">Photo on Right</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Split composition: text on the left, photo card on the right.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onLayoutModeChange('no-images')}
              className={`p-3 rounded-xl border text-left transition-all ${
                layoutMode === 'no-images'
                  ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20 font-semibold'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/30 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <ImageIcon className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-900">No Images</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Clean colorful vector cards with vibrant section accent bars.
              </p>
            </button>
          </div>
        </div>

        {/* Sample topic ideas */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
            Or try an inspiration topic
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_TOPICS.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => onTopicChange(sample)}
                disabled={isLoading}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors disabled:opacity-50 text-left"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!topic.trim() || isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 active:scale-[0.99] shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Structuring deck with Gemini & sourcing photos...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-200" />
                <span>Generate Presentation Outline</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="pt-4 border-t border-slate-100 flex items-start gap-2.5 text-[11px] text-slate-500">
        <ImageIcon className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Unsplash Photos:</strong> Powered by Unsplash API for landscape photography. If the rate limit is reached or a search yields no results, vibrant colorful gradient themes are applied automatically.
        </p>
      </div>
    </div>
  );
};
