import React from 'react';

interface FuturisticLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'white' | 'accent';
  text?: string;
  className?: string;
}

const FuturisticLoader: React.FC<FuturisticLoaderProps> = ({ 
  size = 'md', 
  variant = 'primary', 
  text, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base', 
    xl: 'text-lg'
  };

  const variantClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    accent: 'text-indigo-600'
  };

  const ringVariantClasses = {
    primary: 'border-blue-600/20 border-t-blue-600',
    secondary: 'border-gray-600/20 border-t-gray-600', 
    white: 'border-white/20 border-t-white',
    accent: 'border-indigo-600/20 border-t-indigo-600'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {/* Main Loader */}
      <div className="relative">
        {/* Outer Ring */}
        <div className={`${sizeClasses[size]} border-2 rounded-full animate-spin ${ringVariantClasses[variant]}`} 
             style={{ animationDuration: '1s' }}></div>
        
        {/* Inner Pulse Dot */}
        <div className={`absolute inset-0 flex items-center justify-center`}>
          <div className={`w-1 h-1 rounded-full ${variantClasses[variant]} animate-pulse`}
               style={{ animationDuration: '1.5s' }}></div>
        </div>
        
        {/* Orbital Dots */}
        <div className={`absolute inset-0 animate-spin`} style={{ animationDuration: '2s', animationDirection: 'reverse' }}>
          <div className={`absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${variantClasses[variant]} opacity-60`}></div>
          <div className={`absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${variantClasses[variant]} opacity-40`}></div>
        </div>
      </div>

      {/* Loading Text */}
      {text && (
        <div className={`${textSizeClasses[size]} ${variantClasses[variant]} font-medium animate-pulse`}>
          {text}
        </div>
      )}
    </div>
  );
};

export default FuturisticLoader;
