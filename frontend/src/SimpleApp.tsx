import { BrowserRouter, Routes, Route } from 'react-router-dom';

const SimpleApp = () => {
  return (
    <BrowserRouter>
      <div style={{ padding: '20px' }}>
        <h1>Simple App Test</h1>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/test" element={<div>Test Page</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default SimpleApp;
