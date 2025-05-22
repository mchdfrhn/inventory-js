package main

import (
	"flag"
	"fmt"
	"log"
	"os"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/spf13/viper"
)

func main() {
	// Parse command line arguments
	up := flag.Bool("up", false, "Migrate up")
	down := flag.Bool("down", false, "Migrate down")
	flag.Parse()

	if !*up && !*down {
		flag.PrintDefaults()
		os.Exit(1)
	}

	// Load configuration
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err != nil {
		log.Fatal("Error reading config file:", err)
	}

	// Construct database URL
	dbURL := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s",
		viper.GetString("database.user"),
		viper.GetString("database.password"),
		viper.GetString("database.host"),
		viper.GetString("database.port"),
		viper.GetString("database.dbname"),
		viper.GetString("database.sslmode"),
	)

	// Initialize migrations
	m, err := migrate.New(
		"file://migrations",
		dbURL,
	)
	if err != nil {
		log.Fatal("Error creating migrate instance:", err)
	}
	defer m.Close()

	// Run migrations
	if *up {
		if err := m.Up(); err != nil && err != migrate.ErrNoChange {
			log.Fatal("Error migrating up:", err)
		}
		log.Println("Successfully migrated up")
	}

	if *down {
		if err := m.Down(); err != nil && err != migrate.ErrNoChange {
			log.Fatal("Error migrating down:", err)
		}
		log.Println("Successfully migrated down")
	}
}
