import { Outlet } from 'react-router-dom'

const SimpleLayout = () => {
  console.log('SimpleLayout rendering...');
  
  return (
    <div style={{ padding: '20px', background: 'white', minHeight: '100vh' }}>
      <h1 style={{ color: 'black', fontSize: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        🏗️ Simple Layout
      </h1>
      <div style={{ marginTop: '20px' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default SimpleLayout;
