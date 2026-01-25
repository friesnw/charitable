#!/bin/bash
set -e

echo "Setting up monorepo..."

# Check for Homebrew
command -v brew >/dev/null 2>&1 || { echo "Error: Homebrew is required. Install it from https://brew.sh"; exit 1; }

# Install Node.js 24 LTS if missing
if ! command -v node >/dev/null 2>&1; then
  echo "Installing Node.js 24 LTS..."
  brew install node@24
  brew link node@24
fi

# Install PostgreSQL 17 if missing
if ! command -v psql >/dev/null 2>&1; then
  echo "Installing PostgreSQL 17..."
  brew install postgresql@17
  brew link postgresql@17
fi

# Start PostgreSQL if not running
if ! pg_isready >/dev/null 2>&1; then
  echo "Starting PostgreSQL..."
  brew services start postgresql@17
  sleep 2
fi

echo "Installing dependencies..."
npm install

echo "Creating database..."
createdb app_db 2>/dev/null || echo "  Database 'app_db' already exists"

echo "Setting up environment files..."
[ -f backend/.env ] || cp backend/.env.example backend/.env
[ -f frontend/.env ] || cp frontend/.env.example frontend/.env

echo ""
echo "Setup complete! Migrations will run automatically when you start the server."
echo ""
echo "Run the app with:"
echo "  npm run dev"
echo ""
echo "Generate GraphQL types (with backend running):"
echo "  npm run codegen"
