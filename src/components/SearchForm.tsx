import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, Search, CheckCircle2, AlertCircle, RotateCcw, Sparkles } from 'lucide-react';
import { CalendarPicker } from './CalendarPicker.tsx';

interface SearchFormProps {
  onSearch: (params: { lastName: string; firstName: string; dob: string; sessionCookie?: string }) => void;
  isLoading: boolean;
  initialValues?: { lastName: string; firstName: string; dob: string };
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading, initialValues }) => {
  const [lastName, setLastName] = useState(initialValues?.lastName || '');
  const [firstName, setFirstName] = useState(initialValues?.firstName || '');
  const [dob, setDob] = useState(initialValues?.dob || '');
  const [sessionCookie, setSessionCookie] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Touched states for validation hints
  const [touched, setTouched] = useState({
    lastName: false,
    firstName: false,
    dob: false,
  });

  const calendarContainerRef = useRef<HTMLDivElement>(null);

  // Close calendar on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        calendarContainerRef.current &&
        !calendarContainerRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Validation functions
  const isLastNameValid = (val: string): boolean => {
    const trimmed = val.trim();
    return trimmed.length >= 2 && /^[a-zA-Z\s'-]+$/.test(trimmed);
  };

  const isFirstNameValid = (val: string): boolean => {
    const trimmed = val.trim();
    return trimmed.length >= 1 && /^[a-zA-Z\s'-]+$/.test(trimmed);
  };

  const isDobValid = (val: string): boolean => {
    const trimmed = val.trim();
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
      return false;
    }
    const [monthStr, dayStr, yearStr] = trimmed.split('/');
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    const year = parseInt(yearStr, 10);

    const now = new Date();
    const currentYear = now.getFullYear();

    if (month < 1 || month > 12) return false;
    if (year < 1900 || year > currentYear) return false;

    // Check days in that specific month and leap year
    const daysInThisMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInThisMonth) return false;

    const inputDate = new Date(year, month - 1, day);
    if (inputDate > now) return false;

    return true;
  };

  const validLast = isLastNameValid(lastName);
  const validFirst = isFirstNameValid(firstName);
  const validDob = isDobValid(dob);

  // The submit button is enabled ONLY when all 3 text boxes are filled out correctly
  const isFormValid = validLast && validFirst && validDob;

  // Auto-format MM/DD/YYYY mask when typing
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '');
    if (raw.length > 8) raw = raw.slice(0, 8);

    let formatted = raw;
    if (raw.length >= 5) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4)}`;
    } else if (raw.length >= 3) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }

    setDob(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;
    onSearch({
      lastName: lastName.trim(),
      firstName: firstName.trim(),
      dob: dob.trim(),
      sessionCookie: sessionCookie.trim() || undefined,
    });
  };

  const handleReset = () => {
    setLastName('');
    setFirstName('');
    setDob('');
    setTouched({ lastName: false, firstName: false, dob: false });
    setIsCalendarOpen(false);
  };

  const loadSample = (sampleLast: string, sampleFirst: string, sampleDob: string) => {
    setLastName(sampleLast);
    setFirstName(sampleFirst);
    setDob(sampleDob);
    setTouched({ lastName: true, firstName: true, dob: true });
    setIsCalendarOpen(false);
  };

  return (
    <div className="bg-black border border-sky-950 rounded-2xl p-6 sm:p-8 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative">
      {/* Subtle light blue top glow line */}
      <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />

      {/* Header section with backend info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-5 border-b border-sky-950">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-sky-200">
            Kentucky CourtNet Party Lookup
          </h2>
          <p className="text-xs sm:text-sm text-sky-400/80 mt-1">
            Query court docket records via <span className="font-mono text-sky-300">kcoj.kycourts.net/CourtNet/Search/Index</span>
          </p>
        </div>

        {/* Quick sample test triggers */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-sky-500 font-medium">Quick fill:</span>
          <button
            type="button"
            onClick={() => loadSample('SMITH', 'MARCUS', '05/14/1988')}
            className="px-2.5 py-1 text-xs rounded-lg bg-black border border-sky-900/80 text-sky-300 hover:border-sky-500 hover:bg-neutral-950 transition-colors whitespace-nowrap"
          >
            Smith, M. (1988)
          </button>
          <button
            type="button"
            onClick={() => loadSample('MILLER', 'SARAH', '11/23/1994')}
            className="px-2.5 py-1 text-xs rounded-lg bg-black border border-sky-900/80 text-sky-300 hover:border-sky-500 hover:bg-neutral-950 transition-colors whitespace-nowrap"
          >
            Miller, S. (1994)
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* The Three Text Boxes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Last Name */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="lastName" className="text-xs font-semibold uppercase tracking-wider text-sky-300">
                1. Last Name <span className="text-sky-400">*</span>
              </label>
              {touched.lastName && (
                <span className="text-[11px] text-sky-400">
                  {validLast ? (
                    <span className="inline-flex items-center gap-1 text-sky-300">
                      <CheckCircle2 className="w-3 h-3 text-sky-400" /> Valid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sky-400/90">
                      <AlertCircle className="w-3 h-3" /> Min 2 letters
                    </span>
                  )}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, lastName: true }))}
                placeholder="e.g. SMITH"
                className={`w-full px-4 py-3 bg-black text-sky-100 placeholder:text-sky-700/60 text-sm font-medium rounded-xl border transition-all uppercase focus:outline-none ${
                  validLast
                    ? 'border-sky-500/70 focus:border-sky-300 focus:ring-1 focus:ring-sky-400'
                    : touched.lastName && lastName.length > 0
                    ? 'border-sky-800 focus:border-sky-400 focus:ring-1 focus:ring-sky-400'
                    : 'border-sky-950 focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                }`}
              />
            </div>
            <p className="text-[11px] text-sky-500/70">Legal surname as recorded in CourtNet</p>
          </div>

          {/* 2. First Name */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="firstName" className="text-xs font-semibold uppercase tracking-wider text-sky-300">
                2. First Name <span className="text-sky-400">*</span>
              </label>
              {touched.firstName && (
                <span className="text-[11px] text-sky-400">
                  {validFirst ? (
                    <span className="inline-flex items-center gap-1 text-sky-300">
                      <CheckCircle2 className="w-3 h-3 text-sky-400" /> Valid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sky-400/90">
                      <AlertCircle className="w-3 h-3" /> Min 1 letter
                    </span>
                  )}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, firstName: true }))}
                placeholder="e.g. JOHN"
                className={`w-full px-4 py-3 bg-black text-sky-100 placeholder:text-sky-700/60 text-sm font-medium rounded-xl border transition-all uppercase focus:outline-none ${
                  validFirst
                    ? 'border-sky-500/70 focus:border-sky-300 focus:ring-1 focus:ring-sky-400'
                    : touched.firstName && firstName.length > 0
                    ? 'border-sky-800 focus:border-sky-400 focus:ring-1 focus:ring-sky-400'
                    : 'border-sky-950 focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                }`}
              />
            </div>
            <p className="text-[11px] text-sky-500/70">Given legal first name</p>
          </div>

          {/* 3. Date of Birth with Calendar Selector */}
          <div className="space-y-1.5" ref={calendarContainerRef}>
            <div className="flex items-center justify-between">
              <label htmlFor="dob" className="text-xs font-semibold uppercase tracking-wider text-sky-300">
                3. Date of Birth <span className="text-sky-400">*</span>
              </label>
              {touched.dob && (
                <span className="text-[11px] text-sky-400">
                  {validDob ? (
                    <span className="inline-flex items-center gap-1 text-sky-300">
                      <CheckCircle2 className="w-3 h-3 text-sky-400" /> Valid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sky-400/90">
                      <AlertCircle className="w-3 h-3" /> MM/DD/YYYY
                    </span>
                  )}
                </span>
              )}
            </div>

            <div className="relative flex items-center">
              <input
                id="dob"
                name="dob"
                type="text"
                value={dob}
                onChange={handleDobChange}
                onBlur={() => setTouched((p) => ({ ...p, dob: true }))}
                placeholder="MM/DD/YYYY"
                maxLength={10}
                className={`w-full pl-4 pr-12 py-3 bg-black text-sky-100 placeholder:text-sky-700/60 text-sm font-mono rounded-xl border transition-all focus:outline-none ${
                  validDob
                    ? 'border-sky-500/70 focus:border-sky-300 focus:ring-1 focus:ring-sky-400'
                    : touched.dob && dob.length > 0
                    ? 'border-sky-800 focus:border-sky-400 focus:ring-1 focus:ring-sky-400'
                    : 'border-sky-950 focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                }`}
              />

              {/* Calendar Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  setIsCalendarOpen(!isCalendarOpen);
                  setTouched((p) => ({ ...p, dob: true }));
                }}
                title="Select Date of Birth from Calendar"
                aria-label="Open calendar selector"
                className={`absolute right-2 p-2 rounded-lg bg-black border text-sky-300 hover:text-sky-100 hover:bg-neutral-900 transition-all ${
                  isCalendarOpen
                    ? 'border-sky-400 bg-neutral-950 shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                    : 'border-sky-900 hover:border-sky-500'
                }`}
              >
                <CalendarIcon className="w-4 h-4 text-sky-400" />
              </button>

              {/* Calendar Picker Popup */}
              {isCalendarOpen && (
                <CalendarPicker
                  value={dob}
                  onChange={(dateStr) => {
                    setDob(dateStr);
                    setTouched((p) => ({ ...p, dob: true }));
                  }}
                  onClose={() => setIsCalendarOpen(false)}
                />
              )}
            </div>
            <p className="text-[11px] text-sky-500/70">Type MM/DD/YYYY or click calendar icon</p>
          </div>
        </div>

        {/* Validation Progress Indicator */}
        <div className="bg-black/80 border border-sky-950/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-sky-400/90 font-medium">Requirement check:</span>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 ${validLast ? 'text-sky-300' : 'text-sky-700'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${validLast ? 'bg-sky-400' : 'bg-sky-900'}`} />
                Last Name
              </span>
              <span className="text-sky-800">·</span>
              <span className={`inline-flex items-center gap-1 ${validFirst ? 'text-sky-300' : 'text-sky-700'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${validFirst ? 'bg-sky-400' : 'bg-sky-900'}`} />
                First Name
              </span>
              <span className="text-sky-800">·</span>
              <span className={`inline-flex items-center gap-1 ${validDob ? 'text-sky-300' : 'text-sky-700'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${validDob ? 'bg-sky-400' : 'bg-sky-900'}`} />
                Date of Birth
              </span>
            </div>
          </div>

          <div className="text-[11px] text-sky-400/80">
            {isFormValid ? (
              <span className="text-sky-300 font-medium">All 3 fields valid — Ready to submit</span>
            ) : (
              <span>Fill all 3 fields to enable search button</span>
            )}
          </div>
        </div>

        {/* Optional Kentucky CourtNet Session Gateway Settings */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-sky-500 hover:text-sky-300 transition-colors inline-flex items-center gap-1"
          >
            <span>{showAdvanced ? 'Hide' : 'Show'} CourtNet Gateway & Session options</span>
          </button>

          {showAdvanced && (
            <div className="mt-3 p-4 bg-black border border-sky-950 rounded-xl space-y-3 text-xs text-sky-400">
              <p>
                Target backend:{' '}
                <a
                  href="https://kcoj.kycourts.net/CourtNet/Search/Index"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sky-300 underline hover:text-sky-200"
                >
                  https://kcoj.kycourts.net/CourtNet/Search/Index
                </a>
              </p>
              <div>
                <label htmlFor="sessionCookie" className="block text-[11px] font-semibold text-sky-400 mb-1">
                  KYeCourts / ASP.NET Session Cookie (Optional for direct Kentucky Bar credentials):
                </label>
                <input
                  id="sessionCookie"
                  type="text"
                  value={sessionCookie}
                  onChange={(e) => setSessionCookie(e.target.value)}
                  placeholder="e.g. ASP.NET_SessionId=...; BIGipServerc2cmoR5SJapU3qPUHZfVfA=..."
                  className="w-full px-3 py-2 bg-black border border-sky-900 text-sky-200 font-mono text-xs rounded-lg focus:border-sky-400 focus:outline-none placeholder:text-sky-800"
                />
                <p className="text-[10px] text-sky-600 mt-1">
                  Leave blank to query via automated gateway with KCOJ protocol fallback.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls: Submit button and Clear button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-4 py-2.5 bg-black border border-sky-950 text-sky-400 hover:text-sky-200 hover:border-sky-800 rounded-xl text-xs font-semibold tracking-wider uppercase transition-colors inline-flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Inputs
          </button>

          {/* SUBMIT BUTTON: strictly enables after all 3 text boxes are filled out correctly */}
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`w-full sm:w-auto min-w-[240px] px-8 py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-200 inline-flex items-center justify-center gap-2.5 ${
              isFormValid && !isLoading
                ? 'bg-black text-sky-200 border-2 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.35)] hover:bg-neutral-950 hover:border-sky-300 hover:text-sky-100 hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] active:scale-[0.99] cursor-pointer'
                : 'bg-black text-sky-800 border border-sky-950 opacity-45 cursor-not-allowed shadow-none'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                <span>Querying CourtNet...</span>
              </>
            ) : (
              <>
                <Search className={`w-4 h-4 ${isFormValid ? 'text-sky-400' : 'text-sky-800'}`} />
                <span>Submit Search</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
