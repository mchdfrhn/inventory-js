import React from 'react';

const MinimalTest = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: '#f0f0f0'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ color: '#2563eb', margin: 0 }}>Test berhasil!</h1>
        <p style={{ color: '#666', marginTop: '10px' }}>
          React app berjalan dengan baik di port 5173
        </p>
      </div>
    </div>
  );
};

export default MinimalTest;
