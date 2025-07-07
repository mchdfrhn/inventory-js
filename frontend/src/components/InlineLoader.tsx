import React from 'react';

interface InlineLoaderProps {
  size?: 'xs' | 'sm' | 'md';
  variant?: 'primary' | 'white' | 'secondary';
  className?: string;
}

const InlineLoader: React.FC<InlineLoaderProps> = ({ 
  size = 'sm', 
  variant = 'primary', 
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5'
  };

  const variantClasses = {
    primary: 'border-blue-600/30 border-t-blue-600',
    white: 'border-white/30 border-t-white',
    secondary: 'border-gray-600/30 border-t-gray-600'
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Ring */}
      <div className={`${sizeClasses[size]} border-2 rounded-full animate-spin ${variantClasses[variant]}`}
           style={{ animationDuration: '0.8s' }}>
      </div>
      
      {/* Center Dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`w-0.5 h-0.5 rounded-full bg-current opacity-60 animate-ping`}
             style={{ 
               animationDuration: '1.2s',
               color: variant === 'primary' ? '#2563eb' : variant === 'white' ? '#ffffff' : '#4b5563'
             }}>
        </div>
      </div>
    </div>
  );
};

export default InlineLoader;
