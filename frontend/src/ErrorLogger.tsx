import { useEffect } from 'react';

/**
 * Component that logs errors to a visible element on the page
 */
export function ErrorLogger() {
  useEffect(() => {
    // Store the original console.error
    const originalError = console.error;
    
    // Create an element to display errors
    const errorContainer = document.createElement('div');
    errorContainer.id = 'error-container';
    errorContainer.style.position = 'fixed';
    errorContainer.style.bottom = '10px';
    errorContainer.style.right = '10px';
    errorContainer.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
    errorContainer.style.color = 'white';
    errorContainer.style.padding = '10px';
    errorContainer.style.borderRadius = '5px';
    errorContainer.style.maxWidth = '80%';
    errorContainer.style.maxHeight = '50%';
    errorContainer.style.overflowY = 'auto';
    errorContainer.style.zIndex = '9999';
    document.body.appendChild(errorContainer);
    
    // Override console.error
    console.error = (...args) => {
      // Call the original console.error
      originalError.apply(console, args);
      
      // Add the error to our container
      const errorDiv = document.createElement('div');
      errorDiv.style.borderBottom = '1px solid white';
      errorDiv.style.paddingBottom = '5px';
      errorDiv.style.marginBottom = '5px';
      
      // Convert all arguments to string
      const errorText = args.map(arg => {
        if (typeof arg === 'string') {
          return arg;
        } else if (arg instanceof Error) {
          return arg.message + '\n' + arg.stack;
        } else {
          try {
            return JSON.stringify(arg, null, 2);
          } catch (e) {
            return String(arg);
          }
        }
      }).join(' ');
      
      errorDiv.textContent = errorText;
      errorContainer.appendChild(errorDiv);
    };
    
    // Clean up
    return () => {
      console.error = originalError;
      if (document.body.contains(errorContainer)) {
        document.body.removeChild(errorContainer);
      }
    };
  }, []);
  
  return null;
}
