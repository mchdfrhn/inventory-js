const TestPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Test Page</h1>
      <p className="text-gray-600 mb-4">
        Jika halaman ini muncul, berarti aplikasi berjalan dengan baik.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">✅ React app berhasil dimuat</p>
        <p className="text-blue-800">✅ Tailwind CSS bekerja</p>
        <p className="text-blue-800">✅ Routing berfungsi</p>
      </div>
    </div>
  );
};

export default TestPage;
