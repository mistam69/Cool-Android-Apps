import React, { useState, useMemo } from 'react';
import { 
  Scale, 
  ExternalLink, 
  FileSearch, 
  Calendar, 
  ChevronRight, 
  Copy, 
  Check, 
  Server, 
  Clock, 
  ShieldCheck, 
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { CourtCase, CourtNetGatewayInfo } from '../types.ts';
import { CaseDetailModal } from './CaseDetailModal.tsx';

interface ResultsListProps {
  records: CourtCase[];
  gatewayInfo: CourtNetGatewayInfo | null;
  query: { lastName: string; firstName: string; dob: string } | null;
  onNewSearch?: () => void;
}

export const ResultsList: React.FC<ResultsListProps> = ({
  records,
  gatewayInfo,
  query,
}) => {
  const [selectedCase, setSelectedCase] = useState<CourtCase | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'case_num'>('date_desc');
  const [showGatewayDetails, setShowGatewayDetails] = useState<boolean>(false);

  const handleCopy = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered & sorted records
  const filteredRecords = useMemo(() => {
    let result = [...records];

    if (filterType === 'CRIMINAL') {
      result = result.filter((r) => r.caseType === 'Criminal');
    } else if (filterType === 'TRAFFIC') {
      result = result.filter((r) => r.caseType === 'Traffic');
    } else if (filterType === 'CIVIL') {
      result = result.filter((r) => r.caseType === 'Civil');
    } else if (filterType === 'ACTIVE') {
      result = result.filter((r) => r.caseStatus === 'Active' || r.caseStatus === 'Pending');
    } else if (filterType === 'DISPOSED') {
      result = result.filter((r) => r.caseStatus === 'Disposed' || r.caseStatus === 'Closed');
    }

    if (sortBy === 'date_desc') {
      result.sort((a, b) => b.caseNumber.localeCompare(a.caseNumber));
    } else if (sortBy === 'date_asc') {
      result.sort((a, b) => a.caseNumber.localeCompare(b.caseNumber));
    } else if (sortBy === 'case_num') {
      result.sort((a, b) => a.caseNumber.localeCompare(b.caseNumber));
    }

    return result;
  }, [records, filterType, sortBy]);

  if (!query) {
    return (
      <div className="bg-black border border-sky-950 rounded-2xl p-10 text-center shadow-[0_0_30px_rgba(0,0,0,0.8)]">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-black border border-sky-900 flex items-center justify-center mb-4 text-sky-400">
          <FileSearch className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-sky-200">No Query Submitted Yet</h3>
        <p className="text-xs text-sky-400/80 max-w-md mx-auto mt-1">
          Insert the Last Name, First Name, and Date of Birth in the fields above.
          The submit button will enable as soon as all three fields are completed.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-black border border-sky-950 rounded-2xl p-5 sm:p-7 shadow-[0_0_30px_rgba(0,0,0,0.8)] space-y-5">
      {/* Search Overview Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-sky-950">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider">
            <Scale className="w-4 h-4 text-sky-400" />
            <span>Search Results · Kentucky CourtNet</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-sky-100 mt-1 uppercase font-mono-numbers">
            {query.lastName}, {query.firstName}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-sky-400/80 mt-1">
            <span>DOB: <strong className="text-sky-200 font-mono">{query.dob}</strong></span>
            <span>·</span>
            <span>Found: <strong className="text-sky-200">{records.length} {records.length === 1 ? 'Case' : 'Cases'}</strong></span>
          </div>
        </div>

        {/* Backend Gateway Live Status Box */}
        {gatewayInfo && (
          <div className="bg-black border border-sky-900/80 rounded-xl p-3 text-xs space-y-1.5 self-start lg:self-auto max-w-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-sky-300 font-medium text-[11px]">
                <Server className="w-3.5 h-3.5 text-sky-400" />
                <span>Backend Gateway:</span>
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black border border-sky-800 text-sky-300">
                HTTP {gatewayInfo.httpStatusCode || 200}
              </span>
            </div>
            <div className="text-[11px] text-sky-400/90 font-mono truncate">
              {gatewayInfo.targetUrl}
            </div>
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-sky-950 text-[10px] text-sky-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Latency: {gatewayInfo.responseTimeMs}ms</span>
              </span>
              <button
                type="button"
                onClick={() => setShowGatewayDetails(!showGatewayDetails)}
                className="text-sky-400 hover:text-sky-200 underline"
              >
                {showGatewayDetails ? 'Less' : 'More info'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Gateway Diagnostics */}
      {showGatewayDetails && gatewayInfo && (
        <div className="p-3.5 bg-black border border-sky-900 rounded-xl text-xs space-y-2 text-sky-300 font-mono">
          <div className="flex items-center justify-between text-sky-400 font-sans font-semibold">
            <span>Kentucky Court of Justice (KCOJ) Connection Details</span>
            <span className="text-[11px] text-sky-500">{gatewayInfo.queriedAt}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div>Endpoint: <span className="text-sky-100">{gatewayInfo.targetUrl}</span></div>
            <div>Gateway Mode: <span className="text-sky-100">{gatewayInfo.gatewayStatus}</span></div>
            <div>Auth Requirement: <span className="text-sky-100">{gatewayInfo.requiresAuthentication ? 'Subscriber / KYeCourts Session Required for Protected PII' : 'Public Access'}</span></div>
            <div>Portal URL: <a href={gatewayInfo.portalUrl} target="_blank" rel="noopener noreferrer" className="text-sky-400 underline hover:text-sky-200">{gatewayInfo.portalUrl}</a></div>
          </div>
        </div>
      )}

      {/* Filter Tabs and Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-sky-500 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-sky-500" />
            <span>Filter:</span>
          </span>
          {[
            { id: 'ALL', label: `All (${records.length})` },
            { id: 'CRIMINAL', label: `Criminal (${records.filter(r => r.caseType === 'Criminal').length})` },
            { id: 'TRAFFIC', label: `Traffic (${records.filter(r => r.caseType === 'Traffic').length})` },
            { id: 'CIVIL', label: `Civil (${records.filter(r => r.caseType === 'Civil').length})` },
            { id: 'ACTIVE', label: `Active (${records.filter(r => r.caseStatus === 'Active' || r.caseStatus === 'Pending').length})` },
            { id: 'DISPOSED', label: `Disposed (${records.filter(r => r.caseStatus === 'Disposed' || r.caseStatus === 'Closed').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-black border border-sky-400 text-sky-200 font-semibold shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                  : 'bg-black border border-sky-950 text-sky-400 hover:border-sky-800 hover:text-sky-200 hover:bg-neutral-950'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-sky-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-black border border-sky-950 text-sky-300 text-xs rounded-lg px-2.5 py-1 focus:border-sky-500 focus:outline-none hover:border-sky-800"
          >
            <option value="date_desc" className="bg-black text-sky-300">Newest Filing First</option>
            <option value="date_asc" className="bg-black text-sky-300">Oldest Filing First</option>
            <option value="case_num" className="bg-black text-sky-300">Case Number</option>
          </select>
        </div>
      </div>

      {/* THE SCROLLABLE LIST OF RESULTS */}
      <div 
        className="max-h-[560px] overflow-y-auto space-y-4 pr-1.5 focus:outline-none"
        tabIndex={0}
        aria-label="Scrollable list of court cases"
      >
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center bg-black border border-sky-950 rounded-xl space-y-2">
            <p className="text-sm text-sky-300 font-semibold">No records match the active filter ({filterType})</p>
            <button
              type="button"
              onClick={() => setFilterType('ALL')}
              className="px-3 py-1.5 bg-black border border-sky-800 text-sky-300 hover:text-sky-100 hover:border-sky-500 rounded-lg text-xs"
            >
              Reset filter to All
            </button>
          </div>
        ) : (
          filteredRecords.map((item) => {
            const isDisposed = item.caseStatus === 'Disposed' || item.caseStatus === 'Closed';
            const isActive = item.caseStatus === 'Active' || item.caseStatus === 'Pending';

            return (
              <div
                key={item.id}
                onClick={() => setSelectedCase(item)}
                className="group relative bg-black border border-sky-950 hover:border-sky-500/80 rounded-xl p-5 transition-all duration-150 cursor-pointer shadow-sm hover:shadow-[0_0_20px_rgba(56,189,248,0.15)]"
              >
                {/* Top line of card: Case number + status + actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-sky-950/80">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-bold text-sky-200 tracking-wide font-mono-numbers">
                      {item.caseNumber}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleCopy(item.id, item.caseNumber, e)}
                      title="Copy case number"
                      className="p-1 rounded bg-black border border-sky-950 text-sky-500 hover:text-sky-200 hover:border-sky-700 transition-colors"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-sky-300" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <span className="text-xs px-2 py-0.5 rounded bg-black border border-sky-900 text-sky-400">
                      {item.caseType}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-md font-semibold tracking-wide border ${
                        isActive
                          ? 'border-sky-400 bg-black text-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                          : 'border-sky-950 bg-black text-sky-500'
                      }`}
                    >
                      {item.caseStatus}
                    </span>
                  </div>
                </div>

                {/* Case Caption / Style */}
                <div className="mt-3">
                  <p className="text-sm font-semibold text-sky-100 group-hover:text-sky-300 transition-colors">
                    {item.caseStyle}
                  </p>
                  <p className="text-xs text-sky-400/80 mt-1">
                    {item.court} · {item.division} · {item.county} County
                  </p>
                </div>

                {/* Key metadata grid */}
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 bg-black border border-sky-950 rounded-lg">
                    <span className="text-[10px] text-sky-500 block uppercase font-medium">Filed Date</span>
                    <span className="font-mono text-sky-200">{item.filingDate}</span>
                  </div>
                  <div className="p-2 bg-black border border-sky-950 rounded-lg">
                    <span className="text-[10px] text-sky-500 block uppercase font-medium">Judge</span>
                    <span className="text-sky-200 truncate block">{item.judge}</span>
                  </div>
                  <div className="p-2 bg-black border border-sky-950 rounded-lg">
                    <span className="text-[10px] text-sky-500 block uppercase font-medium">Courtroom</span>
                    <span className="text-sky-200">{item.courtroom}</span>
                  </div>
                  <div className="p-2 bg-black border border-sky-950 rounded-lg">
                    <span className="text-[10px] text-sky-500 block uppercase font-medium">
                      {item.nextHearingDate ? 'Next Hearing' : 'Citation #'}
                    </span>
                    <span className="text-sky-200 truncate block font-mono">
                      {item.nextHearingDate ? item.nextHearingDate.split(' at ')[0] : (item.citationNumber || 'N/A')}
                    </span>
                  </div>
                </div>

                {/* Charges preview */}
                <div className="mt-3 pt-2.5 border-t border-sky-950/60">
                  <div className="text-[11px] text-sky-400 font-semibold uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Charges / Causes of Action ({item.charges.length})</span>
                    <span className="text-[10px] text-sky-500 lowercase">click card for complete docket</span>
                  </div>
                  <div className="space-y-1">
                    {item.charges.slice(0, 2).map((c) => (
                      <div key={c.count} className="text-xs flex flex-wrap items-center justify-between gap-1 text-sky-300">
                        <span className="font-medium">
                          <strong className="text-sky-400 font-mono">Ct {c.count}:</strong> {c.description}
                        </span>
                        <span className="text-[11px] font-mono text-sky-500">
                          {c.statute}
                        </span>
                      </div>
                    ))}
                    {item.charges.length > 2 && (
                      <span className="text-[11px] text-sky-500 block italic">
                        +{item.charges.length - 2} more charge(s)...
                      </span>
                    )}
                  </div>
                </div>

                {/* Card footer CTA */}
                <div className="mt-3 pt-2.5 border-t border-sky-950 flex items-center justify-between text-xs">
                  <span className="text-sky-500 text-[11px]">
                    {item.docketEntries.length} docket sheet events recorded
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedCase(item)}
                    className="px-3 py-1 bg-black border border-sky-800 group-hover:border-sky-400 text-sky-300 group-hover:text-sky-100 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-all"
                  >
                    <span>View Docket Details</span>
                    <ChevronRight className="w-3.5 h-3.5 text-sky-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* List Footer with Official KYeCourts Link & Disclaimer */}
      <div className="pt-3 border-t border-sky-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-sky-500">
        <div>
          <span>Showing <strong>{filteredRecords.length}</strong> of <strong>{records.length}</strong> records</span>
          <span className="mx-2">·</span>
          <span>Scroll container contains all returned results</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://kcoj.kycourts.net/CourtNet/Search/Index"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-black border border-sky-900 text-sky-400 hover:text-sky-200 hover:border-sky-600 rounded-lg inline-flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
            <span>Open kcoj.kycourts.net Directly</span>
          </a>
        </div>
      </div>

      {/* Case Detail Modal */}
      {selectedCase && (
        <CaseDetailModal
          courtCase={selectedCase}
          searchedDob={query.dob}
          onClose={() => setSelectedCase(null)}
        />
      )}
    </div>
  );
};
