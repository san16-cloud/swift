import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerUuidGeneratorTool } from './uuid-generator.js';

/**
 * Register all tools with the MCP server
 * 
 * This function is the central place to register all tools
 * with the MCP server. Import and register new tools here.
 * 
 * @param server - The MCP server instance
 */
export function registerAllTools(server: McpServer) {
  // Register individual tools
  registerUuidGeneratorTool(server);
  
  // Register additional tools here
  // registerAnotherTool(server);
  
  console.log('All tools registered successfully');
}
