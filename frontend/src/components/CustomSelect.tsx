import React, { type SelectHTMLAttributes, useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface CustomSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
  icon?: React.ReactNode;
  isFloatingLabel?: boolean;
  placeholder?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ 
  children, 
  label, 
  error, 
  helpText,
  icon,
  isFloatingLabel = false,
  className, 
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(props.value !== undefined && props.value !== '');
  
  // Check if select has a value on mount and when value changes
  useEffect(() => {
    if (props.value !== undefined) {
      setHasValue(props.value !== '');
    }
  }, [props.value]);
  
  return (
    <div className="relative">
      {label && !isFloatingLabel && (
        <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className={`relative transition-all duration-200 ${isFocused ? 'transform scale-[1.01]' : ''}`}>
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 z-10">
            <div className={`transition-colors duration-300 ${isFocused ? 'text-blue-500' : 'text-gray-400'}`}>
              {icon}
            </div>
          </div>
        )}
        
        <select
          className={`custom-select block w-full rounded-md border-gray-300 pr-10 ${icon ? 'pl-10' : ''} shadow-sm 
            focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-300 
            hover:border-blue-300 hover:shadow
            ${isFocused ? 'border-blue-500 ring-1 ring-blue-500' : ''} 
            ${isFloatingLabel && hasValue ? 'pt-4 pb-1' : ''}
            ${className || ''}`}
          style={{
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            appearance: 'none',
            backgroundImage: 'none',
            paddingRight: '2.5rem' // Ensure arrow indicator has enough space
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => {
            setHasValue(e.target.value !== '');
            if (props.onChange) props.onChange(e);
          }}
          {...props}
        >
          {children}
        </select>
        
        <div 
          className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
          aria-hidden="true"
        >
          <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-300 
            ${isFocused ? 'bg-blue-100' : 'bg-transparent'}`}>
            <ChevronDownIcon 
              className={`h-4 w-4 text-gray-500 transition-all duration-300 ease-in-out 
              ${isFocused ? 'text-blue-600 transform rotate-180' : ''}`} 
            />
          </div>
        </div>
        
        {label && isFloatingLabel && (
          <label 
            htmlFor={props.id} 
            className={`absolute transform transition-all duration-300 text-xs font-medium pointer-events-none
              ${isFocused || hasValue ? '-top-2 left-2 px-1 scale-100 text-blue-500 bg-white' : 'top-1/2 left-3 -translate-y-1/2 text-gray-500 opacity-70'}
              ${icon ? (isFocused || hasValue ? 'left-2' : 'left-10') : ''}
            `}
          >
            {label}
          </label>
        )}
      </div>
      
      {error && (
        <div className="mt-1 flex items-center space-x-1.5 animate-fadeIn">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-medium text-red-600">{error}</p>        </div>
      )}
      
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          {helpText}
        </p>
      )}
    </div>
  );
};

export default CustomSelect;
