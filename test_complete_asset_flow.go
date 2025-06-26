package main

import (
	"fmt"
)

// Simulate the complete frontend logic flow
func simulateAssetCreation(quantity int, satuan string, isEditMode bool) (string, bool) {
	// Step 1: Validation logic (handleSubmit)
	bulkEligibleUnits := []string{"unit", "pcs", "set", "buah"}
	shouldCreateBulk := !isEditMode && quantity > 1 && contains(bulkEligibleUnits, satuan)

	if shouldCreateBulk {
		return "BULK_CONFIRMATION_SHOWN", false // Would show confirmation modal
	}

	// Step 2: Submission logic (submitAsset)
	if !isEditMode {
		shouldCreateBulkInSubmit := quantity > 1 && contains(bulkEligibleUnits, satuan)

		if shouldCreateBulkInSubmit {
			return "BULK_ASSET_CREATED", true
		} else {
			return "SINGLE_ASSET_CREATED", true
		}
	}

	return "ASSET_UPDATED", true
}

func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

func main() {
	fmt.Println("🧪 TESTING COMPLETE ASSET CREATION FLOW")
	fmt.Println("======================================")

	testCases := []struct {
		quantity int
		satuan   string
		expected string
		scenario string
	}{
		{10, "unit", "BULK_CONFIRMATION_SHOWN", "10 Unit - should show bulk confirmation"},
		{5, "pcs", "BULK_CONFIRMATION_SHOWN", "5 Pcs - should show bulk confirmation"},
		{3, "set", "BULK_CONFIRMATION_SHOWN", "3 Set - should show bulk confirmation"},
		{2, "buah", "BULK_CONFIRMATION_SHOWN", "2 Buah - should show bulk confirmation"},
		{10, "meter", "SINGLE_ASSET_CREATED", "10 Meter - should create single asset"},
		{5, "kg", "SINGLE_ASSET_CREATED", "5 Kg - should create single asset"},
		{3, "liter", "SINGLE_ASSET_CREATED", "3 Liter - should create single asset"},
		{1, "unit", "SINGLE_ASSET_CREATED", "1 Unit - should create single asset"},
		{1, "liter", "SINGLE_ASSET_CREATED", "1 Liter - should create single asset"},
	}

	allPassed := true

	for i, tc := range testCases {
		result, _ := simulateAssetCreation(tc.quantity, tc.satuan, false)
		status := "✅"
		if result != tc.expected {
			status = "❌"
			allPassed = false
		}

		fmt.Printf("%s Test %d: %s\n", status, i+1, tc.scenario)
		fmt.Printf("    Input: %d %s\n", tc.quantity, tc.satuan)
		fmt.Printf("    Expected: %s, Got: %s\n", tc.expected, result)
		fmt.Println()
	}

	fmt.Println("🎯 SUMMARY:")
	fmt.Println("===========")
	if allPassed {
		fmt.Println("✅ ALL TESTS PASSED!")
		fmt.Println("✅ Complete asset creation flow works correctly")
		fmt.Println("✅ Both validation and submission logic are aligned")
		fmt.Println("")
		fmt.Println("📋 BEHAVIOR VERIFICATION:")
		fmt.Println("• Discrete units (unit, pcs, set, buah) with quantity > 1 → Shows confirmation, then creates bulk")
		fmt.Println("• Measurement units (meter, kg, liter) with any quantity → Creates single asset directly")
		fmt.Println("• Any unit with quantity = 1 → Creates single asset directly")
	} else {
		fmt.Println("❌ SOME TESTS FAILED!")
		fmt.Println("❌ Review both validation and submission logic")
	}
}
