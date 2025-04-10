import { z } from 'zod';
import { BaseTool } from '../base-tool.js';
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

/**
 * Input type for Security Analyzer
 */
export type SecurityAnalyzerInput = {
  repositoryPath: string;
  framework?: string;
  scanCode?: boolean;
  scanDependencies?: boolean;
  detectCredentials?: boolean;
  analyzeAntiPatterns?: boolean;
  includeComplianceReports?: boolean;
  generateVulnMaps?: boolean;
  severityThreshold?: 'critical' | 'high' | 'medium' | 'low' | 'info';
  excludePaths?: string[];
};

/**
 * Output type for Security Analyzer
 */
export type SecurityAnalyzerOutput = {
  repositoryPath: string;
  framework: string;
  excludePaths: string[];
  timestamp: string;
  summary: {
    totalVulnerabilities: number;
    criticalVulnerabilities: number;
    highVulnerabilities: number;
    mediumVulnerabilities: number;
    lowVulnerabilities: number;
    infoVulnerabilities: number;
  };
  codeVulnerabilities?: any[];
  dependencyVulnerabilities?: any[];
  hardcodedCredentials?: any[];
  securityAntiPatterns?: any[];
  riskScores?: any;
  complianceReports?: any;
  vulnerabilityMaps?: any;
};

/**
 * Security Analyzer Tool
 * 
 * A tool that analyzes codebases for security vulnerabilities and provides
 * risk scoring with remediation recommendations.
 */
export class SecurityAnalyzerTool extends BaseTool<SecurityAnalyzerInput, SecurityAnalyzerOutput> {
  /**
   * Create a new Security Analyzer tool
   */
  constructor() {
    super(
      'security-analyzer',
      '1.0.0',
      'Analyzes codebases for security vulnerabilities and provides risk scoring with remediation recommendations'
    );
  }

  /**
   * Define the schema for this tool
   */
  protected getSchema(): Record<string, z.ZodType<any>> {
    return {
      repositoryPath: z.string()
        .describe('Path to the repository to analyze'),
      framework: z.string().optional()
        .describe('Primary framework or language used (e.g., "node", "react", "python")'),
      scanCode: z.boolean().optional().default(true)
        .describe('Whether to scan source code for OWASP Top 10 and CWE vulnerabilities'),
      scanDependencies: z.boolean().optional().default(true)
        .describe('Whether to scan dependencies for known CVEs'),
      detectCredentials: z.boolean().optional().default(true)
        .describe('Whether to detect hardcoded credentials and secrets'),
      analyzeAntiPatterns: z.boolean().optional().default(true)
        .describe('Whether to analyze security anti-patterns'),
      includeComplianceReports: z.boolean().optional().default(false)
        .describe('Whether to include compliance reporting for financial regulations'),
      generateVulnMaps: z.boolean().optional().default(false)
        .describe('Whether to generate visual maps of vulnerable code paths'),
      severityThreshold: z.enum(['critical', 'high', 'medium', 'low', 'info']).optional().default('low')
        .describe('Minimum severity level to report'),
      excludePaths: z.array(z.string()).optional().default(['node_modules', 'dist', '.git', 'build'])
        .describe('Paths to exclude from analysis (e.g., node_modules)'),
    };
  }

