
import './ProgressBar.css';

interface ProgressBarProps {
  current: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
  className?: string;
}

export function ProgressBar({
  current,
  max,
  label,
  showPercentage = true,
  color = '#007AFF',
  className = '',
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const isOverBudget = current > max;

  return (
    <div className={`progress-container ${className}`}>
      {label && (
        <div className="progress-label-container">
          <span className="progress-label">{label}</span>
          {showPercentage && (
            <span className={`progress-percentage ${isOverBudget ? 'over-budget' : ''}`}>
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className="progress-bar-background">
        <div
          className="progress-bar-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: isOverBudget ? '#FF3B30' : color,
          }}
        />
      </div>
    </div>
  );
}
