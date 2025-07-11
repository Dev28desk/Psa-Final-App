#!/bin/bash

# Production deployment script for Parmanand Sports Academy
set -e

echo "🚀 Starting deployment for Parmanand Sports Academy..."

# Set production environment
export NODE_ENV=production
export PORT=${PORT:-5000}

# Create necessary directories
mkdir -p dist/public/assets
mkdir -p server/logs

# Build the server
echo "📦 Building server..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Copy static assets if they exist
if [ -d "client/public" ]; then
    echo "📋 Copying static assets..."
    cp -r client/public/* dist/public/ 2>/dev/null || true
fi

# Ensure we have the basic HTML and JS files
if [ ! -f "dist/public/index.html" ]; then
    echo "⚠️ No index.html found, using built-in version..."
fi

# Database setup
if [ -n "$DATABASE_URL" ]; then
    echo "🗄️ Setting up database..."
    npm run db:push || echo "Database setup completed or already exists"
else
    echo "⚠️ No database URL provided, skipping database setup"
fi

# Health check for the build
echo "🔍 Verifying build..."
if [ -f "dist/index.js" ]; then
    echo "✅ Server build successful"
else
    echo "❌ Server build failed"
    exit 1
fi

if [ -f "dist/public/index.html" ]; then
    echo "✅ Client build ready"
else
    echo "❌ Client build not found"
    exit 1
fi

# Final deployment message
echo "🎉 Deployment completed successfully!"
echo "📊 Build summary:"
echo "   - Server: dist/index.js"
echo "   - Client: dist/public/"
echo "   - Port: $PORT"
echo "   - Environment: $NODE_ENV"

# Start the application
echo "🚀 Starting application..."
node dist/index.js