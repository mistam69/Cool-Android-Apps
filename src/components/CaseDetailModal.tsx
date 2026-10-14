import React from 'react';
import { X, ExternalLink, Copy, Check, FileText, Calendar, Scale, MapPin, ShieldAlert, Award } from 'lucide-react';
import { CourtCase } from '../types.ts';

interface CaseDetailModalProps {
  courtCase: CourtCase | null;
  onClose: () => void;
  searchedDob: string;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  courtCase,
  onClose,
  searchedDob,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!courtCase) return null;

  const handleCopyCase = () => {
    navigator.clipboard.writeText(courtCase.caseNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-black border border-sky-500/70 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(56,189,248,0.25)] overflow-hidden"
        role="dialog"
        aria-labelledby="case-modal-title"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-950 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-black border border-sky-900 text-sky-400">
              <Scale className="w-5 h-5 text-sky-400" />
            </span>
            <div>
              <span className="text-[11px] font-mono text-sky-500 tracking-wider uppercase">
                Kentucky Court of Justice · Official Docket Record
              </span>
              <h3 id="case-modal-title" className="text-lg font-bold text-sky-200 font-mono-numbers">
                Case {courtCase.caseNumber}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCase}
              className="px-3 py-1.5 rounded-lg bg-black border border-sky-900 text-sky-300 hover:text-sky-100 hover:border-sky-500 transition-colors text-xs font-mono flex items-center gap-1.5"
              title="Copy Case Number"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-sky-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy #'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-black border border-sky-900 text-sky-400 hover:text-sky-100 hover:border-sky-500 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-sky-300">
          {/* Header Banner */}
          <div className="p-4 bg-black border border-sky-950 rounded-xl space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
                Case Style / Caption
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-black border border-sky-700 text-sky-300 font-medium">
                Status: {courtCase.caseStatus}
              </span>
            </div>
            <p className="text-base font-bold text-sky-100 tracking-wide">
              {courtCase.caseStyle}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-sky-400/80 pt-1">
              <span>Jurisdiction: <strong className="text-sky-200">{courtCase.court}</strong></span>
              <span>·</span>
              <span>Division: <strong className="text-sky-200">{courtCase.division}</strong></span>
              <span>·</span>
              <span>County: <strong className="text-sky-200">{courtCase.county}</strong></span>
            </div>
          </div>

          {/* Key Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-black border border-sky-950 rounded-xl space-y-1">
              <span className="text-sky-500 font-medium uppercase text-[10px]">Filing Date</span>
              <p className="font-mono text-sky-200 font-semibold">{courtCase.filingDate}</p>
            </div>
            <div className="p-3 bg-black border border-sky-950 rounded-xl space-y-1">
              <span className="text-sky-500 font-medium uppercase text-[10px]">Case Type</span>
              <p className="font-medium text-sky-200">{courtCase.caseType}</p>
            </div>
            <div className="p-3 bg-black border border-sky-950 rounded-xl space-y-1">
              <span className="text-sky-500 font-medium uppercase text-[10px]">Presiding Judge</span>
              <p className="font-medium text-sky-200 truncate">{courtCase.judge}</p>
            </div>
            <div className="p-3 bg-black border border-sky-950 rounded-xl space-y-1">
              <span className="text-sky-500 font-medium uppercase text-[10px]">Courtroom</span>
              <p className="font-medium text-sky-200">{courtCase.courtroom}</p>
            </div>
          </div>

          {/* Party and Citation Details */}
          <div className="p-4 bg-black border border-sky-950 rounded-xl space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-sky-400">
              Party & Law Enforcement Data
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-sky-500 text-[11px]">Primary Party DOB:</span>
                <p className="font-mono text-sky-200 font-medium">{searchedDob}</p>
              </div>
              {courtCase.citationNumber && (
                <div>
                  <span className="text-sky-500 text-[11px]">Uniform Citation #:</span>
                  <p className="font-mono text-sky-200 font-medium">{courtCase.citationNumber}</p>
                </div>
              )}
              {courtCase.arrestingAgency && (
                <div className="sm:col-span-2">
                  <span className="text-sky-500 text-[11px]">Arresting / Submitting Agency:</span>
                  <p className="text-sky-200 font-medium">{courtCase.arrestingAgency}</p>
                </div>
              )}
              {courtCase.bondAmount && (
                <div>
                  <span className="text-sky-500 text-[11px]">Bond Scheduled:</span>
                  <p className="text-sky-200 font-medium">{courtCase.bondAmount}</p>
                </div>
              )}
              {courtCase.bondStatus && (
                <div>
                  <span className="text-sky-500 text-[11px]">Bond Status:</span>
                  <p className="text-sky-200 font-medium">{courtCase.bondStatus}</p>
                </div>
              )}
            </div>
          </div>

          {/* Charges and Counts */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-sky-400">
              Charges & Statutory Offenses ({courtCase.charges.length})
            </h4>
            <div className="space-y-2">
              {courtCase.charges.map((chg) => (
                <div
                  key={chg.count}
                  className="p-3.5 bg-black border border-sky-950 rounded-xl space-y-2 hover:border-sky-900 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-sky-200">
                      Count {chg.count} · {chg.statute}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-black border border-sky-800 text-sky-300">
                      {chg.severity}
                    </span>
                  </div>
                  <p className="text-xs text-sky-100 font-medium">
                    {chg.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs pt-1 border-t border-sky-950/60">
                    {chg.plea && (
                      <span className="text-sky-400">
                        Plea: <strong className="text-sky-200">{chg.plea}</strong>
                      </span>
                    )}
                    {chg.disposition && (
                      <span className="text-sky-400">
                        Disposition: <strong className="text-sky-200">{chg.disposition}</strong>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chronological Docket History */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-sky-400">
              Docket Entries & Case History
            </h4>
            <div className="border border-sky-950 rounded-xl divide-y divide-sky-950 overflow-hidden">
              {courtCase.docketEntries.map((entry, idx) => (
                <div key={idx} className="p-3 bg-black hover:bg-neutral-950 transition-colors text-xs flex flex-col sm:flex-row sm:items-start gap-2">
                  <span className="font-mono text-sky-400 sm:w-28 shrink-0">{entry.date}</span>
                  <div className="flex-1">
                    <span className="inline-block px-1.5 py-0.5 mb-1 rounded bg-black border border-sky-900 text-[10px] text-sky-400 font-medium">
                      {entry.entryType}
                    </span>
                    <p className="text-sky-200 font-mono-numbers">{entry.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-sky-950 bg-neutral-950/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <a
              href="https://kcoj.kycourts.net/CourtNet/Search/Index"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-black border border-sky-800 text-sky-300 hover:text-sky-100 hover:border-sky-500 rounded-xl inline-flex items-center gap-1.5 transition-colors font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              <span>KYeCourts Portal</span>
            </a>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 bg-black border border-sky-900 text-sky-400 hover:text-sky-200 hover:border-sky-700 rounded-xl inline-flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Print Docket</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-black border border-sky-600 text-sky-200 hover:bg-neutral-950 hover:border-sky-400 rounded-xl font-bold transition-colors"
          >
            Close Record
          </button>
        </div>
      </div>
    </div>
  );
};
