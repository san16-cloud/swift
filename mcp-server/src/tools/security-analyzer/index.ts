/**
 * Security Vulnerability Analyzer Tool
 * 
 * A tool that analyzes codebases for security vulnerabilities
 */
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { 
  scanForVulnerabilities,
  scanDependenciesForCVEs,
  detectHardcodedCredentials,
  analyzeSecurityAntiPatterns
} from './analyzers/index.js';
import { 
  generateRiskScores,
  generateComplianceReports,
  generateVulnerabilityMaps,
  filterResultsBySeverity
} from './utils/index.js';
import { formatSecurityResults } from './formatters/index.js';
import { logInfo, logError } from '../../utils/logFormatter.js';

// Define input schema
const SecurityAnalyzerInputSchema = z.object({
  // Repository path (required)
  repositoryPath: z
    .string()
    .describe('Path to the repository to analyze'),
  
  // Framework/language to focus on (optional)
  framework: z
    .string()
    .optional()
    .describe('Primary framework or language used (e.g., "node", "react", "python")'),
  
  // Whether to scan source code for vulnerabilities (optional)
  scanCode: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to scan source code for OWASP Top 10 and CWE vulnerabilities'),
  
  // Whether to scan dependencies for CVEs (optional)
  scanDependencies: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to scan dependencies for known CVEs'),
  
  // Whether to detect hardcoded credentials (optional)
  detectCredentials: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to detect hardcoded credentials and secrets'),
  
  // Whether to analyze security anti-patterns (optional)
  analyzeAntiPatterns: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to analyze security anti-patterns'),
  
  // Whether to include compliance reporting for financial regulations (optional)
  includeComplianceReports: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to include compliance reporting for financial regulations'),
  
  // Whether to generate vulnerability maps (optional)
  generateVulnMaps: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to generate visual maps of vulnerable code paths'),
  
  // Severity threshold (optional)
  severityThreshold: z
    .enum(['critical', 'high', 'medium', 'low', 'info'])
    .optional()
    .default('low')
    .describe('Minimum severity level to report'),
  
  // Paths to exclude from analysis (optional)
  excludePaths: z
    .array(z.string())
    .optional()
    .default(['node_modules', 'dist', '.git', 'build'])
    .describe('Paths to exclude from analysis (e.g., node_modules)'),
});

// Type definitions based on zod schema
type SecurityAnalyzerInput = z.infer<typeof SecurityAnalyzerInputSchema>;

/**
 * Register the Security Vulnerability Analyzer tool with the MCP server
 */
export function registerSecurityAnalyzerTool(server: McpServer) {
  const TOOL_NAME = 'security-analyzer';
  const SERVICE_NAME = 'swift-mcp-service';
  const SERVICE_VERSION = '1.0.0';
  
  // Extract parameter schema for MCP tool registration
  const parameterSchema = {
    repositoryPath: z.string().describe('Path to the repository to analyze'),
    framework: z.string().optional().describe('Primary framework or language used (e.g., "node", "react", "python")'),
    scanCode: z.boolean().optional().default(true).describe('Whether to scan source code for OWASP Top 10 and CWE vulnerabilities'),
    scanDependencies: z.boolean().optional().default(true).describe('Whether to scan dependencies for known CVEs'),
    detectCredentials: z.boolean().optional().default(true).describe('Whether to detect hardcoded credentials and secrets'),
    analyzeAntiPatterns: z.boolean().optional().default(true).describe('Whether to analyze security anti-patterns'),
    includeComplianceReports: z.boolean().optional().default(false).describe('Whether to include compliance reporting for financial regulations'),
    generateVulnMaps: z.boolean().optional().default(false).describe('Whether to generate visual maps of vulnerable code paths'),
    severityThreshold: z.enum(['critical', 'high', 'medium', 'low', 'info']).optional().default('low').describe('Minimum severity level to report'),
    excludePaths: z.array(z.string()).optional().default(['node_modules', 'dist', '.git', 'build']).describe('Paths to exclude from analysis (e.g., node_modules)')
  };
  
  // Register the tool with proper description and parameter schema
  server.tool(
    TOOL_NAME, 
    'Analyzes codebases for security vulnerabilities and provides risk scoring with remediation recommendations',
    parameterSchema,
    async (input: SecurityAnalyzerInput) => {
      try {
        const { 
          repositoryPath,
          framework,
          scanCode,
          scanDependencies,
          detectCredentials, 
          analyzeAntiPatterns,
          includeComplianceReports,
          generateVulnMaps,
          severityThreshold,
          excludePaths 
        } = input;
        
        logInfo(`Security analyzing repository: ${repositoryPath}`, SERVICE_NAME, SERVICE_VERSION, {
          context: {
            tool: TOOL_NAME,
            repositoryPath,
            framework: framework || 'auto-detect',
            excludePaths
          }
        });
        
        // Initialize results object
        const analysisResults: any = {
          repositoryPath,
          framework: framework || 'auto-detected',
          excludePaths,
          timestamp: new Date().toISOString(),
          summary: {
            totalVulnerabilities: 0,
            criticalVulnerabilities: 0,
            highVulnerabilities: 0,
            mediumVulnerabilities: 0,
            lowVulnerabilities: 0,
            infoVulnerabilities: 0
          }
        };
        
        // Collect and process vulnerabilities
        await collectVulnerabilities(
          analysisResults,
          repositoryPath,
          framework,
          excludePaths,
          {
            scanCode,
            scanDependencies,
            detectCredentials,
            analyzeAntiPatterns
          }
        );
        
        // Generate risk scores
        logInfo('Generating risk scores...', SERVICE_NAME, SERVICE_VERSION);
        analysisResults.riskScores = generateRiskScores(
          analysisResults.codeVulnerabilities || [],
          analysisResults.dependencyVulnerabilities || [],
          analysisResults.hardcodedCredentials || [],
          analysisResults.securityAntiPatterns || []
        );
        
        // Include compliance reporting if requested
        if (includeComplianceReports) {
          logInfo('Generating compliance reports...', SERVICE_NAME, SERVICE_VERSION);
          analysisResults.complianceReports = generateComplianceReports(
            analysisResults.codeVulnerabilities || [],
            analysisResults.dependencyVulnerabilities || [],
            analysisResults.hardcodedCredentials || [],
            analysisResults.securityAntiPatterns || []
          );
        }
        
        // Generate vulnerability maps if requested
        if (generateVulnMaps) {
          logInfo('Generating vulnerability maps...', SERVICE_NAME, SERVICE_VERSION);
          analysisResults.vulnerabilityMaps = generateVulnerabilityMaps(
            repositoryPath,
            analysisResults.codeVulnerabilities || [],
            analysisResults.securityAntiPatterns || []
          );
        }
        
        // Filter results based on severity threshold
        filterResultsBySeverity(analysisResults, severityThreshold);
        
        // Format the response text
        const responseText = formatSecurityResults(analysisResults);
        
        logInfo(`Security analysis completed successfully: ${repositoryPath}`, SERVICE_NAME, SERVICE_VERSION, {
          context: {
            tool: TOOL_NAME,
            vulnerabilitiesFound: analysisResults.summary.totalVulnerabilities,
            criticalCount: analysisResults.summary.criticalVulnerabilities,
            highCount: analysisResults.summary.highVulnerabilities
          }
        });
        
        // Return in the format expected by MCP SDK
        return {
          // Explicitly structure the response according to MCP protocol standards
          results: analysisResults,
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
        
        logError(`Error analyzing repository security: ${input.repositoryPath}`, SERVICE_NAME, SERVICE_VERSION, err, {
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
              text: `Error analyzing repository security: ${err.message}`
            }
          ]
        };
      }
    }
  );
  
  // Log successful registration
  logInfo(`${TOOL_NAME} tool registered successfully`, SERVICE_NAME, SERVICE_VERSION);
}

