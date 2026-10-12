export type SlideLevel = 'simple' | 'student' | 'advanced';

export type DeckLayoutMode =
  | 'background-overlay' // Background photo with dark scrim overlay & white text
  | 'photo-right'        // Text on the left, photo card on the right
  | 'no-images';         // Clean colorful vector theme, no photos

export type SlideType = 'title' | 'bullets' | 'quote' | 'stats' | 'closing';

export interface SlidePhoto {
  url: string;
  thumbUrl: string;
  photographer: string;
  photographerUrl?: string;
  source: 'Unsplash' | 'Gradient';
  alt: string;
}

export interface StatPillar {
  number: string;
  label: string;
}

export interface SlideItem {
  id: string;
  slideNumber: number;
  slideType: SlideType;
  sectionTitle: string;
  title: string;
  subtitle?: string;
  bullets: string[];
  speakerNote: string;
  accentColor: string;
  isTitleSlide?: boolean;
  imageQuery: string;
  photo: SlidePhoto | null;
  candidatePhotos?: SlidePhoto[];
  hasImage: boolean;
  quoteAuthor?: string;
  statPillars?: StatPillar[];
}

export interface PresentationOutline {
  topic: string;
  level: SlideLevel;
  title: string;
  subtitle: string;
  layoutMode: DeckLayoutMode;
  buildBulletsAcrossSlides: boolean;
  slides: SlideItem[];
  photoNotice?: string;
}

export interface ExportResult {
  presentationId: string;
  presentationUrl: string;
  title: string;
  slideCount: number;
  createdTime: string;
  layoutMode: DeckLayoutMode;
  buildBulletsApplied: boolean;
}

export interface UserProfile {
  name: string | null;
  email: string | null;
  photoURL: string | null;
}
