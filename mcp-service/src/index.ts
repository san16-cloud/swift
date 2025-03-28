import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerAllTools } from './tools/index.js';
import { LogLevel, logInfo, logError } from './utils/logFormatter.js';

/**
 * Main entry point for the MCP service
 * 
 * This initializes the MCP server and registers all available tools.
 */
async function main() {
  const SERVICE_NAME = 'swift-mcp-service';
  const SERVICE_VERSION = '1.0.0';
  
  try {
    logInfo('Starting MCP service...', SERVICE_NAME, SERVICE_VERSION);

    // Create a new MCP server instance
    const server = new McpServer({
      name: SERVICE_NAME,
      version: SERVICE_VERSION,
      description: 'Swift MCP Server with various utility tools'
    });

    // Register all tools
    registerAllTools(server);
    
    // Create a transport mechanism (using stdio for this example)
    const transport = new StdioServerTransport();
    
    // Set up error handling for the transport
    process.on('uncaughtException', (error) => {
      logError('Uncaught Exception', SERVICE_NAME, SERVICE_VERSION, error, {
        context: { type: 'uncaughtException' }
      });
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      logError('Unhandled Promise Rejection', SERVICE_NAME, SERVICE_VERSION, error, {
        context: { type: 'unhandledRejection' }
      });
    });
    
    // Connect the server with the transport
    await server.connect(transport);
    
    logInfo('MCP service started successfully', SERVICE_NAME, SERVICE_VERSION);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logError('Failed to start MCP service', SERVICE_NAME, SERVICE_VERSION, err);
    process.exit(1);
  }
}

// Start the application
main();
