import React from 'react';
import { History, Clock, ArrowRight, Trash2, X, RefreshCw, Calendar, User, Search } from 'lucide-react';
import { SearchHistoryItem } from '../types.ts';

interface SearchHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: SearchHistoryItem[];
  onSelectQuery: (item: SearchHistoryItem) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string, e: React.MouseEvent) => void;
  activeQuery?: { lastName: string; firstName: string; dob: string } | null;
}

export const SearchHistorySidebar: React.FC<SearchHistorySidebarProps> = ({
  isOpen,
  onClose,
  history,
  onSelectQuery,
  onClearHistory,
  onDeleteItem,
  activeQuery,
}) => {
  const formatTimestamp = (ts: number) => {
    const now = Date.now();
    const diffMs = now - ts;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Backdrop overlay for mobile or when sidebar opens */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Slide-out Sidebar drawer */}
      <aside
        id="search-history-drawer"
        aria-label="Search History Sidebar"
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm sm:w-96 bg-black border-l border-sky-950 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(56,189,248,0.15)] transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-sky-950 bg-neutral-950/70">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-black border border-sky-900 text-sky-400">
              <History className="w-4 h-4 text-sky-400" />
            </span>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-sky-100 flex items-center gap-2">
                <span>Search History</span>
                {history.length > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] rounded bg-black border border-sky-800 text-sky-300 font-mono">
                    {history.length}
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-sky-500 font-medium">Saved locally in browser</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black border border-sky-950 text-sky-400 hover:text-sky-100 hover:border-sky-500 transition-colors"
            aria-label="Close search history"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar / Quick count */}
        {history.length > 0 && (
          <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 border-b border-sky-950/80 bg-black/60 text-xs">
            <span className="text-[11px] text-sky-400/80">Click any card to re-run search</span>
            <button
              type="button"
              onClick={onClearHistory}
              className="px-2 py-1 rounded bg-black border border-sky-950 hover:border-sky-700 text-sky-400 hover:text-sky-200 transition-colors text-[11px] inline-flex items-center gap-1.5"
            >
              <Trash2 className="w-3 h-3 text-sky-500" />
              <span>Clear All</span>
            </button>
          </div>
        )}

        {/* Scrollable list of history items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-black border border-sky-950 flex items-center justify-center text-sky-600">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-sky-300">No Prior Searches</h4>
                <p className="text-[11px] text-sky-500/80 max-w-[220px]">
                  When you submit party queries for Last Name, First Name, and DOB, they will appear here for instant replay.
                </p>
              </div>
            </div>
          ) : (
            history.map((item) => {
              const isCurrent =
                activeQuery &&
                activeQuery.lastName.toUpperCase() === item.lastName.toUpperCase() &&
                activeQuery.firstName.toUpperCase() === item.firstName.toUpperCase() &&
                activeQuery.dob === item.dob;

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectQuery(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectQuery(item);
                    }
                  }}
                  className={`group relative w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-neutral-950/80 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.25)]'
                      : 'bg-black border-sky-950 hover:border-sky-600 hover:bg-neutral-950'
                  }`}
                >
                  {/* Top row: Name and Delete button */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="font-bold text-sm text-sky-100 truncate group-hover:text-sky-300 transition-colors uppercase font-mono-numbers">
                          {item.lastName}, {item.firstName}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => onDeleteItem(item.id, e)}
                      title="Delete from history"
                      className="p-1 rounded bg-black border border-transparent text-sky-700 hover:text-sky-300 hover:border-sky-900 transition-colors shrink-0"
                      aria-label={`Delete ${item.lastName}, ${item.firstName} from history`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Middle row: DOB and recorded results count */}
                  <div className="mt-2 flex items-center justify-between text-xs text-sky-400/90">
                    <div className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="w-3 h-3 text-sky-500" />
                      <span>DOB: {item.dob}</span>
                    </div>

                    {typeof item.resultsCount === 'number' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-black border border-sky-950 text-sky-300 font-mono">
                        {item.resultsCount} {item.resultsCount === 1 ? 'case' : 'cases'}
                      </span>
                    )}
                  </div>

                  {/* Bottom row: Timestamp & Re-run CTA */}
                  <div className="mt-2.5 pt-2 border-t border-sky-950/70 flex items-center justify-between text-[11px]">
                    <span className="text-sky-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(item.timestamp)}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 text-sky-400 group-hover:text-sky-200 font-semibold group-hover:translate-x-0.5 transition-all">
                      <span>Re-run</span>
                      <ArrowRight className="w-3 h-3 text-sky-400" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-sky-950 bg-neutral-950/60 text-[11px] text-sky-500 flex items-center justify-between">
          <span>CourtNet Search Gateway</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-black border border-sky-800 text-sky-300 hover:border-sky-500 hover:text-sky-100 rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </aside>
    </>
  );
};
