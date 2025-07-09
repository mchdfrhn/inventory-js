package dto

// AssetStatus represents valid asset statuses
type AssetStatus string

const (
	StatusBaik         AssetStatus = "baik"
	StatusRusak        AssetStatus = "rusak"
	StatusTidakMemadai AssetStatus = "tidak_memadai"
	// Keep old status values for backward compatibility
	StatusAvailable   AssetStatus = "available"
	StatusInUse       AssetStatus = "in_use"
	StatusMaintenance AssetStatus = "maintenance"
	StatusDisposed    AssetStatus = "disposed"
)

// IsValid checks if the status is valid
func (s AssetStatus) IsValid() bool {
	switch s {
	case StatusBaik, StatusRusak, StatusTidakMemadai,
		StatusAvailable, StatusInUse, StatusMaintenance, StatusDisposed:
		return true
	}
	return false
}

// String returns the string representation of the status
func (s AssetStatus) String() string {
	return string(s)
}