  /**
   * Execute the security analysis
   * 
   * @param input - Tool input parameters
   * @returns Analysis results
   */
  protected async execute(input: SecurityAnalyzerInput): Promise<SecurityAnalyzerOutput> {
    try {
      const { 
        repositoryPath,
        framework,
        scanCode = true,
        scanDependencies = true,
        detectCredentials = true, 
        analyzeAntiPatterns = true,
        includeComplianceReports = false,
        generateVulnMaps = false,
        severityThreshold = 'low',
        excludePaths = ['node_modules', 'dist', '.git', 'build']
      } = input;
      
      logInfo(`Security analyzing repository: ${repositoryPath}`, this.serviceNamespace, this.serviceVersion, {
        context: {
          tool: this.toolId,
          repositoryPath,
          framework: framework || 'auto-detect',
          excludePaths
        }
      });
      
      // Track execution time
      const startTime = Date.now();
      
      // Initialize results object
      const analysisResults: SecurityAnalyzerOutput = {
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
      await this.collectVulnerabilities(
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
      logInfo('Generating risk scores...', this.serviceNamespace, this.serviceVersion);
      analysisResults.riskScores = generateRiskScores(
        analysisResults.codeVulnerabilities || [],
        analysisResults.dependencyVulnerabilities || [],
        analysisResults.hardcodedCredentials || [],
        analysisResults.securityAntiPatterns || []
      );
      
      // Include compliance reporting if requested
      if (includeComplianceReports) {
        logInfo('Generating compliance reports...', this.serviceNamespace, this.serviceVersion);
        analysisResults.complianceReports = generateComplianceReports(
          analysisResults.codeVulnerabilities || [],
          analysisResults.dependencyVulnerabilities || [],
          analysisResults.hardcodedCredentials || [],
          analysisResults.securityAntiPatterns || []
        );
      }
      
      // Generate vulnerability maps if requested
      if (generateVulnMaps) {
        logInfo('Generating vulnerability maps...', this.serviceNamespace, this.serviceVersion);
        analysisResults.vulnerabilityMaps = generateVulnerabilityMaps(
          repositoryPath,
          analysisResults.codeVulnerabilities || [],
          analysisResults.securityAntiPatterns || []
        );
      }
      
      // Filter results based on severity threshold
      filterResultsBySeverity(analysisResults, severityThreshold);
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      logInfo(`Security analysis completed successfully: ${repositoryPath}`, this.serviceNamespace, this.serviceVersion, {
        context: {
          tool: this.toolId,
          vulnerabilitiesFound: analysisResults.summary.totalVulnerabilities,
          criticalCount: analysisResults.summary.criticalVulnerabilities,
          highCount: analysisResults.summary.highVulnerabilities,
          executionTime
        }
      });
      
      // Extract repository name from path
      const repoNameMatch = repositoryPath.match(/([^\/]+)$/);
      const repoName = repoNameMatch ? repoNameMatch[1] : 'unknown-repo';
      
      // Store analytics for this analysis operation
      await this.storeAnalytics(
        { 
          name: repoName,
          // Could extract these from git if needed
          branch: undefined,
          commitHash: undefined,
          path: repositoryPath // Include the repository path for analytics storage
        },
        {
          execution_time_ms: executionTime,
          repository_path: repositoryPath,
          framework: framework || 'auto-detected',
          total_vulnerabilities: analysisResults.summary.totalVulnerabilities,
          critical_vulnerabilities: analysisResults.summary.criticalVulnerabilities,
          high_vulnerabilities: analysisResults.summary.highVulnerabilities,
          medium_vulnerabilities: analysisResults.summary.mediumVulnerabilities,
          low_vulnerabilities: analysisResults.summary.lowVulnerabilities,
          info_vulnerabilities: analysisResults.summary.infoVulnerabilities,
          credential_issues: analysisResults.hardcodedCredentials?.length || 0,
          anti_patterns: analysisResults.securityAntiPatterns?.length || 0,
          overall_risk_score: analysisResults.riskScores?.overallScore || 0,
          timestamp: new Date().toISOString()
        }
      );
      
      return analysisResults;
    } catch (error) {
      // Handle errors
      const err = error instanceof Error ? error : new Error(String(error));
      
      logError(`Error analyzing repository security: ${input.repositoryPath}`, this.serviceNamespace, this.serviceVersion, err, {
        context: {
          tool: this.toolId,
          repositoryPath: input.repositoryPath
        }
      });
      
      throw err;
    }
  }

  /**
   * Format the response for the client
   * 
   * @param result - Analysis results
   * @returns Formatted response
   */
  protected formatResponse(result: SecurityAnalyzerOutput): any {
    // Format the response text using the existing formatter
    const responseText = formatSecurityResults(result);
    
    return {
      results: result,
      content: [
        {
          type: "text",
          text: responseText
        }
      ]
    };
  }

  /**
   * Collect vulnerabilities from different scanners and update summary counts
   */
  private async collectVulnerabilities(
    results: SecurityAnalyzerOutput,
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
      logInfo('Starting vulnerability scan...', this.serviceNamespace, this.serviceVersion);
      results.codeVulnerabilities = await scanForVulnerabilities(
        repositoryPath, 
        framework, 
        excludePaths
      );
      
      // Update summary counts
      this.updateSummaryCounts(results, results.codeVulnerabilities);
    }
    
    // Scan dependencies for CVEs if requested
    if (scanDependencies) {
      logInfo('Starting dependency CVE scan...', this.serviceNamespace, this.serviceVersion);
      results.dependencyVulnerabilities = await scanDependenciesForCVEs(
        repositoryPath,
        excludePaths
      );
      
      // Update summary counts
      this.updateSummaryCounts(results, results.dependencyVulnerabilities);
    }
    
    // Detect hardcoded credentials if requested
    if (detectCredentials) {
      logInfo('Detecting hardcoded credentials...', this.serviceNamespace, this.serviceVersion);
      results.hardcodedCredentials = await detectHardcodedCredentials(
        repositoryPath,
        excludePaths
      );
      
      // Update summary counts
      this.updateSummaryCounts(results, results.hardcodedCredentials);
    }
    
    // Analyze security anti-patterns if requested
    if (analyzeAntiPatterns) {
      logInfo('Analyzing security anti-patterns...', this.serviceNamespace, this.serviceVersion);
      results.securityAntiPatterns = await analyzeSecurityAntiPatterns(
        repositoryPath,
        framework,
        excludePaths
      );
      
      // Update summary counts
      this.updateSummaryCounts(results, results.securityAntiPatterns);
    }
  }

  /**
   * Update summary counts for vulnerabilities
   */
  private updateSummaryCounts(results: SecurityAnalyzerOutput, vulnerabilities: any[]): void {
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
}
