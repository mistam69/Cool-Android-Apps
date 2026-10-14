import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarPickerProps {
  value: string; // MM/DD/YYYY
  onChange: (formattedDate: string) => void;
  onClose: () => void;
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({ value, onChange, onClose }) => {
  // Parse existing value or default to reasonable DOB year (e.g. 1990)
  const currentYear = new Date().getFullYear();
  
  const parseInitialDate = () => {
    if (value && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [m, d, y] = value.split('/').map(Number);
      if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1900 && y <= currentYear) {
        return { month: m - 1, year: y, day: d };
      }
    }
    // Default to 1990 for convenient DOB picking
    return { month: 0, year: 1990, day: 1 };
  };

  const initial = parseInitialDate();
  const [selectedMonth, setSelectedMonth] = useState(initial.month);
  const [selectedYear, setSelectedYear] = useState(initial.year);
  const [selectedDay, setSelectedDay] = useState<number | null>(initial.day);

  // Sync if value changes
  useEffect(() => {
    const parsed = parseInitialDate();
    setSelectedMonth(parsed.month);
    setSelectedYear(parsed.year);
    if (value) {
      setSelectedDay(parsed.day);
    }
  }, [value]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Generate list of years from 1920 to currentYear
  const years = Array.from({ length: currentYear - 1920 + 1 }, (_, i) => currentYear - i);

  // Days in selected month & year
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(selectedYear, selectedMonth, 1).getDay(); // 0 is Sunday

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => Math.max(1920, prev - 1));
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      if (selectedYear < currentYear) {
        setSelectedMonth(0);
        setSelectedYear((prev) => prev + 1);
      }
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    const mm = String(selectedMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const yyyy = String(selectedYear);
    onChange(`${mm}/${dd}/${yyyy}`);
    onClose();
  };

  return (
    <div 
      className="absolute z-50 mt-2 left-0 right-0 sm:right-auto sm:w-80 bg-black border border-sky-500/60 rounded-xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.9),0_0_20px_rgba(56,189,248,0.15)] backdrop-blur-md"
      role="dialog"
      aria-label="Calendar date of birth picker"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-sky-950">
        <div className="flex items-center gap-2 text-sky-400 font-medium text-xs tracking-wider uppercase">
          <CalendarIcon className="w-4 h-4 text-sky-400" />
          <span>Select Date of Birth</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md bg-black border border-sky-900 text-sky-400 hover:text-sky-200 hover:border-sky-500 transition-colors"
          aria-label="Close calendar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Month & Year Selectors */}
      <div className="flex items-center justify-between gap-1 my-3">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1.5 rounded-lg bg-black border border-sky-900 text-sky-300 hover:text-sky-100 hover:border-sky-500 hover:bg-neutral-900 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5">
          {/* Month Dropdown */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-black border border-sky-900 text-sky-300 rounded-lg px-2 py-1 text-xs font-medium focus:border-sky-400 focus:outline-none cursor-pointer hover:border-sky-700"
          >
            {monthNames.map((name, idx) => (
              <option key={name} value={idx} className="bg-black text-sky-300">
                {name}
              </option>
            ))}
          </select>

          {/* Year Dropdown */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-black border border-sky-900 text-sky-300 rounded-lg px-2 py-1 text-xs font-mono font-medium focus:border-sky-400 focus:outline-none cursor-pointer hover:border-sky-700"
          >
            {years.map((yr) => (
              <option key={yr} value={yr} className="bg-black text-sky-300">
                {yr}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          disabled={selectedYear >= currentYear && selectedMonth === 11}
          className="p-1.5 rounded-lg bg-black border border-sky-900 text-sky-300 hover:text-sky-100 hover:border-sky-500 hover:bg-neutral-900 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((w) => (
          <span key={w} className="text-[11px] font-semibold text-sky-500/70 py-1">
            {w}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Empty cells before month start */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-7 w-7" />
        ))}

        {/* Days of month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isSelected =
            selectedDay === day &&
            value === `${String(selectedMonth + 1).padStart(2, '0')}/${String(day).padStart(2, '0')}/${selectedYear}`;

          return (
            <button
              key={day}
              type="button"
              onClick={() => handleSelectDay(day)}
              className={`h-7 w-7 mx-auto rounded-lg text-xs font-mono transition-all flex items-center justify-center ${
                isSelected
                  ? 'bg-black border-2 border-sky-400 text-sky-200 font-bold shadow-[0_0_8px_rgba(56,189,248,0.5)]'
                  : 'bg-black text-sky-300 border border-transparent hover:border-sky-500 hover:bg-neutral-900 hover:text-sky-100'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Footer controls */}
      <div className="mt-3 pt-3 border-t border-sky-950 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => {
            onChange('');
            setSelectedDay(null);
          }}
          className="px-2.5 py-1 bg-black border border-sky-900 text-sky-400 hover:text-sky-200 hover:border-sky-600 rounded-md transition-colors"
        >
          Clear
        </button>
        <span className="text-[11px] text-sky-500/80 font-mono">
          {value || 'MM/DD/YYYY'}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="px-2.5 py-1 bg-black border border-sky-800 text-sky-300 hover:border-sky-400 hover:text-sky-100 rounded-md transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};
