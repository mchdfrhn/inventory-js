import { useEffect, useState } from 'react';
import Watermark from './Watermark';

type LoaderProps = {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'gray' | 'white' | 'gradient';
  message?: string;
  className?: string;
  showWatermark?: boolean;
};

const sizeMap = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-3',
  lg: 'h-12 w-12 border-4',
};

const colorMap = {
  blue: 'border-blue-500 shadow-blue-500/30',
  gray: 'border-gray-500 shadow-gray-500/30',
  white: 'border-white shadow-white/20',
  gradient: 'border-gradient-loader shadow-blue-500/30',
};

export default function Loader({ size = 'md', color = 'gradient', message = '', className = '', showWatermark = false }: LoaderProps) {
  const [dots, setDots] = useState('.');
  const [showDelayedWatermark, setShowDelayedWatermark] = useState(false);
  
  // Animated dots for loading message
  useEffect(() => {
    if (!message) return;
    
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '.' : prev + '.');
    }, 500);
    
    return () => clearInterval(interval);
  }, [message]);

  // Show watermark after 3 seconds of loading
  useEffect(() => {
    if (!showWatermark) return;
    
    const timer = setTimeout(() => {
      setShowDelayedWatermark(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [showWatermark]);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <div
          className={`
            ${sizeMap[size]} 
            ${colorMap[color]} 
            animate-spin rounded-full border-t-transparent
            shadow-[0_0_15px_rgba(0,0,0,0.1)]
            transition-all duration-300
          `}
        />
        {color === 'gradient' && (
          <div className="absolute inset-0 -z-10 animate-pulse">
            <div className={`${sizeMap[size]} rounded-full bg-gradient-to-r from-blue-400 to-blue-600 blur-[8px] opacity-40`} />
          </div>
        )}
      </div>
      {message && (
        <p className="mt-4 text-sm font-medium text-gray-600 fade-in">
          {message}
          <span className="inline-block w-[24px]">{dots}</span>
        </p>
      )}
      {showDelayedWatermark && (
        <div className="mt-8 animate-fade-in">
          <Watermark className="opacity-50" />
        </div>
      )}
    </div>
  );
}
