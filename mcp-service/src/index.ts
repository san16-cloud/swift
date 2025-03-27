import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerAllTools } from './tools/index.js';

/**
 * Main entry point for the MCP service
 * 
 * This initializes the MCP server and registers all available tools.
 */
async function main() {
  try {
    console.log('Starting MCP service...');

    // Create a new MCP server instance
    const server = new McpServer({
      name: 'swift-mcp-server',
      version: '1.0.0',
      description: 'Swift MCP Server with various utility tools'
    });

    // Register all tools
    registerAllTools(server);
    
    // Create a transport mechanism (using stdio for this example)
    const transport = new StdioServerTransport();
    
    // Connect the server with the transport
    await server.connect(transport);
    
    console.log('MCP service started successfully');
  } catch (error) {
    console.error('Failed to start MCP service:', error);
    process.exit(1);
  }
}

// Start the application
main();
