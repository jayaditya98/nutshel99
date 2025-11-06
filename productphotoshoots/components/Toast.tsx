
import React, { useState, useEffect } from 'react';
import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onDismiss: () => void;
}

const ICONS = {
    success: <CheckIcon className="w-6 h-6" />,
    error: <XIcon className="w-6 h-6" />,
};

const COLORS = {
    success: 'bg-green-500 border-green-600',
    error: 'bg-red-500 border-red-600',
}

export const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setIsVisible(true);

    const timer = setTimeout(() => {
      // Animate out
      setIsVisible(false);
      // Then call dismiss handler after animation
      setTimeout(onDismiss, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center p-4 max-w-sm w-full text-white rounded-xl shadow-lg border transition-all duration-300 ${COLORS[type]} ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
      role="alert"
    >
      <div className="flex-shrink-0">
        {ICONS[type]}
      </div>
      <div className="ml-3 text-md font-semibold">{message}</div>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onDismiss, 300);
        }}
        className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg inline-flex h-8 w-8 text-white/70 hover:text-white hover:bg-white/20 transition-colors"
        aria-label="Dismiss"
      >
        <XIcon className="w-5 h-5" />
      </button>
    </div>
  );
};
