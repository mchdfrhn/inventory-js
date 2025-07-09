package models

import (
	"math"
	"time"

	"gorm.io/gorm"
)

type Asset struct {
	ID                  uint      `json:"id" gorm:"primaryKey"`
	Kode                string    `json:"kode" binding:"required"`
	Nama                string    `json:"nama" binding:"required"`
	Spesifikasi         string    `json:"spesifikasi"`
	Quantity            int       `json:"quantity" binding:"required"`
	Satuan              string    `json:"satuan" binding:"required"`
	TanggalPerolehan    time.Time `json:"tanggal_perolehan" binding:"required"`
	HargaPerolehan      float64   `json:"harga_perolehan" binding:"required"`
	UmurEkonomisTahun   int       `json:"umur_ekonomis_tahun" binding:"required"`
	UmurEkonomisBulan   int       `json:"umur_ekonomis_bulan"`  // Dihitung otomatis dari tahun
	AkumulasiPenyusutan float64   `json:"akumulasi_penyusutan"` // Dihitung otomatis
	NilaiSisa           float64   `json:"nilai_sisa"`           // Dihitung otomatis	Keterangan          string    `json:"keterangan"`
	Lokasi              string    `json:"lokasi"`
	AsalPengadaan       string    `json:"asal_pengadaan"` // Asal pengadaan aset
	LokasiID            *uint     `json:"lokasi_id"`      // Referensi ke model Lokasi
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}

func (a *Asset) BeforeCreate(tx *gorm.DB) error {
	a.CreatedAt = time.Now()
	a.UpdatedAt = time.Now()

	// Konversi umur ekonomis dari tahun ke bulan
	a.UmurEkonomisBulan = a.UmurEkonomisTahun * 12

	// Hitung akumulasi penyusutan dan nilai sisa
	a.hitungNilaiPenyusutan()

	return nil
}

func (a *Asset) BeforeUpdate(tx *gorm.DB) error {
	a.UpdatedAt = time.Now()

	// Konversi umur ekonomis dari tahun ke bulan
	a.UmurEkonomisBulan = a.UmurEkonomisTahun * 12

	// Hitung akumulasi penyusutan dan nilai sisa
	a.hitungNilaiPenyusutan()

	return nil
}

// Menghitung nilai penyusutan berdasarkan umur ekonomis dan masa pemakaian
func (a *Asset) hitungNilaiPenyusutan() {
	// Jika tanggal perolehan tidak diatur, gunakan waktu sekarang
	if a.TanggalPerolehan.IsZero() {
		a.TanggalPerolehan = time.Now()
	}

	// Hitung masa pemakaian dalam bulan
	now := time.Now()
	tahunPemakaian := now.Year() - a.TanggalPerolehan.Year()
	bulanPemakaian := int(now.Month() - a.TanggalPerolehan.Month())
	totalBulanPemakaian := tahunPemakaian*12 + bulanPemakaian

	// Pastikan tidak negatif jika tanggal perolehan di masa depan
	if totalBulanPemakaian < 0 {
		totalBulanPemakaian = 0
	}

	// Batas penyusutan tidak boleh melebihi umur ekonomis
	if totalBulanPemakaian > a.UmurEkonomisBulan {
		totalBulanPemakaian = a.UmurEkonomisBulan
	}

	// Hitung penyusutan per bulan
	if a.UmurEkonomisBulan > 0 {
		penyusutanPerBulan := a.HargaPerolehan / float64(a.UmurEkonomisBulan)
		a.AkumulasiPenyusutan = penyusutanPerBulan * float64(totalBulanPemakaian)
		a.AkumulasiPenyusutan = math.Round(a.AkumulasiPenyusutan*100) / 100 // Bulatkan ke 2 decimal
	} else {
		a.AkumulasiPenyusutan = 0
	}

	// Hitung nilai sisa
	a.NilaiSisa = a.HargaPerolehan - a.AkumulasiPenyusutan
	if a.NilaiSisa < 0 {
		a.NilaiSisa = 0
	}
	a.NilaiSisa = math.Round(a.NilaiSisa*100) / 100 // Bulatkan ke 2 decimal
}
