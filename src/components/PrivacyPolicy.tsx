import React from 'react';
import { Presentation, Shield, ArrowLeft, Lock, Database, Eye, FileText, CheckCircle2 } from 'lucide-react';

interface PolicyProps {
  onBack?: () => void;
}

export const PrivacyPolicy: React.FC<PolicyProps> = ({ onBack }) => {
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
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Privacy Compliant</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="space-y-3 border-b border-slate-200 pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Google API User Data Policy Compliance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500">
            Last updated: October 12, 2026 • Effective immediately
          </p>
        </div>

        {/* Section 1: Overview */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-4 shadow-2xs">
          <div className="flex items-center gap-3 text-slate-900 font-bold text-lg">
            <Eye className="w-5 h-5 text-amber-600" />
            <h2>1. Overview & Commitment</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Topic to Slides ("we", "our", or "the application") empowers users to convert topics and ideas into structured, beautifully formatted Google Slides presentations. We believe your presentation content and personal information belong entirely to you. This Privacy Policy details the exact types of data we collect, why we need them, and how your privacy is protected at all times.
          </p>
        </section>

        {/* Section 2: Google Workspace & Google Slides API */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-4 shadow-2xs">
          <div className="flex items-center gap-3 text-slate-900 font-bold text-lg">
            <Presentation className="w-5 h-5 text-indigo-600" />
            <h2>2. Google Workspace & Google Slides API Data Usage</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our application connects with Google Slides using official OAuth 2.0 authentication to enable you to export generated presentations directly into your Google Drive.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Requested Permissions (OAuth Scopes):
            </h3>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>https://www.googleapis.com/auth/presentations:</strong> This scope allows Topic to Slides to create new presentations and insert slide layouts, text elements, background colors, high-resolution photo fills, and speaker notes that you explicitly approve.
                </span>
              </li>
            </ul>
          </div>
          <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
            <p>
              <strong>Limited Use Disclosure:</strong> Topic to Slides adheres strictly to the{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 underline hover:text-indigo-800"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
              <li>We <strong>do not read or access</strong> any existing presentations or documents stored in your Google Drive.</li>
              <li>We <strong>never sell, transfer, or disclose</strong> your Google user data to third parties.</li>
              <li>We <strong>do not use</strong> Google Workspace user data to train generalized AI or machine learning models.</li>
              <li>OAuth access tokens are held ephemerally in memory during your active browser session and are never written to any database or long-term disk storage.</li>
            </ul>
          </div>
        </section>

        {/* Section 3: AI & Gemini API Processing */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-4 shadow-2xs">
          <div className="flex items-center gap-3 text-slate-900 font-bold text-lg">
            <Database className="w-5 h-5 text-purple-600" />
            <h2>3. AI Processing & Topic Outlines</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            When you enter a presentation topic and select an audience depth level, this text is transmitted securely to Google's Gemini API server-side to generate slide titles, bullet points, and speaker notes.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
            <li>Topic inputs are processed transiently in memory to return your outline.</li>
            <li>We do not store your requested topics on our servers once the response is delivered.</li>
            <li>No personally identifiable information (such as your email or Google Account ID) is transmitted to the Gemini API.</li>
          </ul>
        </section>

        {/* Section 4: Unsplash Photography Integration */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-4 shadow-2xs">
          <div className="flex items-center gap-3 text-slate-900 font-bold text-lg">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h2>4. Third-Party Photography Services (Unsplash)</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Topic to Slides searches the Unsplash API using short generic queries (e.g., "artificial intelligence", "mountain sunset") to retrieve high-resolution landscape photography.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
            <li>No user account details are shared with Unsplash.</li>
            <li>We display mandatory photographer attribution on each slide and preview card in compliance with Unsplash API Guidelines.</li>
          </ul>
        </section>

        {/* Section 5: Data Security & Retention */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-4 shadow-2xs">
          <div className="flex items-center gap-3 text-slate-900 font-bold text-lg">
            <Shield className="w-5 h-5 text-blue-600" />
            <h2>5. Data Security & Revocation</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            All network communication between your browser, our application servers, the Gemini API, and Google Slides is encrypted in transit using industry-standard HTTPS / TLS.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            You can revoke Topic to Slides' access to your Google Account at any time through your{' '}
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 underline hover:text-indigo-800"
            >
              Google Account Permissions Dashboard
            </a>
            . Clicking "Sign Out" in the application immediately clears all session tokens from your browser.
          </p>
        </section>

        {/* Section 6: Contact */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-4 shadow-2xs">
          <h2 className="text-slate-900 font-bold text-lg">6. Contact Information</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            If you have questions or concerns regarding this Privacy Policy or how your data is handled, please contact:
          </p>
          <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-700 space-y-1">
            <p className="font-semibold text-slate-900">Developer & Data Controller: Pranav Patel</p>
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
            <a href="/privacy" className="text-slate-700 font-semibold hover:underline">Privacy Policy</a>
            <span>•</span>
            <a href="/terms" className="text-slate-500 hover:text-slate-800 hover:underline">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
