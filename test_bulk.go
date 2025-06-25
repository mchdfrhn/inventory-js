package main

import (
	"fmt"
	"os"
	"strconv"
)

// Test function to simulate the issue
func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run test_bulk.go <bulk_count>")
		os.Exit(1)
	}

	count, err := strconv.Atoi(os.Args[1])
	if err != nil {
		fmt.Printf("Error parsing count: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("Simulating bulk update for %d assets:\n", count)

	// Simulate the bulk update process
	templateName := "Updated Asset Name"

	for i := 0; i < count; i++ {
		assetCode := fmt.Sprintf("L001.IT.1.25.%03d", i+1)
		oldName := fmt.Sprintf("Old Asset %d", i+1)

		fmt.Printf("Asset %d: %s -> %s (Code: %s)\n", i+1, oldName, templateName, assetCode)

		// Simulate update
		fmt.Printf("  ✓ Updated asset %d successfully\n", i+1)
	}

	fmt.Printf("\nBulk update completed for %d assets\n", count)
}
