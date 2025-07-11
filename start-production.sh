#!/bin/bash

# Production startup script for deployment
set -e

echo "Starting production deployment..."

# Set environment variables
export NODE_ENV=production
export PORT=${PORT:-5000}

# Check if build directory exists
if [ ! -d "dist" ]; then
  echo "Build directory not found. Running build..."
  npm run build
fi

# Check if database is accessible
if [ -n "$DATABASE_URL" ]; then
  echo "Database URL configured: $DATABASE_URL"
  # Push database schema if needed
  npm run db:push || echo "Database push failed, continuing..."
else
  echo "Warning: DATABASE_URL not set"
fi

# Start the application
echo "Starting application on port $PORT..."
npm run start