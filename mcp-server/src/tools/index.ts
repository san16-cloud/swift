import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerUuidGeneratorTool } from './uuid-generator.js';
import { registerRepoAnalyzerTool } from './repo-analyzer/index.js';
import { logInfo } from '../utils/logFormatter.js';

/**
 * Register all tools with the MCP server
 * 
 * This function is the central place to register all tools
 * with the MCP server. Import and register new tools here.
 * 
 * @param server - The MCP server instance
 */
export function registerAllTools(server: McpServer) {
  const SERVICE_NAME = 'swift-mcp-service';
  const SERVICE_VERSION = '1.0.0';

  // Register individual tools
  registerUuidGeneratorTool(server);
  registerRepoAnalyzerTool(server);
  
  // Register additional tools here
  // registerAnotherTool(server);
  
  logInfo('All tools registered successfully', SERVICE_NAME, SERVICE_VERSION);
}
