export default function SimpleDashboard() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Simple Dashboard</h1>
      <p>Dashboard sederhana untuk testing.</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Status: Dashboard berhasil dimuat!</h2>
        <p>Waktu: {new Date().toLocaleString('id-ID')}</p>
      </div>
    </div>
  );
}
