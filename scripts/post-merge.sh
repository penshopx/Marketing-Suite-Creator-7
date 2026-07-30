#!/bin/bash
set -e

echo "Running post-merge setup..."

# Install dependencies
npm install --no-audit --no-fund

# Run streaming smoke test to catch streaming regressions and bpCtx field-name regressions
# (Task #4, Task #42) — server must be running; test retries until ready (30s budget)
echo "Running streaming smoke test..."
npx tsx scripts/test-streaming.ts

echo "Post-merge setup complete."
