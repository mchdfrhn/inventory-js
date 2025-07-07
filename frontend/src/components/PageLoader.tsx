import React from 'react';
import FuturisticLoader from './FuturisticLoader';

interface PageLoaderProps {
  text?: string;
  variant?: 'primary' | 'secondary' | 'white' | 'accent';
  backdrop?: boolean;
  className?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({ 
  text = 'Memuat data...', 
  variant = 'primary',
  backdrop = true,
  className = '' 
}) => {
  const backdropClasses = backdrop 
    ? 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50' 
    : 'w-full h-64';

  return (
    <div className={`flex items-center justify-center ${backdropClasses} ${className}`}>
      <div className="text-center">
        <FuturisticLoader size="xl" variant={variant} text={text} />
        
        {/* Optional decorative elements */}
        <div className="mt-6 flex justify-center space-x-1">
          <div className="w-2 h-0.5 bg-current opacity-30 rounded-full animate-pulse" style={{ animationDelay: '0ms', animationDuration: '1.5s' }}></div>
          <div className="w-2 h-0.5 bg-current opacity-30 rounded-full animate-pulse" style={{ animationDelay: '150ms', animationDuration: '1.5s' }}></div>
          <div className="w-2 h-0.5 bg-current opacity-30 rounded-full animate-pulse" style={{ animationDelay: '300ms', animationDuration: '1.5s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
