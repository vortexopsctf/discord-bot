#!/bin/bash

# Stop script on first error
set -e

echo "🚀 Starting Deployment..."

# Uncomment the following line if you want to pull the latest changes from git automatically
# git pull origin main

echo "📦 Building and Starting Container..."
# Build the image and start the container in detached mode
# --build forces a rebuild of the image
# -d runs it in the background
docker compose up -d --build

echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deployment Complete! Bot should be running."
echo "📜 View logs with: docker compose logs -f"
