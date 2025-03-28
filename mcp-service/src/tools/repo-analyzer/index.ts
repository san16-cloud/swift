import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { analyzeLanguageDistribution } from './analyzers/languageAnalyzer.js';
import { logInfo, logError } from '../../utils/logFormatter.js';

/**
 * Repository Analyzer Tool
 * 
 * A tool that analyzes repository structure and composition,
 * providing insights into language distribution, code organization,
 * and other metrics useful for technical leadership.
 */

// Define input schema
const RepoAnalyzerInputSchema = z.object({
  // Repository path (required)
  repositoryPath: z
    .string()
    .describe('Path to the repository to analyze'),
  
  // Whether to analyze language distribution (optional)
  includeLanguages: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to analyze language distribution'),
  
  // Paths to exclude from analysis (optional)
  excludePaths: z
    .array(z.string())
    .optional()
    .default(['node_modules', 'dist', '.git', 'build'])
    .describe('Paths to exclude from analysis (e.g., node_modules)'),
});

// Type definitions based on zod schema
type RepoAnalyzerInput = z.infer<typeof RepoAnalyzerInputSchema>;

/**
 * Register the Repository Analyzer tool with the MCP server
 */
export function registerRepoAnalyzerTool(server: McpServer) {
  const TOOL_NAME = 'repo-analyzer';
  const SERVICE_NAME = 'swift-mcp-service';
  const SERVICE_VERSION = '1.0.0';
  
  server.tool(TOOL_NAME, 
    'Analyzes repository structure and composition, providing insights for technical leadership',
    {
      repositoryPath: z.string(),
      includeLanguages: z.boolean().optional().default(true),
      excludePaths: z.array(z.string()).optional().default(['node_modules', 'dist', '.git', 'build'])
    },
    async (input: RepoAnalyzerInput) => {
      try {
        // Destructure input parameters
        const { repositoryPath, includeLanguages, excludePaths } = input;
        
        logInfo(`Analyzing repository: ${repositoryPath}`, SERVICE_NAME, SERVICE_VERSION, {
          context: {
            tool: TOOL_NAME,
            repositoryPath,
            includeLanguages,
            excludePaths
          }
        });
        
        // Initialize results object
        const analysisResults: any = {
          repositoryPath,
          excludePaths
        };
        
        // Analyze language distribution if requested
        if (includeLanguages) {
          analysisResults.languages = await analyzeLanguageDistribution(repositoryPath, excludePaths);
        }
        
        // Format the response text
        const responseText = formatAnalysisResults(analysisResults);
        
        logInfo(`Repository analysis completed successfully: ${repositoryPath}`, SERVICE_NAME, SERVICE_VERSION, {
          context: {
            tool: TOOL_NAME,
            languagesAnalyzed: includeLanguages,
            languageCount: analysisResults.languages?.summary?.languageCount
          }
        });
        
        // Return in the format expected by MCP SDK
        return {
          // Include analysis results data for clients that might need it
          results: analysisResults,
          // Content array required by MCP SDK
          content: [
            {
              type: "text",
              text: responseText
            }
          ]
        };
      } catch (error) {
        // Handle errors by returning a proper error response
        const err = error instanceof Error ? error : new Error(String(error));
        
        logError(`Error analyzing repository: ${input.repositoryPath}`, SERVICE_NAME, SERVICE_VERSION, err, {
          context: {
            tool: TOOL_NAME,
            repositoryPath: input.repositoryPath
          }
        });
        
        return {
          error: true,
          content: [
            {
              type: "text",
              text: `Error analyzing repository: ${err.message}`
            }
          ]
        };
      }
    }
  );
  
  logInfo(`${TOOL_NAME} tool registered successfully`, SERVICE_NAME, SERVICE_VERSION);
}

/**
 * Format analysis results as readable text
 * 
 * @param results - Analysis results
 * @returns Formatted text output
 */
function formatAnalysisResults(results: any): string {
  let output = '## Repository Analysis Results\n\n';
  
  // Add language distribution section if available
  if (results.languages) {
    output += '### Language Distribution\n\n';
    
    const { summary, distribution } = results.languages;
    
    output += `Total Files: ${summary.totalFiles}\n`;
    output += `Total Lines of Code: ${summary.totalLines}\n`;
    output += `Languages Detected: ${summary.languageCount}\n\n`;
    
    output += 'Language distribution by lines of code:\n\n';
    output += '| Language | Files | Lines | Percentage |\n';
    output += '|----------|-------|-------|------------|\n';
    
    for (const lang of distribution) {
      output += `| ${lang.language} | ${lang.files} | ${lang.lines} | ${lang.percentage}% |\n`;
    }
  }
  
  return output;
}
