
import './Button.css';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={`button button-${variant} ${isDisabled ? 'button-disabled' : ''} ${className}`}
      onClick={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <span className="button-spinner" />
      ) : (
        title
      )}
    </button>
  );
}
