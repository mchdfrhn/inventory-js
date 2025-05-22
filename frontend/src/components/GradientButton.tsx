import { useState, useRef, useEffect } from 'react';
import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  withRipple?: boolean;
}

const variantClasses = {
  primary: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700',
  secondary: 'bg-gradient-to-r from-gray-500 to-gray-700 text-white hover:from-gray-600 hover:to-gray-800',
  success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700',
  danger: 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export default function GradientButton({ 
  children, 
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  withRipple = true,
  className = '',
  onClick,
  ...props 
}: GradientButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number, y: number, id: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Clean up ripples after animation completes
  useEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => {
        setRipples([]);
      }, 1000); // Clean up after 1 second
      
      return () => clearTimeout(timer);
    }
  }, [ripples]);
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (withRipple && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setRipples([
        ...ripples, 
        { x, y, id: Date.now() }
      ]);
    }
    
    if (onClick) {
      onClick(e);
    }
  };
  
  return (
    <button
      ref={buttonRef}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded-md font-medium shadow-md transition-all duration-300
        flex items-center justify-center
        hover:shadow-lg hover:-translate-y-0.5 hover:scale-102
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50
        active:scale-95 active:shadow-inner
        relative overflow-hidden backdrop-blur-sm
        before:absolute before:inset-0 before:opacity-0 before:bg-white/10 
        before:transition-opacity before:duration-300 hover:before:opacity-100
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:before:opacity-0
        ${className}
      `}
      onClick={handleClick}
      {...props}
    >
      {/* Ripple effects */}      {withRipple && ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/20"
          style={{
            top: ripple.y,
            left: ripple.x,
            width: '120px',
            height: '120px',
            marginLeft: '-60px',
            marginTop: '-60px',
            animation: 'ripple 0.8s ease-out forwards',
            opacity: 0
          }}
        />
      ))}
      {children}
    </button>
  );
}