/**
 * Collect vulnerabilities from different scanners and update summary counts
 */
async function collectVulnerabilities(
  results: any,
  repositoryPath: string,
  framework: string | undefined,
  excludePaths: string[],
  options: {
    scanCode: boolean,
    scanDependencies: boolean,
    detectCredentials: boolean,
    analyzeAntiPatterns: boolean
  }
): Promise<void> {
  const { scanCode, scanDependencies, detectCredentials, analyzeAntiPatterns } = options;
  
  // Scan code for vulnerabilities if requested
  if (scanCode) {
    logInfo('Starting vulnerability scan...', 'swift-mcp-service', '1.0.0');
    results.codeVulnerabilities = await scanForVulnerabilities(
      repositoryPath, 
      framework, 
      excludePaths
    );
    
    // Update summary counts
    updateSummaryCounts(results, results.codeVulnerabilities);
  }
  
  // Scan dependencies for CVEs if requested
  if (scanDependencies) {
    logInfo('Starting dependency CVE scan...', 'swift-mcp-service', '1.0.0');
    results.dependencyVulnerabilities = await scanDependenciesForCVEs(
      repositoryPath,
      excludePaths
    );
    
    // Update summary counts
    updateSummaryCounts(results, results.dependencyVulnerabilities);
  }
  
  // Detect hardcoded credentials if requested
  if (detectCredentials) {
    logInfo('Detecting hardcoded credentials...', 'swift-mcp-service', '1.0.0');
    results.hardcodedCredentials = await detectHardcodedCredentials(
      repositoryPath,
      excludePaths
    );
    
    // Update summary counts
    updateSummaryCounts(results, results.hardcodedCredentials);
  }
  
  // Analyze security anti-patterns if requested
  if (analyzeAntiPatterns) {
    logInfo('Analyzing security anti-patterns...', 'swift-mcp-service', '1.0.0');
    results.securityAntiPatterns = await analyzeSecurityAntiPatterns(
      repositoryPath,
      framework,
      excludePaths
    );
    
    // Update summary counts
    updateSummaryCounts(results, results.securityAntiPatterns);
  }
}

/**
 * Update summary counts for vulnerabilities
 */
function updateSummaryCounts(results: any, vulnerabilities: any[]): void {
  for (const vuln of vulnerabilities) {
    results.summary.totalVulnerabilities++;
    
    switch (vuln.severity.toLowerCase()) {
      case 'critical': results.summary.criticalVulnerabilities++; break;
      case 'high': results.summary.highVulnerabilities++; break;
      case 'medium': results.summary.mediumVulnerabilities++; break;
      case 'low': results.summary.lowVulnerabilities++; break;
      case 'info': results.summary.infoVulnerabilities++; break;
    }
  }
}
