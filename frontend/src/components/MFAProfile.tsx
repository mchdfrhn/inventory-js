import React from 'react';

interface MFAProfileProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  variant?: 'minimal' | 'detailed';
}

const MFAProfile: React.FC<MFAProfileProps> = ({ 
  className = '', 
  size = 'sm',
  showLabel = true,
  variant = 'minimal'
}) => {
  const sizeClasses = {
    sm: {
      container: "h-8 w-8",
      text: "text-xs",
      image: "h-8 w-8"
    },
    md: {
      container: "h-10 w-10", 
      text: "text-sm",
      image: "h-10 w-10"
    },
    lg: {
      container: "h-12 w-12",
      text: "text-base", 
      image: "h-12 w-12"
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Profile Photo with circular blue background */}
      <div className="relative group">
        <img 
          src="/profile.jpeg" 
          alt="Mochammad Farhan Ali"
          className={`${sizeClasses[size].image} rounded-full object-cover shadow-lg transition-transform duration-300 group-hover:scale-110`}
          onError={(e) => {
            // Fallback to styled initials if photo fails to load
            const target = e.currentTarget;
            const fallback = document.createElement('div');
            fallback.className = `${sizeClasses[size].container} rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg transition-transform duration-300 group-hover:scale-110`;
            fallback.innerHTML = 'MFA';
            fallback.style.fontSize = size === 'sm' ? '0.75rem' : size === 'md' ? '0.875rem' : '1rem';
            target.parentNode?.replaceChild(fallback, target);
          }}
        />
        
        {/* Hover effect */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur -z-10"></div>
      </div>
      
      {/* Name and title */}
      {showLabel && (
        <div className="flex flex-col">
          <span className={`font-semibold text-gray-900 ${sizeClasses[size].text}`}>
            Mochammad Farhan Ali
          </span>
          {variant === 'detailed' && (
            <>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Full Stack Developer
              </span>
              <span className="text-xs text-gray-400">• 2025</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MFAProfile;
