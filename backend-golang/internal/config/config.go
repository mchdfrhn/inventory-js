package config

import (
	"fmt"
	"os"

	"github.com/spf13/viper"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
}

type ServerConfig struct {
	Port string
	Mode string
}

type DatabaseConfig struct {
	Driver    string `mapstructure:"driver"` // postgres, mysql, sqlite
	Host      string `mapstructure:"host"`
	Port      string `mapstructure:"port"`
	User      string `mapstructure:"user"`
	Password  string `mapstructure:"password"`
	DBName    string `mapstructure:"dbname"`
	SSLMode   string `mapstructure:"sslmode"`
	Charset   string `mapstructure:"charset"`   // for MySQL
	ParseTime bool   `mapstructure:"parsetime"` // for MySQL
	Loc       string `mapstructure:"loc"`       // for MySQL
}

func LoadConfig() (*Config, error) {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AddConfigPath("./config")
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			return loadDefaultConfig()
		}
		return nil, err
	}

	var config Config
	err := viper.Unmarshal(&config)
	if err != nil {
		return nil, err
	}

	return &config, nil
}

func loadDefaultConfig() (*Config, error) {
	return &Config{
		Server: ServerConfig{
			Port: getEnv("PORT", "8080"),
			Mode: getEnv("GIN_MODE", "debug"),
		},
		Database: DatabaseConfig{
			Driver:    getEnv("DB_DRIVER", "postgres"),
			Host:      getEnv("DB_HOST", "localhost"),
			Port:      getEnv("DB_PORT", "5432"),
			User:      getEnv("DB_USER", "postgres"),
			Password:  getEnv("DB_PASSWORD", "postgres"),
			DBName:    getEnv("DB_NAME", "inventaris"),
			SSLMode:   getEnv("DB_SSLMODE", "disable"),
			Charset:   getEnv("DB_CHARSET", "utf8mb4"),
			ParseTime: getEnvBool("DB_PARSETIME", true),
			Loc:       getEnv("DB_LOC", "Local"),
		},
	}, nil
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	if value, exists := os.LookupEnv(key); exists {
		if value == "true" || value == "1" {
			return true
		}
		if value == "false" || value == "0" {
			return false
		}
	}
	return defaultValue
}

func (c *DatabaseConfig) GetDSN() string {
	switch c.Driver {
	case "mysql":
		return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=%s&parseTime=%t&loc=%s",
			c.User, c.Password, c.Host, c.Port, c.DBName, c.Charset, c.ParseTime, c.Loc)
	case "postgres":
		return fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Jakarta",
			c.Host, c.User, c.Password, c.DBName, c.Port, c.SSLMode)
	default:
		// Default to PostgreSQL
		return fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Jakarta",
			c.Host, c.User, c.Password, c.DBName, c.Port, c.SSLMode)
	}
}
