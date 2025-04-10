import { z } from 'zod';
import { BaseTool } from '../base-tool.js';
import { listAnalyticsSnapshots, getLatestSnapshot, getSnapshot } from './storage/snapshot-manager.js';
import { logInfo, logError } from '../../utils/logFormatter.js';

/**
 * Input type for Get Analytics tool
 */
export type GetAnalyticsInput = {
  toolId?: string;
  repositoryName?: string;
  snapshotId?: string;
  limit?: number;
};

/**
 * Output type for Get Analytics tool
 */
export type GetAnalyticsOutput = any; // Could be a list of snapshots or a single snapshot

/**
 * Get Analytics Tool
 * 
 * A tool that retrieves stored analytics data from other tools.
 * Uses the BaseTool class for standardized registration and analytics.
 */
export class GetAnalyticsTool extends BaseTool<GetAnalyticsInput, GetAnalyticsOutput> {
  /**
   * Create a new Get Analytics tool
   */
  constructor() {
    super(
      'get-analytics',
      '1.0.0',
      'Retrieves analytics data stored by tools'
    );
  }

  /**
   * Define the schema for this tool
   */
  protected getSchema(): Record<string, z.ZodType<any>> {
    return {
      toolId: z.string().optional().describe('Filter results by tool ID'),
      repositoryName: z.string().optional().describe('Filter results by repository name'),
      snapshotId: z.string().optional().describe('Specific snapshot ID to retrieve (YYYY-MM-DD-HHMMSS format)'),
      limit: z.number().optional().default(10).describe('Maximum number of snapshots to retrieve'),
    };
  }

  /**
   * Execute the analytics retrieval operation
   * 
   * @param input - Tool input parameters
   * @returns Retrieved analytics data
   */
  protected async execute(input: GetAnalyticsInput): Promise<GetAnalyticsOutput> {
    try {
      logInfo('Retrieving analytics data', this.serviceNamespace, this.serviceVersion, {
        context: {
          tool: this.toolId,
          action: 'get',
          filters: {
            toolId: input.toolId,
            repositoryName: input.repositoryName,
            snapshotId: input.snapshotId
          }
        }
      });
      
      let result: any;
      
      // Get a specific snapshot if ID is provided
      if (input.snapshotId) {
        result = await getSnapshot(input.snapshotId, input.toolId, input.repositoryName);
      } 
      // Get the latest snapshot if specific filters are provided
      else if (input.toolId || input.repositoryName) {
        result = await getLatestSnapshot(input.toolId, input.repositoryName);
      } 
      // Get a list of snapshots otherwise
      else {
        result = await listAnalyticsSnapshots(input.limit || 10);
      }
      
      logInfo('Successfully retrieved analytics data', this.serviceNamespace, this.serviceVersion, {
        context: {
          tool: this.toolId,
          action: 'get',
          resultType: Array.isArray(result) ? 'list' : 'single',
          snapshotCount: Array.isArray(result) ? result.length : 1
        }
      });
      
      // Store analytics about this retrieval operation
      await this.storeAnalytics(
        // Repository info - use a generic one for analytics operations
        { name: 'analytics-service' },
        // Summary data about this operation
        {
          operation: 'get',
          filters: {
            toolId: input.toolId,
            repositoryName: input.repositoryName,
            snapshotId: input.snapshotId
          },
          result_count: Array.isArray(result) ? result.length : 1,
          timestamp: new Date().toISOString()
        }
      );
      
      return result;
    } catch (error) {
      // Handle errors
      const err = error instanceof Error ? error : new Error(String(error));
      
      logError('Error retrieving analytics data', this.serviceNamespace, this.serviceVersion, err, {
        context: {
          tool: this.toolId,
          action: 'get',
          filters: {
            toolId: input.toolId,
            repositoryName: input.repositoryName,
            snapshotId: input.snapshotId
          }
        }
      });
      
      throw err;
    }
  }

  /**
   * Format the response for the client
   * 
   * @param result - Retrieved analytics data
   * @returns Formatted response
   */
  protected formatResponse(result: GetAnalyticsOutput): any {
    // Format the response based on the result type
    const responseText = this.formatAnalyticsResults(result);
    
    return {
      content: [
        {
          type: "text",
          text: responseText
        }
      ],
      results: result
    };
  }

  /**
   * Format analytics results as readable text
   * 
   * @param results - Analytics results (either a list of snapshots or a single snapshot)
   * @returns Formatted text output
   */
  private formatAnalyticsResults(results: any): string {
    // Handle list of snapshots
    if (Array.isArray(results)) {
      return this.formatSnapshotList(results);
    }
    
    // Handle single snapshot
    return this.formatSingleSnapshot(results);
  }

