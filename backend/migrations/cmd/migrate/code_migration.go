package main

import (
"database/sql"
"fmt"
"os"

_ "github.com/lib/pq"
)

func main() {
// Get connection info from environment variables or use defaults
host := getEnvOrDefault("DB_HOST", "localhost")
port := getEnvOrDefault("DB_PORT", "5432")
user := getEnvOrDefault("DB_USER", "postgres")
password := getEnvOrDefault("DB_PASSWORD", "postgres")
dbname := getEnvOrDefault("DB_NAME", "inventory")

// Create connection string
connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
host, port, user, password, dbname)

// Connect to database
db, err := sql.Open("postgres", connStr)
if err != nil {
fmt.Fprintf(os.Stderr, "Error connecting to database: %v\n", err)
os.Exit(1)
}
defer db.Close()

// Check the connection
err = db.Ping()
if err != nil {
fmt.Fprintf(os.Stderr, "Error pinging database: %v\n", err)
os.Exit(1)
}

fmt.Println("Connected to the database successfully!")

// Step 1: Update categories without codes
fmt.Println("Updating categories without code...")
updateResult, err := db.Exec(`
UPDATE asset_categories 
SET code = 'CAT-' || SUBSTRING(id::text, 1, 8) 
WHERE code IS NULL OR code = ''
`)
if err != nil {
fmt.Fprintf(os.Stderr, "Error updating categories: %v\n", err)
os.Exit(1)
}

rowsAffected, _ := updateResult.RowsAffected()
fmt.Printf("Updated %d categories with codes\n", rowsAffected)

// Step 2: Alter the column to make it not null
fmt.Println("Making code column NOT NULL...")
_, err = db.Exec(`ALTER TABLE asset_categories ALTER COLUMN code SET NOT NULL`)
if err != nil {
fmt.Fprintf(os.Stderr, "Error making column NOT NULL: %v\n", err)
os.Exit(1)
}

// Step 3: Add unique constraint
fmt.Println("Adding unique constraint...")
_, err = db.Exec(`
DO $$
BEGIN
IF NOT EXISTS (
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name = 'asset_categories' AND constraint_name = 'asset_categories_code_unique'
) THEN
ALTER TABLE asset_categories ADD CONSTRAINT asset_categories_code_unique UNIQUE (code);
END IF;
END $$;
`)
if err != nil {
fmt.Fprintf(os.Stderr, "Error adding unique constraint: %v\n", err)
os.Exit(1)
}

// Step 4: Create an index for faster lookups
fmt.Println("Creating index...")
_, err = db.Exec(`
CREATE INDEX IF NOT EXISTS idx_asset_categories_code ON asset_categories(code)
`)
if err != nil {
fmt.Fprintf(os.Stderr, "Error creating index: %v\n", err)
os.Exit(1)
}

fmt.Println("Migration completed successfully!")
}

func getEnvOrDefault(key, defaultValue string) string {
value := os.Getenv(key)
if value == "" {
return defaultValue
}
return value
}
