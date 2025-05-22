import { useState } from 'react';
import type { ReactNode } from 'react';

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  interactive?: boolean;
  elevation?: 'low' | 'medium' | 'high';
  borderGlow?: boolean;
};

// Enhanced Glass Card component with interactive effects
export default function GlassCard({ 
  children, 
  className = '', 
  hover = true,
  interactive = false,
  elevation = 'medium',
  borderGlow = false,
}: GlassCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const elevationClasses = {
    low: 'shadow-sm',
    medium: 'shadow-md',
    high: 'shadow-lg',
  };
  
  return (
    <div 
      className={`
        glass-card rounded-lg p-5 
        ${elevationClasses[elevation]}
        ${hover ? 'hover-float' : ''}
        ${interactive ? 'cursor-pointer transform transition-all duration-300' : ''}
        ${borderGlow && isHovered ? 'border-glow' : ''}
        relative
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      
      {/* Subtle corner accents */}
      {hover && (
        <>
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 rounded-tl-lg border-opacity-30 border-blue-400"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 rounded-br-lg border-opacity-30 border-blue-400"></div>
        </>
      )}
    </div>
  );
}
