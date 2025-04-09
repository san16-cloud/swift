# Migrating Existing Tools to the BaseTool Framework

This guide explains how to migrate existing Swift tools to use the new `BaseTool` framework, which provides integrated analytics capabilities and standardized tool registration.

## Why BaseTool is Mandatory

The `BaseTool` class is now **mandatory** for all tools in the mcp-server for the following reasons:

1. **Standardized Registration**: Provides a consistent interface for registering tools with the MCP server
2. **Built-in Error Handling**: Implements robust error handling patterns to prevent service disruptions
3. **Analytics Integration**: Automatically collects and stores execution metrics for monitoring and improvement
4. **Consistent Response Formatting**: Creates uniform response structures for better client integration
5. **Logging Standardization**: Uses centralized logging with structured context information

All tools must extend this base class to maintain compatibility with the Swift platform.

## Migration Steps

### 1. Create a Tool Directory

If your tool is currently a single file, create a dedicated directory for it:

```bash
mkdir -p src/tools/your-tool-name
```

### 2. Convert to Class-Based Structure

Refactor your tool to use a class that extends `BaseTool`:

```typescript
import { z } from 'zod';
import { BaseTool } from '../base-tool.js';

// Define input and output types (optional but recommended for type safety)
export type YourToolInput = {
  // Input parameters
};

export type YourToolOutput = {
  // Output format
};

export class YourTool extends BaseTool<YourToolInput, YourToolOutput> {
  constructor() {
    super(
      'your-tool-id',   // Tool ID (keep the same ID as before)
      '1.0.0',          // Tool version
      'Your tool description'
    );
  }

  protected getSchema(): Record<string, z.ZodType<any>> {
    // Convert your existing Zod schema to this format
    return {
      paramA: z.string().describe('Parameter description'),
      paramB: z.number().optional().default(10).describe('Another parameter')
      // ...add all parameters from your existing schema
    };
  }

  protected async execute(input: YourToolInput): Promise<YourToolOutput> {
    // Move your existing tool functionality here
    // ...

    // Add analytics storage (new functionality)
    await this.storeAnalytics(
      // Repository info (extract from input or use a default)
      { name: 'repository-name' },
      // Summary metrics about this execution
      {
        // Add meaningful metrics about what the tool did
        execution_time_ms: endTime - startTime,
        processed_items: items.length,
        // ...other metrics specific to your tool
      }
    );

    return result;
  }

  // Optionally override formatting methods if your tool has custom formatting
  protected formatResponse(result: YourToolOutput): any {
    // Match your existing response format
    return {
      // ...your existing response structure
      content: [
        {
          type: "text",
          text: "Your formatted output"
        }
      ]
    };
  }
}

// Registration function (similar to your existing one)
export function registerYourTool(server: any): void {
  const tool = new YourTool();
  tool.register(server);
}
```

### 3. Required Methods Implementation

When extending `BaseTool`, you **must** implement these abstract methods:

| Method | Purpose | Required Implementation |
|--------|---------|-------------------------|
| `getSchema()` | Defines the tool's input parameters | Return a Zod schema object defining all input parameters |
| `execute()` | Contains the tool's core functionality | Implement your tool logic and return the appropriate result |

### 4. Move Helper Functions

If your tool has helper functions, you can:

1. Move them into private methods in your tool class
2. Keep them as separate functions in the same file
3. Move them to a separate `utils.js` file in your tool directory

### 5. Update Import in Main Index.ts

Update the import in `src/tools/index.ts` to point to your new module:

```typescript
import { registerYourTool } from './your-tool-name/index.js';
```

### 6. Analytics Integration Requirements

Each tool must implement analytics collection by calling `this.storeAnalytics()` with:

1. **Repository Information**: At minimum, the repository name
2. **Summary Metrics**: Key performance indicators for this execution
3. **Detailed Data** (optional): More comprehensive data for detailed analysis

Example:
```typescript
await this.storeAnalytics(
  { 
    name: repositoryName,
    branch: branchName,
    commitHash: commitId
  },
  {
    execution_time_ms: executionTime,
    items_processed: count,
    success_rate: successRate
  },
  detailedResultsObject // Optional
);
```

### 7. Testing

After migrating, test your tool thoroughly to ensure it:

1. Registers correctly with the MCP server
2. Handles inputs and outputs the same way as before
3. Successfully stores analytics data

## Example: Before & After

### Before (Single-File Tool)

```typescript
// uuid-generator.ts
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerUuidGeneratorTool(server: McpServer) {
  server.tool('uuid-generator', 
    'Generates UUIDs',
    {
      count: z.number().optional().default(1)
    },
    async (input) => {
      // Implementation
      return {
        content: [
          { type: "text", text: "Generated UUIDs..." }
        ]
      };
    }
  );
}
```

### After (BaseTool Implementation)

```typescript
// uuid-generator/index.ts
import { z } from 'zod';
import { BaseTool } from '../base-tool.js';

export class UuidGeneratorTool extends BaseTool {
  constructor() {
    super('uuid-generator', '1.0.0', 'Generates UUIDs');
  }

  protected getSchema() {
    return { count: z.number().optional().default(1) };
  }

  protected async execute(input) {
    // Implementation
    
    // Store analytics
    await this.storeAnalytics(
      { name: 'uuid-service' },
      { count: input.count }
    );
    
    return { uuids: [...] };
  }
}

export function registerUuidGeneratorTool(server) {
  const tool = new UuidGeneratorTool();
  tool.register(server);
}
```

## Common Issues

- **Schema Conversion**: Make sure to convert the schema object format correctly
- **Error Handling**: The BaseTool handles basic errors, but you may need to add custom error handling
- **Repository Info**: Provide meaningful repository information to make analytics useful
- **Response Format**: Match your existing response format in the `formatResponse` method

## Compliance Timeline

All tools in the mcp-server must be migrated to use the BaseTool framework by the following dates:

- **New Tools**: Must use BaseTool immediately
- **Existing Tools**: Must be migrated by End of Q2 2025
- **Legacy Tools**: Must submit migration plan by End of Q1 2025

Non-compliant tools will be automatically disabled after the migration deadline.

Need help? Refer to the README.md or ask the Swift team for assistance.
