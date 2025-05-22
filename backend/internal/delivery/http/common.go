package http

// ErrorResponse represents a common error response format
type ErrorResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
}
