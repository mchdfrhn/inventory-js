import React from 'react';
import Loader from './Loader';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Memuat data...', 
  size = 'md',
  className = '' 
}) => {
  return (
    <div className={`flex justify-center items-center min-h-screen ${className}`}>
      <Loader size={size} message={message} />
    </div>
  );
};

export default LoadingState;
