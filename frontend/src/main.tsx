import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './assets/glass-styles-fixed.css' // Fixed modern UI styles with glass morphism
import App from './App.tsx'

// Simple error boundary for debugging
import { Component } from 'react';

class ErrorBoundary extends Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  state: { hasError: boolean; error: Error | null } = { hasError: false, error: null };
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("React Error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px', 
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#f9fafb'
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h1 style={{ 
                color: '#dc2626', 
                fontSize: '24px', 
                marginBottom: '10px',
                fontWeight: 'bold'
              }}>
                🚫 Application Error
              </h1>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>
                Something went wrong! Please refresh the page or contact support.
              </p>
            </div>
            
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <pre style={{ 
                color: '#991b1b', 
                fontSize: '12px', 
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                margin: 0,
                fontFamily: 'monospace'
              }}>
                {this.state.error?.toString()}
              </pre>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                🔄 Refresh Page
              </button>
            </div>
          </div>
          
          {/* Watermark for error page */}
          <div style={{ 
            marginTop: '20px', 
            textAlign: 'center', 
            fontSize: '12px', 
            color: '#9ca3af',
            opacity: 0.7
          }}>
            🔧 Developed by <strong style={{ color: '#2563eb' }}>Mochammad Farhan Ali</strong>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Create root with error handling
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Failed to find the root element')
}

console.log('Starting React app...');

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
