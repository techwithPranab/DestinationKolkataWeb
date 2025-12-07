#!/bin/bash

# Script to update all fetch calls to use backend API URL

echo "Updating API calls to use backend URL..."

# Files to update
files=(
  "src/app/admin/report-issues/page.tsx"
  "src/app/admin/settings/page.tsx"
  "src/app/admin/restaurants/page.tsx"
  "src/app/admin/visiting-places/page.tsx"
  "src/app/admin/feedback/page.tsx"
  "src/app/admin/reset-password/page.tsx"
  "src/app/admin/data-ingestion/page.tsx"
  "src/app/admin/reviews/page.tsx"
  "src/app/customer/checkout/page.tsx"
  "src/app/customer/create/restaurant/page.tsx"
  "src/app/customer/create/hotel/page.tsx"
  "src/components/shared/ImageUpload.tsx"
)

# Update import statements
for file in "${files[@]}"; do
  if [[ -f "$file" ]]; then
    echo "Processing $file..."
    
    # Add fetchAPI import if not already present
    if ! grep -q "import.*fetchAPI.*from '@/lib/backend-api'" "$file"; then
      # Find the last import line and add the new import after it
      sed -i '' '/^import.*from/a\
import { fetchAPI } from '\''@/lib/backend-api'\''
' "$file"
    fi
    
    # Replace fetch('/api with fetchAPI('/api
    sed -i '' 's/fetch(\'\([^'\'']*\/api[^'\'']*\'\)/fetchAPI(\'\1/g' "$file"
    
    echo "Updated $file"
  else
    echo "File not found: $file"
  fi
done

echo "All files updated!"
