#!/bin/bash
set -e

echo "Running post-merge setup..."

# Install dependencies
npm install --no-audit --no-fund

echo "Post-merge setup complete."
