import React from 'react';
import { CodeBracketIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface WatermarkProps {
  className?: string;
  variant?: 'footer' | 'floating' | 'sidebar';
  showIcon?: boolean;
  useProfilePhoto?: boolean;
  profilePhotoUrl?: string;
}

const Watermark: React.FC<WatermarkProps> = ({ 
  className = '', 
  variant = 'footer',
  showIcon = true,
  useProfilePhoto = true,
  profilePhotoUrl = '/profile.jpeg'
}) => {
  const baseClasses = "flex items-center justify-center gap-2 text-xs text-gray-400 opacity-60 hover:opacity-100 transition-all duration-300 group";
  
  const variantClasses = {
    footer: "py-2",
    floating: "fixed bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-gray-200/50 z-30",
    sidebar: "mt-auto pt-4 border-t border-gray-200/50"
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <div className="flex items-center gap-1.5">
        {showIcon && (
          <div className="relative">
            {useProfilePhoto ? (
              // Profile Photo
              <div className="relative">
                <img 
                  src={profilePhotoUrl} 
                  alt="Mochammad Farhan Ali"
                  className="h-6 w-6 rounded-full object-cover ring-2 ring-blue-500/30 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:ring-blue-500/60"
                  onError={(e) => {
                    // Fallback to icon if photo fails to load
                    const target = e.currentTarget;
                    const fallbackDiv = document.createElement('div');
                    fallbackDiv.className = 'h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-lg';
                    fallbackDiv.innerHTML = 'MFA';
                    target.parentNode?.replaceChild(fallbackDiv, target);
                  }}
                />
                {/* Animated glow effect on hover */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10"></div>
              </div>
            ) : (
              // Default icons
              <div className="relative">
                <CodeBracketIcon className="h-3.5 w-3.5" />
                <SparklesIcon className="h-2 w-2 absolute -top-0.5 -right-0.5 text-blue-500 opacity-70" />
              </div>
            )}
          </div>
        )}
        <span className="font-medium">Developed by</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-purple-600 hover:to-blue-600 transition-all duration-300">
          Mochammad Farhan Ali
        </span>
      </div>
      {variant === 'floating' && (
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      )}
    </div>
  );
};

export default Watermark;
