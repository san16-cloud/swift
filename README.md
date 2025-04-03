# Swift by Lumix Labs
[![smithery badge](https://smithery.ai/badge/@lumix-labs/swift)](https://smithery.ai/server/@lumix-labs/swift)

Ship Legacy Code 5x Faster Without Risky Rewrites

## About

Swift by Lumix Labs helps engineering leaders transform legacy systems from innovation bottlenecks to competitive advantages. Deploy faster, reduce incidents, and modernize incrementally without risky rewrites or expensive consultants.

## Key Features

- Accelerate legacy deployment cycles from weeks to days
- Reduce technical debt costs by up to 40%
- Zero-disruption implementation
- Cut legacy system incidents by 60%
- Analyze repository composition with language and code quality metrics
- Identify technical debt hotspots for targeted modernization

## Setup Guide for Engineers

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Claude membership](https://claude.ai/)
- Git

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/lumix-labs/swift.git
   cd swift/mcp-server
   ```

2. Build the Docker image:
   ```bash
   ./build.sh
   ```
   This will create a Docker image named `swift-mcp-server` that you can see in Docker Desktop.

### Connecting Claude to Swift

1. Open Claude Desktop application
2. Go to Settings → Developer → Edit Config
3. Add the following configuration block:

   ```json
   {
    "mcpServers": {
     "swift-mcp-server": {
       "command": "docker",
       "args": [
         "run",
         "-i",
         "--rm",
         "-v",
         "/path/to/your/repo1:/repo1",
         "-v",
         "/path/to/your/repo2:/repo2",
         "-w",
         "/",
         "swift-mcp-server"
       ]
     }
    }
   }
   ```

4. Replace the paths in the `-v` arguments with the absolute paths to your local repositories:
   - The format is: `/your/local/path:/mounted/path`
   - For simplicity, the right side (mounted path) should be a simple name at the root level
   - Example:
     ```
     "-v",
     "/Users/username/projects/my-app:/my-app",
     ```

5. Save and restart Claude

Now Claude is connected to your MCP server and can access your local repositories!

### Available Tools

- **Repo Analyzer**: Analyzes repository structure showing language distribution and code quality metrics
- **UUID Generator**: Generates UUIDs in various formats

### Usage Examples

Ask Claude to analyze a repository:
```
Can you analyze the repository at /my-repo using repo-analyzer with language analysis and code quality metrics?
```

Generate a UUID:
```
Can you generate a UUID for me?
```

## Documentation

Visit our [GitHub Pages site](https://lumix-labs.github.io/swift/) for complete documentation and guides.

## GitHub Pages Website

This repository includes a GitHub Pages website in the `/docs` directory. The site is automatically published when changes are pushed to the main branch.

### Website Development

To run the website locally:

1. Navigate to the `docs` directory
2. Install Ruby and Bundler if you don't have them
3. Run `bundle install` to install dependencies
4. Run `bundle exec jekyll serve` to start a local server
5. Visit `http://localhost:4000` in your browser

## License

See the [LICENSE](LICENSE) file for details.
