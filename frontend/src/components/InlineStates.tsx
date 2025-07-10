import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import FuturisticLoader from './FuturisticLoader';

interface InlineLoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'accent';
}

export const InlineLoadingState: React.FC<InlineLoadingStateProps> = ({
  message = 'Memuat...',
  size = 'sm',
  variant = 'primary'
}) => {
  return (
    <div className="text-center py-3">
      <FuturisticLoader size={size} variant={variant} text={message} />
    </div>
  );
};

interface InlineErrorStateProps {
  message?: string;
  iconSize?: string;
}

export const InlineErrorState: React.FC<InlineErrorStateProps> = ({
  message = 'Gagal memuat data',
  iconSize = 'h-3.5 w-3.5'
}) => {
  return (
    <div className="text-center py-2 text-xs text-red-600">
      <ExclamationCircleIcon className={`${iconSize} inline mr-1`} />
      {message}
    </div>
  );
};
