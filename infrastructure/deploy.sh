#!/bin/bash
set -e

echo "========================================="
echo "  Deploy to Render"
echo "========================================="
echo ""

# Check for git
command -v git >/dev/null 2>&1 || { echo "Error: git is required"; exit 1; }

# Check if we're in a git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "Initializing git repository..."
  git init
  git add .
  git commit -m "Initial commit"
  echo ""
fi

# Check for GitHub remote
if ! git remote get-url origin > /dev/null 2>&1; then
  echo "No GitHub remote found."
  echo ""
  echo "Please create a repository on GitHub, then run:"
  echo ""
  echo "  git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
  echo "  git push -u origin main"
  echo ""
  echo "Then run this script again."
  exit 1
fi

# Push latest changes
echo "Pushing to GitHub..."
git push origin main 2>/dev/null || git push -u origin main

echo ""
echo "========================================="
echo "  Next Steps"
echo "========================================="
echo ""
echo "1. Go to https://dashboard.render.com"
echo ""
echo "2. Click 'New' → 'Blueprint'"
echo ""
echo "3. Connect your GitHub repo:"
REPO_URL=$(git remote get-url origin)
echo "   $REPO_URL"
echo ""
echo "4. Render will detect render.yaml and show:"
echo "   - backend (Web Service)"
echo "   - frontend (Static Site)"
echo "   - app-db (PostgreSQL)"
echo ""
echo "5. Click 'Apply' and wait for deployment (~5 min)"
echo ""
echo "6. After deploy, get your backend URL from the dashboard"
echo "   (looks like: https://backend-xxxx.onrender.com)"
echo ""
echo "7. Go to frontend → Environment → set VITE_API_URL to your backend URL"
echo ""
echo "8. Save and redeploy. You're live!"
echo ""
