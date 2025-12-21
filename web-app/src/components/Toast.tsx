import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const TOAST_ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

export function Toast({ toast, onClose }: ToastProps) {
  const Icon = TOAST_ICONS[toast.type];

  useEffect(() => {
    const duration = toast.duration || 3000;
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  return (
    <div className={`toast toast-${toast.type}`}>
      <div className="toast-icon">
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <div className="toast-message">{toast.message}</div>
      <button
        className="toast-close"
        onClick={() => onClose(toast.id)}
        aria-label="Close notification"
      >
        <X size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}
