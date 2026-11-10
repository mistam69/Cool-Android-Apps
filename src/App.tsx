/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  ExternalLink, 
  Shield, 
  Info, 
  FileText, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle,
  History,
  Volume2,
  X
} from 'lucide-react';
import { SearchForm } from './components/SearchForm.tsx';
import { ResultsList } from './components/ResultsList.tsx';
import { SearchHistorySidebar } from './components/SearchHistorySidebar.tsx';
import { AudioGuideModal } from './components/AudioGuideModal.tsx';
import { CourtCase, CourtNetGatewayInfo, SearchResponse, SearchHistoryItem } from './types.ts';

const LOCAL_STORAGE_HISTORY_KEY = 'courtnet_search_history_v1';

export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [records, setRecords] = useState<CourtCase[]>([]);
  const [gatewayInfo, setGatewayInfo] = useState<CourtNetGatewayInfo | null>(null);
  const [activeQuery, setActiveQuery] = useState<{ lastName: string; firstName: string; dob: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoModalOpen, setInfoModalOpen] = useState<boolean>(false);
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [audioGuideOpen, setAudioGuideOpen] = useState<boolean>(false);
  const [aboutModalOpen, setAboutModalOpen] = useState<boolean>(false);

  // Initialize search history from Local Storage
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse search history from localStorage:', e);
    }
    return [];
  });

  // Save to Local Storage whenever searchHistory changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(searchHistory));
    } catch (e) {
      console.warn('Failed to persist search history to localStorage:', e);
    }
  }, [searchHistory]);

  const addSearchToHistory = (query: { lastName: string; firstName: string; dob: string }, count: number) => {
    const cleanLast = query.lastName.trim();
    const cleanFirst = query.firstName.trim();
    const cleanDob = query.dob.trim();

    setSearchHistory((prev) => {
      // Filter out duplicate identical search
      const filtered = prev.filter(
        (item) =>
          !(
            item.lastName.toUpperCase() === cleanLast.toUpperCase() &&
            item.firstName.toUpperCase() === cleanFirst.toUpperCase() &&
            item.dob === cleanDob
          )
      );

      const newItem: SearchHistoryItem = {
        id: `query_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        lastName: cleanLast,
        firstName: cleanFirst,
        dob: cleanDob,
        timestamp: Date.now(),
        resultsCount: count,
      };

      // Keep latest 25 searches
      return [newItem, ...filtered].slice(0, 25);
    });
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY);
    } catch (e) {
      console.warn('Failed to clear search history from localStorage:', e);
    }
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSelectHistoryItem = (item: SearchHistoryItem) => {
    // Fill values and immediately re-run the search
    handleSearch({
      lastName: item.lastName,
      firstName: item.firstName,
      dob: item.dob,
    });
    setHistoryOpen(false);
  };

  const handleSearch = async (params: { 
    lastName: string; 
    firstName: string; 
    dob: string; 
    sessionCookie?: string; 
  }) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/courtnet/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const data: SearchResponse = await response.json();
      const caseResults = data.records || [];
      setRecords(caseResults);
      setGatewayInfo(data.courtNetGateway || null);
      setActiveQuery(data.query);

      // Add successfully executed query to localStorage history
      addSearchToHistory(data.query, caseResults.length);

      // Smooth scroll to results on mobile/desktop
      const resultsElement = document.getElementById('search-results-section');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err: unknown) {
      console.error('CourtNet search failure:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to connect to CourtNet backend service.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-sky-300 flex flex-col selection:bg-sky-500/30 selection:text-sky-100">
      {/* 3-Zone Top Navigation Contract */}
      <header className="border-b border-sky-950 bg-black/90 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark (Single text element) */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="p-1.5 rounded-lg bg-black border border-sky-800 text-sky-400">
              <Scale className="w-5 h-5" />
            </span>
            <span className="text-base sm:text-lg font-bold tracking-tight text-sky-100 whitespace-nowrap">
              Kentucky CourtNet Search
            </span>
          </div>

          {/* Zone 2: Single-line navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-sky-400">
            <a 
              href="#search-section" 
              className="hover:text-sky-200 transition-colors whitespace-nowrap shrink-0"
            >
              Docket Lookup
            </a>
            <button
              type="button"
              onClick={() => setAboutModalOpen(true)}
              className="hover:text-amber-300 font-semibold transition-colors whitespace-nowrap shrink-0 text-amber-400"
            >
              About
            </button>
            <a 
              href="#about-section" 
              onClick={(e) => { e.preventDefault(); setInfoModalOpen(true); }}
              className="hover:text-sky-200 transition-colors whitespace-nowrap shrink-0"
            >
              KCOJ CourtNet Guide
            </a>
            <a 
              href="https://kcoj.kycourts.net/kyecourts/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-sky-200 transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1"
            >
              <span>KYeCourts Portal</span>
              <ExternalLink className="w-3 h-3 text-sky-500" />
            </a>
            <a 
              href="https://kycourts.gov" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-sky-200 transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1"
            >
              <span>Kentucky Court of Justice</span>
              <ExternalLink className="w-3 h-3 text-sky-500" />
            </a>
          </nav>

          {/* Zone 3: Primary Actions (About, Spoken Instructions, Search History & Portal Info) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setAboutModalOpen(true)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-yellow-400 text-black hover:bg-yellow-300 transition-all whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 shadow-[0_0_12px_rgba(250,204,21,0.4)]"
              aria-label="Open About ProTek Software Solutions"
            >
              <span>About</span>
            </button>

            <button
              type="button"
              onClick={() => setAudioGuideOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-black border border-sky-400 text-sky-200 hover:text-sky-100 hover:border-sky-300 hover:bg-neutral-950 shadow-[0_0_12px_rgba(56,189,248,0.25)] transition-all whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
              aria-label="Open spoken instructions and audio guide"
            >
              <Volume2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Spoken Guide</span>
            </button>

            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-black border border-sky-800 text-sky-300 hover:text-sky-100 hover:border-sky-500 hover:bg-neutral-950 transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 relative"
              aria-label="Open search history"
            >
              <History className="w-3.5 h-3.5 text-sky-400" />
              <span>Search History</span>
              {searchHistory.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[10px] rounded-full bg-sky-950 border border-sky-600 text-sky-200 font-mono">
                  {searchHistory.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setInfoModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-black border border-sky-900 text-sky-400 hover:text-sky-200 hover:border-sky-700 hover:bg-neutral-950 transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
            >
              <Info className="w-3.5 h-3.5 text-sky-400" />
              <span>Info</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero Context strip with Spoken Guide button */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-sky-500 font-semibold uppercase tracking-wider">
                <span>Official Court Records Inquiry</span>
                <span>·</span>
                <span>Kentucky Court of Justice System</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-sky-100 max-w-3xl">
                Judicial Records & Docket Search
              </h1>
              <p className="text-xs sm:text-sm text-sky-400/90 max-w-2xl leading-relaxed">
                Query civil, criminal, and traffic case proceedings registered within Kentucky Court of Justice jurisdictions. 
                Fill in the required party identity text boxes to query the CourtNet backend.
              </p>
            </div>

            {/* Prominent Audio Guide Action Button */}
            <div className="shrink-0">
              <button
                type="button"
                onClick={() => setAudioGuideOpen(true)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-black border-2 border-sky-400 text-sky-200 hover:border-sky-300 hover:text-sky-100 hover:bg-neutral-950 shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all flex items-center justify-center gap-3 cursor-pointer group"
              >
                <div className="p-2 rounded-lg bg-black border border-sky-500/80 group-hover:border-sky-300 text-sky-400">
                  <Volume2 className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-bold uppercase tracking-wider text-sky-100">
                    Spoken App Guide
                  </span>
                  <span className="block text-[11px] text-sky-400 font-medium">
                    Speaks out what each element is & how to use it
                  </span>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Search Form Section */}
        <section id="search-section">
          <SearchForm
            onSearch={handleSearch}
            isLoading={isLoading}
            initialValues={activeQuery || undefined}
            onOpenHistory={() => setHistoryOpen(true)}
            historyCount={searchHistory.length}
          />
        </section>

        {/* Error notification if backend error occurred */}
        {errorMessage && (
          <div className="p-4 bg-black border border-sky-700 rounded-xl text-xs text-sky-200 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold text-sky-300">Backend Communication Notice:</span>{' '}
              {errorMessage}
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-sky-400 hover:text-sky-200"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Results Section */}
        <section id="search-results-section">
          <ResultsList
            records={records}
            gatewayInfo={gatewayInfo}
            query={activeQuery}
          />
        </section>

        {/* Information & Legal Notice Footer */}
        <section className="p-6 bg-black border border-sky-950 rounded-2xl text-xs space-y-3">
          <div className="flex items-center gap-2 text-sky-300 font-semibold uppercase tracking-wider text-[11px]">
            <Shield className="w-4 h-4 text-sky-400" />
            <span>Kentucky CourtNet Legal Data Notice</span>
          </div>
          <p className="text-sky-400/80 leading-relaxed">
            This inquiry system submits party search requests directly to the Kentucky Court of Justice CourtNet backend at{' '}
            <code className="text-sky-300 font-mono">https://kcoj.kycourts.net/CourtNet/Search/Index</code>.
            Public case information reflects filings recorded in Kentucky District and Circuit Courts across all 120 counties.
            Certified legal transcripts or official background checks must be verified directly through the Kentucky Administrative Office of the Courts (AOC).
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-sky-500">
            <span>Kentucky Administrative Office of the Courts</span>
            <span>·</span>
            <span>Frankfort, KY 40601</span>
            <span>·</span>
            <span>CourtNet 2.0 Web Gateway</span>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-sky-950 bg-black py-6 mt-12 text-xs text-sky-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sky-400 font-bold">CourtNet Search</span>
            <span>·</span>
            <span>Kentucky Court of Justice Portal Search Client</span>
          </div>
          <div className="flex items-center gap-4 text-sky-500">
            <a
              href="https://kcoj.kycourts.net/CourtNet/Search/Index"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sky-300 transition-colors inline-flex items-center gap-1"
            >
              <span>CourtNet Search Backend</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>·</span>
            <a
              href="https://kcoj.kycourts.net/kyecourts/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sky-300 transition-colors"
            >
              KYeCourts Login
            </a>
          </div>
        </div>
      </footer>

      {/* Info Modal */}
      {infoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-black border border-sky-500/70 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-[0_0_40px_rgba(56,189,248,0.2)] text-xs text-sky-300">
            <div className="flex items-center justify-between pb-3 border-b border-sky-950">
              <h3 className="text-base font-bold text-sky-100 flex items-center gap-2">
                <Info className="w-4 h-4 text-sky-400" />
                About Kentucky CourtNet Search
              </h3>
              <button
                type="button"
                onClick={() => setInfoModalOpen(false)}
                className="p-1 rounded bg-black border border-sky-900 text-sky-400 hover:text-sky-100 hover:border-sky-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 leading-relaxed">
              <p>
                <strong>Kentucky CourtNet</strong> is the unified court case information repository operated by the Kentucky Court of Justice (KCOJ) and the Administrative Office of the Courts.
              </p>
              <div className="p-3 bg-black border border-sky-950 rounded-xl space-y-1.5">
                <span className="font-semibold text-sky-200 block">How Search Queries Work:</span>
                <ul className="list-disc list-inside space-y-1 text-sky-400">
                  <li><strong>Last Name:</strong> Mandatory surname of the defendant or litigant.</li>
                  <li><strong>First Name:</strong> Given legal name.</li>
                  <li><strong>Date of Birth:</strong> Verified birthdate (MM/DD/YYYY) with interactive calendar picker.</li>
                  <li><strong>Submit Activation:</strong> The submit button strictly activates once all 3 fields satisfy validation requirements.</li>
                  <li><strong>Backend Routing:</strong> Requests are forwarded to <code className="text-sky-300">https://kcoj.kycourts.net/CourtNet/Search/Index</code> with live status metrics.</li>
                </ul>
              </div>
              <p className="text-sky-500 text-[11px]">
                Authorized Kentucky bar members and registered KYeCourts subscribers can also pass their ASP.NET session token in the advanced gateway settings.
              </p>
            </div>

            <div className="pt-3 border-t border-sky-950 flex justify-end">
              <button
                type="button"
                onClick={() => setInfoModalOpen(false)}
                className="px-4 py-2 bg-black border border-sky-600 text-sky-200 hover:border-sky-400 rounded-xl font-bold transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search History Sidebar Drawer */}
      <SearchHistorySidebar
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={searchHistory}
        onSelectQuery={handleSelectHistoryItem}
        onClearHistory={handleClearHistory}
        onDeleteItem={handleDeleteHistoryItem}
        activeQuery={activeQuery}
      />

      {/* Spoken Element-by-Element Audio Guide Modal */}
      <AudioGuideModal
        isOpen={audioGuideOpen}
        onClose={() => setAudioGuideOpen(false)}
      />

      {/* About Modal: Yellow with black font */}
      {aboutModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-labelledby="about-modal-title"
        >
          <div className="bg-yellow-400 text-black border-4 border-yellow-500 rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-[0_0_60px_rgba(250,204,21,0.6)] relative animate-in fade-in zoom-in-95 duration-150">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setAboutModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-black text-yellow-400 hover:bg-neutral-900 transition-colors cursor-pointer"
              aria-label="Close about dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="pb-4 border-b-2 border-black/20 pr-8">
              <span className="text-xs font-black tracking-widest uppercase text-black/75">
                ProTek Software Solutions LLC
              </span>
              <h3 id="about-modal-title" className="text-xl sm:text-2xl font-black text-black mt-0.5">
                About This Application
              </h3>
            </div>

            {/* Content: Yellow popup with black font */}
            <div className="py-6 space-y-4">
              <p className="text-base sm:text-lg font-bold text-black leading-relaxed">
                "This app was built with Love and Care,2026, by Craig L. Milner, for ProTek Software Solutions LLC. Email me @ mr.craigmilner@gmail.com."
              </p>

              <div className="pt-2 flex items-center gap-2">
                <a
                  href="mailto:mr.craigmilner@gmail.com"
                  className="px-4 py-2 rounded-xl bg-black text-yellow-400 hover:bg-neutral-900 font-bold text-xs inline-flex items-center gap-2 transition-colors shadow-md"
                >
                  <span>Send Email</span>
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t-2 border-black/20 flex items-center justify-between">
              <span className="text-xs font-semibold text-black/70">
                © 2026 ProTek Software Solutions LLC
              </span>
              <button
                type="button"
                onClick={() => setAboutModalOpen(false)}
                className="px-5 py-2 bg-black text-yellow-400 hover:bg-neutral-900 rounded-xl font-black text-xs uppercase tracking-wider transition-colors shadow-md cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
