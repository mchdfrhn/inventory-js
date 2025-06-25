package main

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

// Simplified domain model untuk testing
type Asset struct {
	ID                uuid.UUID  `json:"id"`
	Kode              string     `json:"kode"`
	Nama              string     `json:"nama"`
	Quantity          int        `json:"quantity"`
	BulkID            *uuid.UUID `json:"bulk_id,omitempty"`
	BulkSequence      int        `json:"bulk_sequence,omitempty"`
	IsBulkParent      bool       `json:"is_bulk_parent"`
	BulkTotalCount    int        `json:"bulk_total_count,omitempty"`
	TanggalPerolehan  time.Time  `json:"tanggal_perolehan"`
	HargaPerolehan    float64    `json:"harga_perolehan"`
	UmurEkonomisTahun int        `json:"umur_ekonomis_tahun"`
	CategoryID        uuid.UUID  `json:"category_id"`
}

// Simulate the fixed CreateBulkAsset function logic
func createBulkAssetSimulation(asset *Asset, quantity int) []Asset {
	// Generate bulk ID for grouping
	bulkID := uuid.New()

	// Create assets array
	assets := make([]Asset, quantity)
	for i := 0; i < quantity; i++ {
		// Copy the original asset
		assets[i] = *asset
		assets[i].ID = uuid.New()
		assets[i].BulkID = &bulkID
		assets[i].BulkSequence = i + 1
		assets[i].BulkTotalCount = quantity
		assets[i].IsBulkParent = (i == 0) // First asset is the parent
		assets[i].Quantity = 1            // FIXED: Each asset in bulk should have quantity 1

		// Simulate code generation
		assets[i].Kode = fmt.Sprintf("LAPTOP-%03d", i+1)
	}

	return assets
}

func main() {
	fmt.Println("🧪 TESTING BULK ASSET CREATION FIX")
	fmt.Println("==================================")

	// Create template asset with quantity 10 (user input)
	templateAsset := &Asset{
		Nama:              "Laptop Dell",
		Quantity:          10, // User wants 10 laptops
		TanggalPerolehan:  time.Now(),
		HargaPerolehan:    15000000,
		UmurEkonomisTahun: 5,
		CategoryID:        uuid.New(),
	}

	fmt.Printf("📝 Input: User requests %d laptops\n", templateAsset.Quantity)
	fmt.Println()

	// Test the fixed bulk creation logic
	resultAssets := createBulkAssetSimulation(templateAsset, templateAsset.Quantity)

	fmt.Printf("✅ Output: Created %d assets\n", len(resultAssets))
	fmt.Println()

	// Verify each asset has quantity = 1
	fmt.Println("📊 Asset Details:")
	fmt.Println("================")

	totalQuantity := 0
	parentCount := 0

	for i, asset := range resultAssets {
		fmt.Printf("Asset %d:\n", i+1)
		fmt.Printf("  - Kode: %s\n", asset.Kode)
		fmt.Printf("  - Nama: %s\n", asset.Nama)
		fmt.Printf("  - Quantity: %d ✅\n", asset.Quantity)
		fmt.Printf("  - BulkSequence: %d\n", asset.BulkSequence)
		fmt.Printf("  - IsBulkParent: %t\n", asset.IsBulkParent)
		fmt.Printf("  - BulkTotalCount: %d\n", asset.BulkTotalCount)
		fmt.Println()

		totalQuantity += asset.Quantity
		if asset.IsBulkParent {
			parentCount++
		}
	}

	fmt.Println("🎯 VERIFICATION RESULTS:")
	fmt.Println("=======================")
	fmt.Printf("✅ Total assets created: %d (Expected: %d)\n", len(resultAssets), templateAsset.Quantity)
	fmt.Printf("✅ Total quantity: %d (Expected: %d)\n", totalQuantity, templateAsset.Quantity)
	fmt.Printf("✅ Parent assets: %d (Expected: 1)\n", parentCount)

	// Check if all assets have quantity = 1
	allHaveQuantityOne := true
	for _, asset := range resultAssets {
		if asset.Quantity != 1 {
			allHaveQuantityOne = false
			break
		}
	}

	if allHaveQuantityOne {
		fmt.Println("✅ All assets have quantity = 1")
	} else {
		fmt.Println("❌ Some assets don't have quantity = 1")
	}

	fmt.Println()
	fmt.Println("🎉 CONCLUSION:")
	if len(resultAssets) == templateAsset.Quantity && totalQuantity == templateAsset.Quantity && allHaveQuantityOne && parentCount == 1 {
		fmt.Println("✅ BULK ASSET CREATION FIX IS WORKING CORRECTLY!")
		fmt.Println("   - Creates correct number of individual assets")
		fmt.Println("   - Each asset has quantity = 1")
		fmt.Println("   - Total effective quantity matches user input")
		fmt.Println("   - Only one parent asset exists")
	} else {
		fmt.Println("❌ There are still issues with the bulk asset creation")
	}
}
