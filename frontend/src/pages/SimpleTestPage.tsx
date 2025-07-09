import React from 'react';

const SimpleTestPage: React.FC = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Simple Test Page</h1>
      <p>If you can see this, React routing is working!</p>
      <div style={{ margin: '20px 0' }}>
        <a href="/" style={{ marginRight: '10px' }}>Home</a>
        <a href="/assets" style={{ marginRight: '10px' }}>Assets</a>
        <a href="/reports">Reports</a>
      </div>
    </div>
  );
};

export default SimpleTestPage;
