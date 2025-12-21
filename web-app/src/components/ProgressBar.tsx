
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
  const isNearLimit = percentage >= 80 && percentage < 100;

  // Generate gradient based on color
  const getGradient = () => {
    if (isOverBudget) {
      return 'linear-gradient(90deg, #EF4444 0%, #F87171 100%)';
    }
    if (isNearLimit) {
      return 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)';
    }
    // Default gradient using the provided color
    return `linear-gradient(90deg, ${color} 0%, ${color}DD 100%)`;
  };

  return (
    <div className={`progress-container ${className}`}>
      {label && (
        <div className="progress-label-container">
          <span className="progress-label">{label}</span>
          {showPercentage && (
            <span className={`progress-percentage ${isOverBudget ? 'over-budget' : isNearLimit ? 'near-limit' : ''}`}>
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className="progress-bar-background">
        <div
          className={`progress-bar-fill ${isOverBudget ? 'over-budget-fill' : isNearLimit ? 'near-limit-fill' : ''}`}
          style={{
            width: `${percentage}%`,
            background: getGradient(),
          }}
        />
      </div>
    </div>
  );
}
