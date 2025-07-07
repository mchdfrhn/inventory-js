import React from 'react';
import { CodeBracketIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface WatermarkProps {
  className?: string;
  variant?: 'footer' | 'floating' | 'sidebar';
  showIcon?: boolean;
}

const Watermark: React.FC<WatermarkProps> = ({ 
  className = '', 
  variant = 'footer',
  showIcon = true 
}) => {
  const baseClasses = "flex items-center justify-center gap-2 text-xs text-gray-400 opacity-60 hover:opacity-100 transition-all duration-300";
  
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
            <CodeBracketIcon className="h-3.5 w-3.5" />
            <SparklesIcon className="h-2 w-2 absolute -top-0.5 -right-0.5 text-blue-500 opacity-70" />
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
