#!/bin/bash
set -e

# Display a message that setup is starting
echo "Starting Swift dev container post-create setup..."

# Install global dependencies
echo "Installing global npm packages..."
npm install -g typescript ts-node concurrently

# Install web module dependencies
if [ -d "/workspace/swift/web" ]; then
  echo "Setting up web module..."
  cd /workspace/swift/web
  npm install
fi

# Install API server dependencies
if [ -d "/workspace/swift/api-server" ]; then
  echo "Setting up API server module..."
  cd /workspace/swift/api-server
  npm install
fi

# Install MCP server dependencies
if [ -d "/workspace/swift/mcp-server" ]; then
  echo "Setting up MCP server module..."
  cd /workspace/swift/mcp-server
  npm install
  
  # Execute setup script if it exists
  if [ -f "setup.sh" ]; then
    echo "Running MCP server setup script..."
    chmod +x setup.sh
    ./setup.sh
  fi
  
  # Create Python virtual environment for MCP server if needed
  if [ -f "requirements.txt" ]; then
    echo "Setting up Python virtual environment for MCP server..."
    python3 -m venv /home/vscode/venvs/mcp
    source /home/vscode/venvs/mcp/bin/activate
    pip install -r requirements.txt
    deactivate
  fi
fi

# Set up git hooks
echo "Setting up git hooks..."
cd /workspace/swift
if [ ! -f ".git/hooks/pre-commit" ]; then
  cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Running pre-commit checks..."

# Check for ESLint
if command -v eslint &> /dev/null; then
  echo "Running ESLint..."
  eslint . --ext .js,.jsx,.ts,.tsx
fi

# Check TypeScript compilation
if command -v tsc &> /dev/null; then
  echo "Checking TypeScript..."
  tsc --noEmit
fi
EOF
  chmod +x .git/hooks/pre-commit
fi

# Final message
echo "Swift dev container setup complete! You're ready to start coding."
