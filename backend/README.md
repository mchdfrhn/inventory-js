# Manajemen Inventaris

A clean architecture implementation of an inventory management system using Go and PostgreSQL.

## Features

- Asset management (CRUD operations)
- Asset categorization
- Asset depreciation calculation
- Financial value tracking
- Clean architecture implementation
- PostgreSQL database
- RESTful API using Gin framework
- Graceful shutdown
- Structured logging
- Configuration management
- CORS support
- Health check endpoint

## Asset Model

The system tracks the following asset attributes:

- **Kode**: Unique code for each asset
- **Nama**: Name of the asset
- **Spesifikasi**: Detailed specifications
- **Quantity**: Number of units
- **Satuan**: Unit of measurement (e.g. unit, pieces, meters)
- **Tanggal Perolehan**: Acquisition date 
- **Harga Perolehan**: Acquisition cost
- **Umur Ekonomis**: Economic life in years (stored as months)
- **Akumulasi Penyusutan**: Accumulated depreciation (calculated automatically)
- **Nilai Sisa**: Remaining value (calculated automatically)
- **Keterangan**: Additional notes
- **Lokasi**: Physical location of the asset

## Prerequisites

- Go 1.21 or later
- Docker and Docker Compose
- Make (optional, for using Makefile commands)

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/manajemen-inventaris.git
cd manajemen-inventaris
```

2. Start the PostgreSQL database:
```bash
docker-compose up -d
```

3. Run database migrations:
```bash
# Apply migrations
go run cmd/migrate/main.go -up

# To rollback migrations if needed
go run cmd/migrate/main.go -down
```

4. Run the application:
```bash
go run cmd/main.go
```

## API Endpoints

### Assets
- `POST /api/v1/assets` - Create a new asset
- `PUT /api/v1/assets/:id` - Update an asset
- `DELETE /api/v1/assets/:id` - Delete an asset
- `GET /api/v1/assets/:id` - Get asset details
- `GET /api/v1/assets` - List assets (with optional filters)

### Categories
- `POST /api/v1/categories` - Create a new category
- `PUT /api/v1/categories/:id` - Update a category
- `DELETE /api/v1/categories/:id` - Delete a category
- `GET /api/v1/categories/:id` - Get category details
- `GET /api/v1/categories` - List all categories

### Health Check
- `GET /health` - Check application health

## API Documentation

For detailed API documentation, please see [API.md](API.md).

## Configuration

Configuration can be done through environment variables or the `config.yaml` file:

```yaml
server:
  port: "8080"
  mode: "debug"

database:
  host: "localhost"
  port: "5432"
  user: "postgres"
  password: "postgres"
  dbname: "inventaris"
  sslmode: "disable"
```

## Development

Common development commands:

```bash
# Build the application
go build -o manajemen-inventaris cmd/main.go

# Run tests
go test ./...

# Start database
docker-compose up -d

# Stop database
docker-compose down

# View database logs
docker-compose logs -f

# Run migrations up
go run cmd/migrate/main.go -up

# Run migrations down
go run cmd/migrate/main.go -down
```

## Project Structure

```
.
├── cmd/
│   └── main.go
├── internal/
│   ├── config/
│   ├── delivery/
│   │   └── http/
│   ├── domain/
│   ├── repository/
│   └── usecase/
├── config.yaml
├── docker-compose.yml
├── Makefile
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
