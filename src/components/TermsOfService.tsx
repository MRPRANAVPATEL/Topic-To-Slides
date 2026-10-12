import React from 'react';
import { Presentation, FileText, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, Scale } from 'lucide-react';

interface TermsProps {
  onBack?: () => void;
}

export const TermsOfService: React.FC<TermsProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/"
              onClick={(e) => {
                if (onBack) {
                  e.preventDefault();
                  onBack();
                }
              }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to App</span>
            </a>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                <Presentation className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 text-sm">Topic to Slides</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
            <Scale className="w-3.5 h-3.5 text-indigo-600" />
            <span>Terms of Service</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="space-y-3 border-b border-slate-200 pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5" />
            <span>Terms & Conditions Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-500">
            Last updated: October 12, 2026 • Effective immediately
          </p>
        </div>

        {/* Section 1: Acceptance */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-4 shadow-2xs">
          <div className="flex items-center gap-3 text-slate-900 font-bold text-lg">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h2>1. Acceptance of Terms</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            By accessing or using Topic to Slides ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree with any part of these Terms, you may not use the Service.
          </p>
        </section>

        {/* Section 2: Description of Service */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-4 shadow-2xs">
          <div className="flex items-center gap-3 text-slate-900 font-bold text-lg">
            <Presentation className="w-5 h-5 text-amber-600" />
            <h2>2. Description of Service</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Topic to Slides provides an automated presentation generation platform that:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
            <li>Takes user-submitted topics and audience levels to synthesize slide outlines using artificial intelligence.</li>
            <li>Fetches royalty-free landscape imagery matching slide concepts via the Unsplash API.</li>
            <li>Provides an in-app interactive slide editor and animated slideshow preview.</li>
            <li>Creates and writes presentations directly into the user's Google Drive via the official Google Slides API upon explicit confirmation.</li>
          </ul>
        </section>

        {/* Section 3: User Accounts & Google Authorization */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-4 shadow-2xs">
          <div className="flex items-center gap-3 text-slate-900 font-bold text-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h2>3. Google Account Authorization & Security</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            To export slide decks to Google Slides, you must authorize our application through Google OAuth. You are responsible for maintaining the confidentiality of your Google Account credentials. You agree that:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
            <li>Topic to Slides accesses Google Slides solely to create presentations you initiate.</li>
            <li>You can revoke access at any time via your Google Account Settings.</li>
            <li>You will not use the Service to generate presentations containing illegal, infringing, defamatory, or harmful content.</li>
          </ul>
        </section>

        {/* Section 4: Content Ownership & Intellectual Property */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-4 shadow-2xs">
          <div className="flex items-center gap-3 text-slate-900 font-bold text-lg">
            <Scale className="w-5 h-5 text-purple-600" />
            <h2>4. Intellectual Property & Ownership</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            <strong>Your Presentations:</strong> You own all presentations created with Topic to Slides. You are free to edit, publish, share, and commercially use presentations created in your Google Drive.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            <strong>Photography Attribution:</strong> Photos imported from Unsplash are licensed under the Unsplash License. In accordance with their license terms, automated attribution is included on slides utilizing Unsplash imagery.
          </p>
        </section>

        {/* Section 5: Disclaimers & Limitation of Liability */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-4 shadow-2xs">
          <div className="flex items-center gap-3 text-slate-900 font-bold text-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h2>5. Disclaimers & Limitation of Liability</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            The Service is provided on an "AS IS" and "AS AVAILABLE" basis. While we strive for high availability and accuracy, AI-generated outlines should be reviewed by users prior to presenting. We do not warrant that:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
            <li>AI-generated text or facts will be completely error-free.</li>
            <li>Third-party services (such as Google Slides or Unsplash APIs) will be uninterrupted or immune to rate limits.</li>
          </ul>
          <p className="text-sm text-slate-600 leading-relaxed">
            In no event shall the developer of Topic to Slides be liable for any indirect, incidental, special, consequential, or punitive damages arising from the use of the Service.
          </p>
        </section>

        {/* Section 6: Contact & Changes */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-4 shadow-2xs">
          <h2 className="text-slate-900 font-bold text-lg">6. Changes to Terms & Contact</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            We reserve the right to modify these Terms at any time. Continued use of the Service following modifications signifies acceptance of the revised Terms.
          </p>
          <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-700 space-y-1">
            <p className="font-semibold text-slate-900">Developer Contact: Pranav Patel</p>
            <p>Email: <a href="mailto:pranavpatel.st@gmail.com" className="text-indigo-600 underline">pranavpatel.st@gmail.com</a></p>
            <p>Application: Topic to Slides</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 Topic to Slides. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="text-slate-500 hover:text-slate-800 hover:underline">Privacy Policy</a>
            <span>•</span>
            <a href="/terms" className="text-slate-700 font-semibold hover:underline">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
