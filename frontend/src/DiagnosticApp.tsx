import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create simple test components
const HomePage = () => (
  <div style={{ padding: '20px', margin: '20px' }}>
    <h1>STTPU Inventory - Diagnostic Mode</h1>
    <p>If you can see this page, the basic React setup is working correctly.</p>
    <ul>
      <li><a href="/test">Go to test page</a></li>
    </ul>
  </div>
);

const TestPage = () => (
  <div style={{ padding: '20px', margin: '20px' }}>
    <h1>Test Page</h1>
    <p>This is a simple test page to confirm routing is working.</p>
    <a href="/">Back to home</a>
  </div>
);

// Setup simple query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function DiagnosticApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/test" element={<TestPage />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default DiagnosticApp;