  /**
   * Format a list of snapshots as readable text
   * 
   * @param snapshots - List of snapshot metadata
   * @returns Formatted text output
   */
  private formatSnapshotList(snapshots: any[]): string {
    let output = '## Analytics Snapshots\n\n';
    
    if (snapshots.length === 0) {
      return output + 'No snapshots found.\n';
    }
    
    output += '| Snapshot ID | Tool | Repository | Timestamp | Metrics |\n';
    output += '|------------|------|------------|-----------|--------|\n';
    
    for (const snapshot of snapshots) {
      const snapshotId = snapshot.id || 'Unknown';
      const toolId = snapshot.metadata?.tool_id || 'Unknown';
      const repository = snapshot.metadata?.repository_info?.name || 'Unknown';
      const timestamp = snapshot.metadata?.timestamp || 'Unknown';
      
      // Get a few summary metrics if available
      let metrics = 'N/A';
      if (snapshot.summaryData) {
        const metricKeys = Object.keys(snapshot.summaryData).slice(0, 3);
        if (metricKeys.length > 0) {
          metrics = metricKeys.map(key => {
            const value = snapshot.summaryData[key];
            return `${key}: ${typeof value === 'object' ? 'Object' : value}`;
          }).join(', ');
          
          if (Object.keys(snapshot.summaryData).length > 3) {
            metrics += ', ...';
          }
        }
      }
      
      output += `| ${snapshotId} | ${toolId} | ${repository} | ${timestamp} | ${metrics} |\n`;
    }
    
    return output;
  }

  /**
   * Format a single snapshot as readable text
   * 
   * @param snapshot - Snapshot data
   * @returns Formatted text output
   */
  private formatSingleSnapshot(snapshot: any): string {
    if (!snapshot) {
      return '## Analytics Snapshot\n\nNo snapshot found.\n';
    }
    
    let output = '## Analytics Snapshot\n\n';
    
    // Metadata section
    output += '### Metadata\n\n';
    
    const metadata = snapshot.metadata || {};
    output += `- **Tool**: ${metadata.tool_id || 'Unknown'}\n`;
    output += `- **Tool Version**: ${metadata.tool_version || 'Unknown'}\n`;
    output += `- **Schema Version**: ${metadata.schema_version || 'Unknown'}\n`;
    output += `- **Timestamp**: ${metadata.timestamp || 'Unknown'}\n`;
    output += `- **Execution Time**: ${metadata.execution_time_ms ? `${metadata.execution_time_ms}ms` : 'Unknown'}\n`;
    
    if (metadata.repository_info) {
      output += `- **Repository**: ${metadata.repository_info.name || 'Unknown'}\n`;
      
      if (metadata.repository_info.branch) {
        output += `- **Branch**: ${metadata.repository_info.branch}\n`;
      }
      
      if (metadata.repository_info.commit_hash) {
        output += `- **Commit Hash**: ${metadata.repository_info.commit_hash}\n`;
      }
    }
    
    output += '\n';
    
    // Summary data section
    if (snapshot.summaryData) {
      output += '### Summary Data\n\n';
      
      for (const [key, value] of Object.entries(snapshot.summaryData)) {
        if (typeof value === 'object' && value !== null) {
          output += `#### ${key}\n\n`;
          
          if (Array.isArray(value)) {
            // Handle array values (show first few items)
            output += `- Total Items: ${value.length}\n`;
            
            if (value.length > 0) {
              output += '- Sample Items:\n';
              
              for (let i = 0; i < Math.min(value.length, 3); i++) {
                const item = value[i];
                output += `  - ${typeof item === 'object' ? JSON.stringify(item) : item}\n`;
              }
              
              if (value.length > 3) {
                output += `  - ... and ${value.length - 3} more\n`;
              }
            }
          } else {
            // Handle object values
            for (const [subKey, subValue] of Object.entries(value)) {
              if (typeof subValue === 'object' && subValue !== null) {
                output += `- **${subKey}**: ${JSON.stringify(subValue)}\n`;
              } else {
                output += `- **${subKey}**: ${subValue}\n`;
              }
            }
          }
          
          output += '\n';
        } else {
          output += `- **${key}**: ${value}\n`;
        }
      }
    }
    
    // Detailed data section
    if (snapshot.detailedData) {
      output += '### Detailed Data\n\n';
      output += 'Detailed data is available. Use specific data access methods to retrieve detailed analytics.\n';
    }
    
    return output;
  }
}
