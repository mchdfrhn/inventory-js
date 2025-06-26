package main

import (
	"fmt"
)

// Simulate the unit check logic from frontend
func shouldCreateBulk(quantity int, satuan string, isEditMode bool) bool {
	if isEditMode || quantity <= 1 {
		return false
	}

	bulkEligibleUnits := []string{"unit", "pcs", "set", "buah"}
	for _, eligible := range bulkEligibleUnits {
		if satuan == eligible {
			return true
		}
	}

	return false
}

func main() {
	fmt.Println("🧪 TESTING UNIT-SPECIFIC BULK ASSET CREATION")
	fmt.Println("===========================================")

	testCases := []struct {
		quantity int
		satuan   string
		expected bool
		scenario string
	}{
		{5, "unit", true, "Unit - should create bulk"},
		{3, "pcs", true, "Pcs - should create bulk"},
		{10, "set", true, "Set - should create bulk"},
		{2, "buah", true, "Buah - should create bulk"},
		{5, "meter", false, "Meter - should NOT create bulk"},
		{3, "kg", false, "Kilogram - should NOT create bulk"},
		{10, "liter", false, "Liter - should NOT create bulk"},
		{1, "unit", false, "Unit quantity 1 - should NOT create bulk"},
		{1, "meter", false, "Meter quantity 1 - should NOT create bulk"},
	}

	allPassed := true

	for i, tc := range testCases {
		result := shouldCreateBulk(tc.quantity, tc.satuan, false)
		status := "✅"
		if result != tc.expected {
			status = "❌"
			allPassed = false
		}

		fmt.Printf("%s Test %d: %s\n", status, i+1, tc.scenario)
		fmt.Printf("    Quantity: %d, Satuan: %s\n", tc.quantity, tc.satuan)
		fmt.Printf("    Expected: %t, Got: %t\n", tc.expected, result)
		fmt.Println()
	}

	fmt.Println("🎯 SUMMARY:")
	fmt.Println("===========")
	if allPassed {
		fmt.Println("✅ ALL TESTS PASSED!")
		fmt.Println("✅ Bulk asset creation logic works correctly for unit-specific requirements")
		fmt.Println("✅ Discrete units (unit, pcs, set, buah) → Create bulk assets")
		fmt.Println("✅ Measurement units (meter, kg, liter) → Single asset only")
	} else {
		fmt.Println("❌ SOME TESTS FAILED!")
		fmt.Println("❌ Review the logic implementation")
	}
}
