import { X } from 'lucide-react';
import './FilterChip.css';

interface FilterChipProps {
  label: string;
  value: string;
  isActive?: boolean;
  onToggle: () => void;
  onRemove?: () => void;
}

export function FilterChip({ label, value, isActive = false, onToggle, onRemove }: FilterChipProps) {
  return (
    <button
      onClick={onToggle}
      className={`filter-chip ${isActive ? 'filter-chip-active' : ''}`}
    >
      <span className="filter-chip-label">{label}</span>
      {isActive && value && (
        <>
          <span className="filter-chip-separator">:</span>
          <span className="filter-chip-value">{value}</span>
          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="filter-chip-remove"
              aria-label="Remove filter"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          )}
        </>
      )}
    </button>
  );
}
