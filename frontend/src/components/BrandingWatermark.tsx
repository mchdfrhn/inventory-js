import React from 'react';
import { CodeBracketIcon, SparklesIcon, HeartIcon } from '@heroicons/react/24/outline';

interface BrandingWatermarkProps {
  className?: string;
  variant?: 'minimal' | 'detailed' | 'signature';
  showYear?: boolean;
}

const BrandingWatermark: React.FC<BrandingWatermarkProps> = ({ 
  className = '', 
  variant = 'minimal',
  showYear = true 
}) => {
  const currentYear = new Date().getFullYear();
  
  const renderMinimal = () => (
    <div className={`flex items-center justify-center gap-2 text-xs text-gray-400 opacity-70 hover:opacity-100 transition-all duration-300 ${className}`}>
      <div className="flex items-center gap-1.5">
        <div className="relative">
          <img 
            src="/profile.jpeg" 
            alt="Mochammad Farhan Ali"
            className="h-5 w-5 rounded-full object-cover ring-1 ring-blue-500/30 shadow-sm transition-transform duration-300 hover:scale-110"
            onError={(e) => {
              const target = e.currentTarget;
              const fallback = document.createElement('div');
              fallback.className = 'relative';
              fallback.innerHTML = `
                <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                </svg>
                <svg class="h-2 w-2 absolute -top-0.5 -right-0.5 text-blue-500 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3l14 9-9 3-5-12z"/>
                </svg>
              `;
              target.parentNode?.replaceChild(fallback, target);
            }}
          />
        </div>
        <span className="font-medium">Developed by</span>
      </div>
      <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-purple-600 hover:to-blue-600 transition-all duration-300">
        Mochammad Farhan Ali
      </span>
      {showYear && (
        <span className="text-gray-300">
          • {currentYear}
        </span>
      )}
    </div>
  );

  const renderDetailed = () => (
    <div className={`flex flex-col items-center gap-1 text-xs text-gray-400 opacity-70 hover:opacity-100 transition-all duration-300 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="relative">
          <CodeBracketIcon className="h-4 w-4" />
          <SparklesIcon className="h-2.5 w-2.5 absolute -top-0.5 -right-0.5 text-blue-500 opacity-70" />
        </div>
        <span className="font-medium">Crafted with</span>
        <HeartIcon className="h-3 w-3 text-red-400 fill-current" />
        <span className="font-medium">by</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="font-bold text-sm bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
          Mochammad Farhan Ali
        </span>
        {showYear && (
          <span className="text-gray-300 font-medium">
            © {currentYear}
          </span>
        )}
      </div>
    </div>
  );

  const renderSignature = () => (
    <div className={`flex items-center justify-center gap-3 text-xs text-gray-400 opacity-70 hover:opacity-100 transition-all duration-500 group ${className}`}>
      <div className="flex items-center gap-2">
        <div className="relative group-hover:scale-110 transition-transform duration-300">
          <img 
            src="/profile.jpeg" 
            alt="Mochammad Farhan Ali"
            className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/30 shadow-lg transition-all duration-300 group-hover:ring-blue-500/60"
            onError={(e) => {
              const target = e.currentTarget;
              const fallback = document.createElement('div');
              fallback.className = 'w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg';
              fallback.innerHTML = '<span class="text-white font-bold text-xs">MFA</span>';
              target.parentNode?.replaceChild(fallback, target);
            }}
          />
          <SparklesIcon className="h-2.5 w-2.5 absolute -top-0.5 -right-0.5 text-yellow-400 opacity-80 group-hover:opacity-100" />
          {/* Animated glow effect */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur -z-10"></div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-600">Mochammad Farhan Ali</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <CodeBracketIcon className="h-3 w-3" />
            <span>Full Stack Developer</span>
            {showYear && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-gray-300">{currentYear}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  switch (variant) {
    case 'detailed':
      return renderDetailed();
    case 'signature':
      return renderSignature();
    default:
      return renderMinimal();
  }
};

export default BrandingWatermark;
