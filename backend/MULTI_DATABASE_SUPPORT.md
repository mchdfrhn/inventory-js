# Multi-Database Support Documentation

Aplikasi Inventory Management System ini telah dikonfigurasi untuk mendukung beberapa jenis database yang berbeda. Saat ini mendukung:

- **PostgreSQL** (default)
- **MySQL**
- **SQLite**

## Konfigurasi Database

### 1. Konfigurasi via File YAML

Anda dapat menggunakan file konfigurasi yang berbeda untuk setiap database:

#### PostgreSQL (config.yaml)
```yaml
database:
  driver: "postgres"
  host: "localhost"
  port: "5432"
  user: "postgres"
  password: "your_password"
  dbname: "inventaris"
  sslmode: "disable"
```

#### MySQL (config.mysql.yaml)
```yaml
database:
  driver: "mysql"
  host: "localhost"
  port: "3306"
  user: "root"
  password: "your_password"
  dbname: "inventaris"
  charset: "utf8mb4"
  parsetime: true
  loc: "Local"
```

#### SQLite (config.sqlite.yaml)
```yaml
database:
  driver: "sqlite"
  dbname: "inventaris"  # Akan membuat file inventaris.db
```

### 2. Konfigurasi via Environment Variables

Anda juga dapat menggunakan environment variables:

```bash
# Database driver
export DB_DRIVER=mysql

# Database connection
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=root
export DB_PASSWORD=your_password
export DB_NAME=inventaris

# MySQL specific
export DB_CHARSET=utf8mb4
export DB_PARSETIME=true
export DB_LOC=Local
```

## Cara Menjalankan dengan Database Berbeda

### 1. PostgreSQL (Default)
```bash
go run cmd/main.go
```

### 2. MySQL
```bash
# Menggunakan file konfigurasi MySQL
cp config.mysql.yaml config.yaml
go run cmd/main.go

# Atau menggunakan environment variables
export DB_DRIVER=mysql
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=root
export DB_PASSWORD=your_password
go run cmd/main.go
```

### 3. SQLite
```bash
# Menggunakan file konfigurasi SQLite
cp config.sqlite.yaml config.yaml
go run cmd/main.go

# Atau menggunakan environment variables
export DB_DRIVER=sqlite
export DB_NAME=inventaris
go run cmd/main.go
```

## Fitur Database-Agnostic

### 1. Migration Otomatis
Sistem akan secara otomatis membuat tabel dan struktur database yang sesuai dengan driver database yang dipilih.

### 2. Query Builder
Aplikasi menggunakan query builder yang dapat menyesuaikan query SQL berdasarkan jenis database:

- **PostgreSQL**: Menggunakan `ILIKE` dan `to_tsvector` untuk full-text search
- **MySQL**: Menggunakan `MATCH...AGAINST` untuk full-text search
- **SQLite**: Menggunakan `LIKE` dengan `COLLATE NOCASE`

### 3. Index Optimized
Setiap database akan mendapatkan index yang dioptimalkan sesuai dengan kemampuannya:

- **PostgreSQL**: GIN index untuk full-text search
- **MySQL**: FULLTEXT index
- **SQLite**: Standard B-tree index

## Migrasi Antar Database

### Dari PostgreSQL ke MySQL

1. Export data dari PostgreSQL:
```bash
pg_dump -U postgres -h localhost inventaris > backup.sql
```

2. Ubah konfigurasi ke MySQL
3. Import data ke MySQL (mungkin perlu modifikasi syntax)

### Dari MySQL ke PostgreSQL

1. Export data dari MySQL:
```bash
mysqldump -u root -p inventaris > backup.sql
```

2. Ubah konfigurasi ke PostgreSQL
3. Import data ke PostgreSQL (mungkin perlu modifikasi syntax)

## Performance Considerations

### PostgreSQL
- Optimal untuk aplikasi dengan banyak concurrent users
- Excellent full-text search capabilities
- Better for complex queries

### MySQL
- Good performance untuk read-heavy workloads
- Wide hosting support
- Good replication features

### SQLite
- Perfect untuk development dan small deployments
- No server setup required
- Single file database

## Deployment Recommendations

### Development
Gunakan SQLite untuk kemudahan setup dan testing.

### Production - Small to Medium Scale
PostgreSQL atau MySQL tergantung preferensi dan hosting environment.

### Production - Large Scale
PostgreSQL recommended untuk fitur advanced dan scalability.

## Troubleshooting

### Database Connection Issues
1. Pastikan database server berjalan
2. Periksa credentials dan network connectivity
3. Verify database exists

### Migration Issues
1. Check database permissions
2. Verify table doesn't exist manually
3. Check database logs

### Performance Issues
1. Monitor query execution time
2. Check if indexes are properly created
3. Consider database-specific optimizations

## Dependencies

Aplikasi menggunakan GORM dengan driver berikut:
- `gorm.io/driver/postgres` untuk PostgreSQL
- `gorm.io/driver/mysql` untuk MySQL
- `gorm.io/driver/sqlite` untuk SQLite

Semua dependency sudah included dalam go.mod file.
