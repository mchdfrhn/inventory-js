import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import GlassCard from './GlassCard';
import GradientButton from './GradientButton';

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | unknown;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Terjadi Kesalahan',
  message,
  error,
  onRetry,
  retryLabel = 'Coba Lagi',
  className = ''
}) => {
  // Get error message
  const errorMessage = message || 
    (error instanceof Error ? error.message : 'Gagal memuat konten');

  return (
    <div className={`min-h-screen bg-gray-50 flex items-center justify-center p-4 ${className}`}>
      <GlassCard hover={false} className="max-w-md w-full text-center">
        <div className="p-8">
          <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 mb-4">
            {errorMessage}
          </p>
          {onRetry && (
            <GradientButton variant="primary" onClick={onRetry}>
              {retryLabel}
            </GradientButton>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default ErrorState;
