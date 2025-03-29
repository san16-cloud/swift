import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { 
  analyzeLanguageDistribution,
  indexRepository, 
  analyzeDependencies, 
  analyzeSemantics,
  analyzeCrossReferences,
  analyzeFlows,
  generateVisualizations,
  analyzeChangeImpact
} from './analyzers/index.js';
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
  
  // Whether to perform indexing analysis
  includeIndexing: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to perform file indexing analysis'),
  
  // Whether to perform dependency analysis
  includeDependencies: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to analyze code dependencies'),
  
  // Whether to perform semantic analysis
  includeSemantics: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to perform semantic code analysis'),
  
  // Whether to build cross-reference database
  includeCrossReferences: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to build cross-reference database'),
  
  // Whether to perform flow analysis
  includeFlowAnalysis: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to analyze data and control flow'),
  
  // Whether to generate visualizations
  includeVisualizations: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to generate visualization data structures'),
  
  // Whether to perform impact analysis
  includeImpactAnalysis: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to perform change impact analysis'),
  
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
      // Extract the schema shape instead of passing the ZodObject directly
      repositoryPath: z.string().describe('Path to the repository to analyze'),
      includeLanguages: z.boolean().optional().default(true).describe('Whether to analyze language distribution'),
      includeIndexing: z.boolean().optional().default(false).describe('Whether to perform file indexing analysis'),
      includeDependencies: z.boolean().optional().default(false).describe('Whether to analyze code dependencies'),
      includeSemantics: z.boolean().optional().default(false).describe('Whether to perform semantic code analysis'),
      includeCrossReferences: z.boolean().optional().default(false).describe('Whether to build cross-reference database'),
      includeFlowAnalysis: z.boolean().optional().default(false).describe('Whether to analyze data and control flow'),
      includeVisualizations: z.boolean().optional().default(false).describe('Whether to generate visualization data structures'),
      includeImpactAnalysis: z.boolean().optional().default(false).describe('Whether to perform change impact analysis'),
      excludePaths: z.array(z.string()).optional().default(['node_modules', 'dist', '.git', 'build']).describe('Paths to exclude from analysis (e.g., node_modules)')
    },
    async (input: RepoAnalyzerInput) => {
      try {
        // Destructure input parameters
        const { 
          repositoryPath, 
          includeLanguages,
          includeIndexing,
          includeDependencies,
          includeSemantics,
          includeCrossReferences,
          includeFlowAnalysis,
          includeVisualizations,
          includeImpactAnalysis,
          excludePaths 
        } = input;
        
        logInfo(`Analyzing repository: ${repositoryPath}`, SERVICE_NAME, SERVICE_VERSION, {
          context: {
            tool: TOOL_NAME,
            repositoryPath,
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
          logInfo('Starting language analysis...', SERVICE_NAME, SERVICE_VERSION);
          analysisResults.languages = await analyzeLanguageDistribution(repositoryPath, excludePaths);
        }
        
        // Perform indexing analysis if requested
        if (includeIndexing) {
          logInfo('Starting file indexing...', SERVICE_NAME, SERVICE_VERSION);
          analysisResults.indexing = await indexRepository(repositoryPath, excludePaths);
        }
        
        // Perform dependency analysis if requested
        if (includeDependencies) {
          logInfo('Starting dependency analysis...', SERVICE_NAME, SERVICE_VERSION);
          analysisResults.dependencies = await analyzeDependencies(repositoryPath, excludePaths);
        }
        
        // Perform semantic analysis if requested
        if (includeSemantics) {
          logInfo('Starting semantic analysis...', SERVICE_NAME, SERVICE_VERSION);
          analysisResults.semantics = await analyzeSemantics(repositoryPath, excludePaths);
        }
        
        // Build cross-reference database if requested
        if (includeCrossReferences && analysisResults.semantics) {
          logInfo('Building cross-reference database...', SERVICE_NAME, SERVICE_VERSION);
          analysisResults.crossReferences = analyzeCrossReferences(
            analysisResults.semantics.symbols,
            analysisResults.semantics.calls,
            analysisResults.semantics.inheritance
          );
        }
        
        // Perform flow analysis if requested
        if (includeFlowAnalysis && analysisResults.semantics) {
          logInfo('Starting flow analysis...', SERVICE_NAME, SERVICE_VERSION);
          analysisResults.flows = analyzeFlows(
            analysisResults.semantics.symbols,
            analysisResults.semantics.calls
          );
        }
        
        // Generate visualizations if requested
        if (includeVisualizations && 
            analysisResults.semantics && 
            analysisResults.dependencies) {
          logInfo('Generating visualizations...', SERVICE_NAME, SERVICE_VERSION);
          analysisResults.visualizations = generateVisualizations(
            analysisResults.semantics.symbols,
            analysisResults.dependencies.dependencies,
            analysisResults.flows?.dataFlows || []
          );
        }
        
        // Perform impact analysis if requested
        if (includeImpactAnalysis && 
            analysisResults.semantics && 
            analysisResults.dependencies && 
            analysisResults.crossReferences && 
            analysisResults.flows) {
          logInfo('Starting impact analysis...', SERVICE_NAME, SERVICE_VERSION);
          analysisResults.impact = analyzeChangeImpact(
            analysisResults.semantics.symbols,
            analysisResults.dependencies.dependencies,
            analysisResults.flows.dataFlows,
            analysisResults.crossReferences.references
          );
        }
        
        // Format the response text
        const responseText = formatAnalysisResults(analysisResults);
        
        logInfo(`Repository analysis completed successfully: ${repositoryPath}`, SERVICE_NAME, SERVICE_VERSION, {
          context: {
            tool: TOOL_NAME,
            analysisTypes: Object.keys(analysisResults).filter(k => k !== 'repositoryPath' && k !== 'excludePaths')
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
    
    output += '\n';
  }
  
  // Add indexing results if available
  if (results.indexing) {
    output += '### File Indexing\n\n';
    
    const { totalFiles, totalSize, fileTypes } = results.indexing;
    
    output += `Total Files: ${totalFiles}\n`;
    output += `Total Size: ${formatBytes(totalSize)}\n\n`;
    
    output += 'File types distribution:\n\n';
    output += '| Extension | Count |\n';
    output += '|-----------|-------|\n';
    
    for (const [ext, count] of Object.entries(fileTypes)) {
      output += `| ${ext || 'unknown'} | ${count} |\n`;
    }
    
    output += '\n';
  }
  
  // Add dependency analysis if available
  if (results.dependencies) {
    output += '### Dependency Analysis\n\n';
    
    const { dependencies, cycles, externalDependencies } = results.dependencies;
    
    output += `Total Dependencies: ${dependencies.length}\n`;
    output += `External Dependencies: ${externalDependencies.size}\n`;
    output += `Circular Dependencies: ${cycles.length}\n\n`;
    
    if (cycles.length > 0) {
      output += 'Circular dependencies detected:\n\n';
      
      for (let i = 0; i < Math.min(cycles.length, 5); i++) {
        output += `- Cycle ${i + 1}: ${cycles[i].paths.join(' -> ')}\n`;
      }
      
      if (cycles.length > 5) {
        output += `... and ${cycles.length - 5} more\n`;
      }
      
      output += '\n';
    }
    
    if (externalDependencies.size > 0) {
      output += 'Top external dependencies:\n\n';
      
      const extDeps = Array.from(externalDependencies).slice(0, 10);
      for (const dep of extDeps) {
        output += `- ${dep}\n`;
      }
      
      if (externalDependencies.size > 10) {
        output += `... and ${externalDependencies.size - 10} more\n`;
      }
      
      output += '\n';
    }
  }
  
  // Add semantic analysis if available
  if (results.semantics) {
    output += '### Semantic Analysis\n\n';
    
    const { stats } = results.semantics;
    
    output += `Total Symbols: ${stats.totalSymbols}\n`;
    output += `Total Calls: ${stats.totalCalls}\n`;
    output += `Inheritance Relationships: ${stats.totalInheritance}\n\n`;
    
    output += 'Symbol types distribution:\n\n';
    output += '| Type | Count |\n';
    output += '|------|-------|\n';
    
    for (const [type, count] of Object.entries(stats.symbolsByType)) {
      output += `| ${type} | ${count} |\n`;
    }
    
    output += '\n';
  }
  
  // Add cross-reference results if available
  if (results.crossReferences) {
    output += '### Cross-References\n\n';
    
    const { hotspots, unused, filesWithMostSymbols } = results.crossReferences;
    
    output += 'Most referenced symbols:\n\n';
    for (const symbol of hotspots.slice(0, 5)) {
      output += `- ${symbol}\n`;
    }
    
    output += '\nFiles with most symbols:\n\n';
    for (const { file, symbolCount } of filesWithMostSymbols.slice(0, 5)) {
      output += `- ${file}: ${symbolCount} symbols\n`;
    }
    
    output += `\nUnused symbols: ${unused.length}\n\n`;
  }
  
  // Add flow analysis if available
  if (results.flows) {
    output += '### Flow Analysis\n\n';
    
    const { dataFlows, entryPoints, sinks, componentIO } = results.flows;
    
    output += `Data Flow Connections: ${dataFlows.length}\n`;
    output += `Entry Points: ${entryPoints.length}\n`;
    output += `Terminal Points: ${sinks.length}\n`;
    output += `Components with I/O: ${Object.keys(componentIO).length}\n\n`;
    
    if (entryPoints.length > 0) {
      output += 'Main Entry Points:\n\n';
      for (const entry of entryPoints.slice(0, 5)) {
        output += `- ${entry}\n`;
      }
      
      if (entryPoints.length > 5) {
        output += `... and ${entryPoints.length - 5} more\n`;
      }
      
      output += '\n';
    }
  }
  
  // Add impact analysis if available
  if (results.impact) {
    output += '### Change Impact Analysis\n\n';
    
    const { mostImpactfulFiles, leastImpactfulFiles, isolatedFiles } = results.impact;
    
    output += 'Most impactful files (changing these affects many other files):\n\n';
    for (const file of mostImpactfulFiles.slice(0, 5)) {
      const impact = results.impact.impactByFile[file];
      output += `- ${file}: Impact score ${impact.impactScore.toFixed(1)}, affects ${impact.totalImpactCount} files\n`;
    }
    
    output += '\nLeast impactful files (safe to change):\n\n';
    for (const file of leastImpactfulFiles.slice(0, 5)) {
      output += `- ${file}\n`;
    }
    
    output += `\nIsolated files (no dependencies): ${isolatedFiles.length}\n\n`;
  }
  
  return output;
}

/**
 * Format bytes to a human-readable string
 * 
 * @param bytes - Number of bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
