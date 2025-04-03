#!/bin/bash
set -e
rm -rf build

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "Building Docker image..."
    docker build -t swift-mcp-server .
    echo "Docker image built successfully!"
else
    echo "Docker not found - skipping Docker image build."
fi

# Clean up build artifacts if needed
rm -rf build
