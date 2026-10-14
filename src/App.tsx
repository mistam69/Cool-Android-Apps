/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Scale, 
  ExternalLink, 
  Shield, 
  Info, 
  FileText, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';
import { SearchForm } from './components/SearchForm.tsx';
import { ResultsList } from './components/ResultsList.tsx';
import { CourtCase, CourtNetGatewayInfo, SearchResponse } from './types.ts';

export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [records, setRecords] = useState<CourtCase[]>([]);
  const [gatewayInfo, setGatewayInfo] = useState<CourtNetGatewayInfo | null>(null);
  const [activeQuery, setActiveQuery] = useState<{ lastName: string; firstName: string; dob: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoModalOpen, setInfoModalOpen] = useState<boolean>(false);

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
      setRecords(data.records || []);
      setGatewayInfo(data.courtNetGateway || null);
      setActiveQuery(data.query);

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

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setInfoModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-black border border-sky-800 text-sky-300 hover:text-sky-100 hover:border-sky-500 hover:bg-neutral-950 transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
            >
              <Info className="w-3.5 h-3.5 text-sky-400" />
              <span>Portal Info</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero Context strip */}
        <section className="space-y-2">
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
        </section>

        {/* Search Form Section */}
        <section id="search-section">
          <SearchForm
            onSearch={handleSearch}
            isLoading={isLoading}
            initialValues={activeQuery || undefined}
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
    </div>
  );
}
