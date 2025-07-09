import React from 'react';
import { createRoot } from 'react-dom/client';

// Test komponen yang sangat sederhana
const TestApp = () => {
  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#2563eb', marginBottom: '20px' }}>
          🚀 React App Working!
        </h1>
        <p style={{ color: '#666', fontSize: '18px' }}>
          This is a simple test to verify React is rendering correctly.
        </p>
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={() => alert('Button clicked!')}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Test Button
          </button>
        </div>
      </div>
    </div>
  );
};

// Render langsung tanpa router
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<TestApp />);
}
