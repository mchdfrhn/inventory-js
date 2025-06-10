#!/bin/bash

# Get all assets and delete them one by one
curl -X GET "http://localhost:8080/api/v1/assets?page_size=100" | \
jq -r '.data[].id' | \
while read asset_id; do
    echo "Deleting asset: $asset_id"
    curl -X DELETE "http://localhost:8080/api/v1/assets/$asset_id"
    echo ""
done

echo "All assets deleted. Checking if database is empty..."
curl -X GET "http://localhost:8080/api/v1/assets"
