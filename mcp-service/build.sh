#!/bin/bash
set -e

echo "Building TypeScript..."
npm run build

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "Building Docker image..."
    docker build -t swift-mcp-service .
    echo "Docker image built successfully!"
else
    echo "Docker not found - skipping Docker image build."
    echo "Build completed successfully (TypeScript only)."
fi

# Clean up build artifacts if needed
# rm -rf build
