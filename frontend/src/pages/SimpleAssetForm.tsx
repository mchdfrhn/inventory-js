import React from 'react';

const SimpleAssetForm = () => {
  return (
    <div style={{ padding: '20px', margin: '20px' }}>
      <h1>Simple Asset Form</h1>
      <p>This is a simplified version of the asset form for debugging.</p>
      <form>
        <div>
          <label>
            Kode Aset:
            <input type="text" name="kode" />
          </label>
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>
            Nama Aset:
            <input type="text" name="nama" />
          </label>
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>
            Asal Pengadaan:
            <select name="asal_pengadaan">
              <option value="">-- Pilih Asal Pengadaan --</option>
              <option value="Pembelian">Pembelian</option>
              <option value="Bantuan">Bantuan</option>
              <option value="Hibah">Hibah</option>
              <option value="STTST">STTST</option>
            </select>
          </label>
        </div>
        <div style={{ marginTop: '20px' }}>
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default SimpleAssetForm;
