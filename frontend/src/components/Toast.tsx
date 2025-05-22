import React, { useEffect, useState } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import type { Notification, NotificationType } from '../context/NotificationContext';

interface ToastProps {
  notification: Notification;
  onClose: () => void;
}

const icons: Record<NotificationType, React.ReactNode> = {
  success: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
  error: <XCircleIcon className="h-6 w-6 text-red-500" />,
  warning: <ExclamationCircleIcon className="h-6 w-6 text-amber-500" />,
  info: <InformationCircleIcon className="h-6 w-6 text-blue-500" />,
};

const bgColors: Record<NotificationType, string> = {
  success: 'bg-green-50',
  error: 'bg-red-50',
  warning: 'bg-amber-50',
  info: 'bg-blue-50',
};

const borderColors: Record<NotificationType, string> = {
  success: 'border-green-200',
  error: 'border-red-200',
  warning: 'border-amber-200',
  info: 'border-blue-200',
};

const textColors: Record<NotificationType, string> = {
  success: 'text-green-800',
  error: 'text-red-800',
  warning: 'text-amber-800',
  info: 'text-blue-800',
};

const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
  const { type, message } = notification;
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const { duration = 5000 } = notification;

  useEffect(() => {
    // Enter animation
    const enterTimeout = setTimeout(() => setIsVisible(true), 50);
    
    // Progress bar animation
    let startTime = Date.now();
    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const remainingPercent = Math.max(0, 100 - (elapsedTime / duration) * 100);
      setProgress(remainingPercent);
      
      if (remainingPercent <= 0) {
        clearInterval(interval);
        handleClose();
      }
    }, 50);
    
    return () => {
      clearTimeout(enterTimeout);
      clearInterval(interval);
    };
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    // Adding delay for exit animation
    setTimeout(() => {
      onClose();
    }, 300);
  };  return (
    <div 
      className={`
        relative overflow-hidden transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'}
        ${isExiting ? 'translate-y-4 opacity-0 scale-95' : 'animate-bounce-subtle'}
        backdrop-blur-lg glass-card shadow-lg rounded-lg border ${borderColors[type]} ${bgColors[type]}
        max-w-md w-full p-4 pointer-events-auto
      `}
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${textColors[type]}`}>
            {message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className={`bg-transparent rounded-md inline-flex ${textColors[type]} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            onClick={handleClose}
          >
            <span className="sr-only">Close</span>
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
        <div 
          className={`h-full transition-all duration-100 ease-linear ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 
            type === 'warning' ? 'bg-amber-500' : 
            'bg-blue-500'
          }`}
          style={{ width: `${progress}%` }} 
        />
      </div>
    </div>
  );
};

export default Toast;
