import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * UUID Generator Tool
 * 
 * A simple tool that generates UUIDs using various options.
 */

// Define input schema
const UuidGeneratorInputSchema = z.object({
  // Optional version parameter (defaults to v4)
  version: z
    .enum(['v1', 'v4', 'v5'])
    .optional()
    .default('v4')
    .describe('UUID version to generate (v1, v4, or v5)'),
  
  // Optional namespace for v5 UUIDs
  namespace: z
    .string()
    .optional()
    .describe('Namespace for v5 UUIDs (required only for v5)'),
  
  // Number of UUIDs to generate (optional, defaults to 1)
  count: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(1)
    .describe('Number of UUIDs to generate (1-100)'),
  
  // Format options
  format: z
    .enum(['standard', 'no-hyphens', 'braces', 'uppercase'])
    .optional()
    .default('standard')
    .describe('Output format for the generated UUID(s)'),
});

// Type definitions based on zod schemas
type UuidGeneratorInput = z.infer<typeof UuidGeneratorInputSchema>;

/**
 * UUID Generator function
 * 
 * Generates UUIDs based on input parameters
 */
function generateUuid(input: UuidGeneratorInput): string[] {
  const { version, count, format } = input;
  
  // This is a placeholder implementation - in a real tool, you would use a
  // proper UUID library like uuid-js or crypto module
  const generateSingleUuid = (): string => {
    // Simple mock implementation for demonstration purposes
    // In a real implementation, use appropriate libraries based on version
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    
    // Format the UUID according to the requested format
    switch (format) {
      case 'no-hyphens':
        return uuid.replace(/-/g, '');
      case 'braces':
        return `{${uuid}}`;
      case 'uppercase':
        return uuid.toUpperCase();
      default:
        return uuid;
    }
  };
  
  // Generate the requested number of UUIDs
  const uuids: string[] = [];
  for (let i = 0; i < count; i++) {
    uuids.push(generateSingleUuid());
  }
  
  return uuids;
}

/**
 * Register the UUID Generator tool with the MCP server
 */
export function registerUuidGeneratorTool(server: McpServer) {
  server.tool('uuid-generator', 
    'Generates one or more UUIDs with various format options',
    {
      version: z.enum(['v1', 'v4', 'v5']).optional().default('v4'),
      namespace: z.string().optional(),
      count: z.number().int().min(1).max(100).optional().default(1),
      format: z.enum(['standard', 'no-hyphens', 'braces', 'uppercase']).optional().default('standard')
    },
    async (input: UuidGeneratorInput) => {
      const uuids = generateUuid(input);
      
      return {
        content: [
          {
            type: "text",
            text: `Generated ${uuids.length} UUIDs:\n${uuids.join('\n')}`
          }
        ]
      };
    }
  );
  
  console.log('UUID Generator tool registered successfully');
}
