import React from 'react';
import { Printer, X, Download, ShieldCheck, Scale, FileText, CheckCircle2 } from 'lucide-react';
import { CourtCase, CourtNetGatewayInfo } from '../types.ts';

interface PrintSummaryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: CourtCase[];
  query: { lastName: string; firstName: string; dob: string } | null;
  gatewayInfo: CourtNetGatewayInfo | null;
}

export const PrintSummaryReportModal: React.FC<PrintSummaryReportModalProps> = ({
  isOpen,
  onClose,
  records,
  query,
  gatewayInfo,
}) => {
  if (!isOpen || !query) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDateStr = new Date().toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  const activeCount = records.filter(r => r.caseStatus === 'Active' || r.caseStatus === 'Pending').length;
  const disposedCount = records.filter(r => r.caseStatus === 'Disposed' || r.caseStatus === 'Closed').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div 
        className="bg-black text-sky-200 border border-sky-500/70 rounded-2xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-[0_0_60px_rgba(56,189,248,0.25)] overflow-hidden print:border-none print:shadow-none print:max-h-none print:max-w-none print:rounded-none print:bg-white print:text-black"
        role="dialog"
        aria-labelledby="print-report-title"
      >
        {/* Top interactive toolbar - hidden in print */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-950 bg-neutral-950/90 print:hidden">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-black border border-sky-800 text-sky-400">
              <Printer className="w-5 h-5 text-sky-400" />
            </span>
            <div>
              <span className="text-[11px] font-mono text-sky-500 tracking-wider uppercase">
                Summarized Detailed Report Preview
              </span>
              <h2 id="print-report-title" className="text-base sm:text-lg font-bold text-sky-100">
                Kentucky CourtNet Official Docket Summary
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-black border-2 border-sky-400 text-sky-100 hover:bg-neutral-900 hover:border-sky-300 font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.3)] cursor-pointer"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-black border border-sky-900 text-sky-400 hover:text-sky-100 hover:border-sky-500 transition-colors cursor-pointer"
              aria-label="Close print preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Printable Report Body */}
        <div 
          id="courtnet-printable-report"
          className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-sky-200 print:overflow-visible print:p-0 print:text-black print:space-y-4"
        >
          {/* Formal Official Header */}
          <div className="border-b-2 border-sky-900 pb-5 print:border-black flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-sky-400 print:text-gray-600">
                <Scale className="w-4 h-4 print:text-black" />
                <span>Commonwealth of Kentucky · Court of Justice</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-sky-100 mt-1 uppercase print:text-black">
                Official CourtNet Docket Summary Report
              </h1>
              <p className="text-xs text-sky-400/80 mt-0.5 print:text-gray-700">
                Inquiry generated via CourtNet Gateway: <code className="font-mono text-sky-300 print:text-black">https://kcoj.kycourts.net/CourtNet/Search/Index</code>
              </p>
            </div>

            <div className="text-right text-xs space-y-1 print:text-right">
              <span className="block font-mono text-sky-300 print:text-black font-semibold">
                Report Date: {currentDateStr}
              </span>
              <span className="block text-[11px] text-sky-500 print:text-gray-600">
                Confidential Court Record Summary
              </span>
              <span className="inline-block px-2 py-0.5 rounded bg-black border border-sky-800 text-[10px] text-sky-300 print:border-gray-400 print:text-black print:bg-gray-100">
                Statewide Jurisdiction: 120 KY Counties
              </span>
            </div>
          </div>

          {/* Subject Party Information Box */}
          <div className="bg-black border border-sky-950 rounded-xl p-4 sm:p-5 print:border print:border-gray-400 print:bg-gray-50 print:p-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-3 print:text-black">
              1. Party Identity & Verification Details
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[11px] text-sky-500 uppercase font-medium block print:text-gray-600">
                  Full Legal Name
                </span>
                <span className="text-sm font-bold text-sky-100 print:text-black uppercase">
                  {query.lastName}, {query.firstName}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-sky-500 uppercase font-medium block print:text-gray-600">
                  Date of Birth (DOB)
                </span>
                <span className="text-sm font-bold font-mono text-sky-200 print:text-black">
                  {query.dob}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-sky-500 uppercase font-medium block print:text-gray-600">
                  Total Cases Found
                </span>
                <span className="text-sm font-bold text-sky-200 print:text-black font-mono">
                  {records.length} {records.length === 1 ? 'Record' : 'Records'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-sky-500 uppercase font-medium block print:text-gray-600">
                  Active vs. Disposed
                </span>
                <span className="text-sm font-bold text-sky-200 print:text-black">
                  {activeCount} Active · {disposedCount} Disposed
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Summary Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 print:text-black flex items-center justify-between">
              <span>2. Detailed Case Registry & Docket Proceedings</span>
              <span className="text-[11px] font-mono text-sky-500 print:text-gray-600">
                {records.length} Dockets Listed
              </span>
            </h3>

            {records.length === 0 ? (
              <div className="p-6 text-center bg-black border border-sky-950 rounded-xl print:border print:border-gray-300">
                <p className="text-xs text-sky-400 print:text-gray-700">No court records on file for this query combination.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {records.map((c, idx) => (
                  <div
                    key={c.id}
                    className="p-4 bg-black border border-sky-950 rounded-xl space-y-3 print:border print:border-gray-400 print:bg-white print:p-3 print:break-inside-avoid"
                  >
                    {/* Header line of case */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-sky-950 print:border-gray-300">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-black border border-sky-800 text-sky-300 print:border-gray-400 print:text-black print:bg-gray-100">
                          #{idx + 1}
                        </span>
                        <span className="text-base font-bold font-mono text-sky-100 print:text-black">
                          Case {c.caseNumber}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-black border border-sky-900 text-sky-400 print:border-gray-300 print:text-gray-700">
                          {c.caseType}
                        </span>
                      </div>

                      <span className="text-xs px-2.5 py-0.5 rounded font-bold border border-sky-600 bg-black text-sky-200 print:border-gray-400 print:text-black print:bg-gray-100">
                        Status: {c.caseStatus}
                      </span>
                    </div>

                    {/* Case Style Caption */}
                    <div>
                      <p className="text-sm font-bold text-sky-100 print:text-black">
                        {c.caseStyle}
                      </p>
                      <p className="text-xs text-sky-400/80 print:text-gray-600 mt-0.5">
                        {c.court} · {c.division} · {c.county} County
                      </p>
                    </div>

                    {/* Parameters Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 bg-black border border-sky-950 rounded print:border print:border-gray-200">
                        <span className="text-[10px] text-sky-500 uppercase block print:text-gray-600">Filing Date</span>
                        <span className="font-mono text-sky-200 font-semibold print:text-black">{c.filingDate}</span>
                      </div>
                      <div className="p-2 bg-black border border-sky-950 rounded print:border print:border-gray-200">
                        <span className="text-[10px] text-sky-500 uppercase block print:text-gray-600">Presiding Judge</span>
                        <span className="text-sky-200 truncate block print:text-black">{c.judge}</span>
                      </div>
                      <div className="p-2 bg-black border border-sky-950 rounded print:border print:border-gray-200">
                        <span className="text-[10px] text-sky-500 uppercase block print:text-gray-600">Courtroom</span>
                        <span className="text-sky-200 print:text-black">{c.courtroom}</span>
                      </div>
                      <div className="p-2 bg-black border border-sky-950 rounded print:border print:border-gray-200">
                        <span className="text-[10px] text-sky-500 uppercase block print:text-gray-600">
                          {c.nextHearingDate ? 'Next Hearing' : 'Citation #'}
                        </span>
                        <span className="text-sky-200 truncate block font-mono print:text-black">
                          {c.nextHearingDate || c.citationNumber || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Charges and dispositions */}
                    {c.charges.length > 0 && (
                      <div className="pt-2 border-t border-sky-950 print:border-gray-200 text-xs space-y-1">
                        <span className="text-[11px] font-semibold text-sky-400 print:text-black uppercase">
                          Charges & Dispositions:
                        </span>
                        <div className="space-y-1">
                          {c.charges.map(chg => (
                            <div key={chg.count} className="flex flex-wrap items-center justify-between text-xs text-sky-300 print:text-black">
                              <span>
                                <strong className="text-sky-400 font-mono print:text-black">Count {chg.count}:</strong> {chg.description} ({chg.severity})
                              </span>
                              <span className="text-[11px] font-mono text-sky-500 print:text-gray-600">
                                {chg.statute} · {chg.disposition || 'Pending'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Docket history events preview */}
                    {c.docketEntries.length > 0 && (
                      <div className="pt-2 border-t border-sky-950 print:border-gray-200 text-xs">
                        <span className="text-[11px] font-semibold text-sky-400 print:text-black uppercase block mb-1">
                          Key Docket Proceedings:
                        </span>
                        <div className="space-y-1 font-mono text-[11px] text-sky-400/90 print:text-gray-800">
                          {c.docketEntries.map((d, dIdx) => (
                            <div key={dIdx} className="flex items-start gap-2">
                              <span className="text-sky-500 print:text-gray-600 shrink-0">{d.date}:</span>
                              <span>{d.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Legal Certification and Disclaimer Footer */}
          <div className="border-t-2 border-sky-900 pt-4 print:border-black text-[11px] text-sky-500 print:text-gray-600 space-y-1.5">
            <p className="leading-relaxed">
              <strong>Official Disclaimer:</strong> This electronic summary report reflects public docket records retrieved via the Kentucky Court of Justice CourtNet inquiry engine. 
              CourtNet is intended as an informational tool and does not constitute an official certified criminal history or background clearance. 
              Certified records must be requested directly from the Kentucky Administrative Office of the Courts (AOC).
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[10px] text-sky-600 print:text-gray-500">
              <span>Kentucky Administrative Office of the Courts · Frankfort, KY</span>
              <span>Software: ProTek Software Solutions LLC</span>
              <span>Generated: {currentDateStr}</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Controls - Hidden when printed */}
        <div className="p-4 border-t border-sky-950 bg-neutral-950/80 flex items-center justify-between print:hidden">
          <span className="text-xs text-sky-500">
            Tip: Select "Save as PDF" in your print dialog to download this report.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-black border-2 border-sky-400 text-sky-100 hover:bg-neutral-900 rounded-xl font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_12px_rgba(56,189,248,0.3)]"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span>Print Report</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-black border border-sky-800 text-sky-400 hover:text-sky-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
