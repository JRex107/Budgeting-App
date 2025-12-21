import { X } from 'lucide-react';
import { useEffect } from 'react';
import './SlideOver.css';

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function SlideOver({ isOpen, onClose, title, children }: SlideOverProps) {
  // Prevent body scroll when slide-over is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="slide-over-overlay" onClick={onClose}>
      <div className="slide-over-panel" onClick={(e) => e.stopPropagation()}>
        <div className="slide-over-header">
          <h2 className="slide-over-title">{title}</h2>
          <button
            onClick={onClose}
            className="slide-over-close"
            aria-label="Close"
          >
            <X size={24} strokeWidth={2} />
          </button>
        </div>
        <div className="slide-over-content">
          {children}
        </div>
      </div>
    </div>
  );
}
