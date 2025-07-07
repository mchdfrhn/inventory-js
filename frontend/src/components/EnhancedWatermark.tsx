import React from 'react';
import { CodeBracketIcon } from '@heroicons/react/24/outline';

interface EnhancedWatermarkProps {
  className?: string;
  variant?: 'footer' | 'floating' | 'sidebar' | 'minimal';
  showIcon?: boolean;
  showFullName?: boolean;
  showTitle?: boolean;
  profilePhotoUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const EnhancedWatermark: React.FC<EnhancedWatermarkProps> = ({ 
  className = '', 
  variant = 'footer',
  showIcon = true,
  showFullName = true,
  showTitle = false,
  profilePhotoUrl = '/profile.jpeg',
  size = 'sm'
}) => {
  const sizeConfig = {
    xs: {
      photo: "h-4 w-4",
      text: "text-xs",
      gap: "gap-1"
    },
    sm: {
      photo: "h-5 w-5",
      text: "text-xs", 
      gap: "gap-1.5"
    },
    md: {
      photo: "h-6 w-6",
      text: "text-sm",
      gap: "gap-2"
    },
    lg: {
      photo: "h-8 w-8",
      text: "text-base",
      gap: "gap-3"
    }
  };

  const baseClasses = `flex items-center justify-center ${sizeConfig[size].gap} ${sizeConfig[size].text} text-gray-400 opacity-60 hover:opacity-100 transition-all duration-300 group`;
  
  const variantClasses = {
    footer: "py-2",
    floating: "fixed bottom-4 right-4 bg-white/90 backdrop-blur-md rounded-xl px-4 py-3 shadow-xl border border-gray-200/50 z-30",
    sidebar: "mt-auto pt-4 border-t border-gray-200/50",
    minimal: "py-1"
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {/* Profile Photo/Icon */}
      {showIcon && (
        <div className="relative">
          <img 
            src={profilePhotoUrl} 
            alt="Mochammad Farhan Ali"
            className={`${sizeConfig[size].photo} rounded-full object-cover ring-2 ring-blue-500/30 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:ring-blue-500/60`}
            onError={(e) => {
              // Fallback to styled initials if photo fails to load
              const target = e.currentTarget;
              const fallback = document.createElement('div');
              fallback.className = `${sizeConfig[size].photo} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg transition-all duration-300 group-hover:scale-110`;
              fallback.innerHTML = 'MFA';
              fallback.style.fontSize = size === 'xs' ? '0.5rem' : size === 'sm' ? '0.625rem' : size === 'md' ? '0.75rem' : '0.875rem';
              target.parentNode?.replaceChild(fallback, target);
            }}
          />
          
          {/* Animated glow effect on hover */}
          <div className={`absolute -inset-1 ${sizeConfig[size].photo} rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10`}></div>
        </div>
      )}
      
      {/* Text Content */}
      <div className="flex flex-col items-center">
        {/* Developer credit */}
        <div className="flex items-center gap-1">
          <span className="font-medium">Developed by</span>
          {showFullName && (
            <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-purple-600 hover:to-blue-600 transition-all duration-300">
              Mochammad Farhan Ali
            </span>
          )}
        </div>
        
        {/* Optional title */}
        {showTitle && (
          <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
            <CodeBracketIcon className="h-3 w-3" />
            <span>Full Stack Developer</span>
            <span>• 2025</span>
          </div>
        )}
      </div>
      
      {/* Enhanced floating background effect */}
      {variant === 'floating' && (
        <>
          <div className="absolute -inset-3 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </>
      )}
    </div>
  );
};

export default EnhancedWatermark;
