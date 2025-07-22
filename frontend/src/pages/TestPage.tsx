export default function TestPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Page</h1>
      <p>Jika halaman ini muncul, berarti React berjalan dengan baik.</p>
      <div>
        <h2>API Test</h2>
        <button onClick={async () => {
          try {
            const response = await fetch('/api/v1/assets');
            const data = await response.json();
            alert(`API berhasil! Ditemukan ${data.data.length} aset`);
          } catch (error) {
            alert(`API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }}>
          Test API
        </button>
      </div>
    </div>
  );
}
