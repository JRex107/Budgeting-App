import { ChevronLeft, ChevronRight } from 'lucide-react';
import './MonthHeader.css';

interface MonthHeaderProps {
  monthKey: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function MonthHeader({ monthKey, onPrevMonth, onNextMonth }: MonthHeaderProps) {
  // Format month key (e.g., "2025-01") to display format (e.g., "January 2025")
  const formatMonthDisplay = (key: string): string => {
    const [year, month] = key.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="month-header">
      <button
        onClick={onPrevMonth}
        className="month-nav-button"
        aria-label="Previous month"
      >
        <ChevronLeft size={20} strokeWidth={2.5} />
      </button>

      <h2 className="month-title">{formatMonthDisplay(monthKey)}</h2>

      <button
        onClick={onNextMonth}
        className="month-nav-button"
        aria-label="Next month"
      >
        <ChevronRight size={20} strokeWidth={2.5} />
      </button>
    </div>
  );
}
