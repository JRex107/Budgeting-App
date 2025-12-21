import { Toast } from './Toast';
import type { ToastMessage } from './Toast';
import './ToastContainer.css';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onRemove} />
      ))}
    </div>
  );
}
