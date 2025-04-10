# Swift Tool Framework

## Overview

The Swift Tool Framework provides a standardized approach to building and registering tools within the Swift MCP server. It includes integrated analytics capabilities for tracking tool usage and performance metrics.

## Key Components

### BaseTool Class

The `BaseTool` abstract class provides the foundation for all Swift tools:

- Standardized tool registration with MCP server
- Integrated analytics collection and storage
- Common error handling patterns
- Logging standardization

All tools should extend this class to ensure consistency and enable automatic analytics collection.

### Tool Structure

Tools should follow this directory structure:

```
src/tools/
  ├── base-tool.ts                  # Base class for all tools
  ├── analytics-storage/            # Analytics storage implementation
  └── [tool-name]/                  # Tool-specific directory
      ├── index.ts                  # Main tool implementation
      ├── analyzers/                # (Optional) Analysis components
      └── utils/                    # (Optional) Tool utilities
```

## Creating a New Tool

1. Create a new directory for your tool under `src/tools/`
2. Create a class that extends `BaseTool` with your tool's functionality
3. Implement required abstract methods:
   - `getSchema()`: Define the tool's input schema
   - `execute()`: Implement the tool's core functionality
4. Optionally override:
   - `formatResponse()`: Customize response formatting
   - `formatErrorResponse()`: Customize error responses
5. Export a registration function to register your tool with the MCP server

### Example Implementation

```typescript
import { z } from 'zod';
import { BaseTool } from '../base-tool.js';

export class MyTool extends BaseTool<MyInput, MyOutput> {
  constructor() {
    super(
      'my-tool',        // Tool ID
      '1.0.0',          // Tool version
      'Description...'  // Tool description
    );
  }

  protected getSchema(): Record<string, z.ZodType<any>> {
    return {
      paramA: z.string().describe('Parameter A description'),
      paramB: z.number().optional().describe('Parameter B description')
    };
  }

  protected async execute(input: MyInput): Promise<MyOutput> {
    // Implement tool functionality
    const result = { /* ... */ };
    
    // Store analytics
    await this.storeAnalytics(
      { name: 'repository-name' },  // Repository info
      { /* summary metrics */ }     // Summary data
    );
    
    return result;
  }
}

export function registerMyTool(server: any): void {
  const tool = new MyTool();
  tool.register(server);
}
```

## Analytics

Tools automatically collect and store analytics data through the `storeAnalytics()` method. Analytics are stored in:

```
.swift/
  analytics/
    summary.json                    # Aggregated repository-wide metrics
    snapshots/
      YYYY-MM-DD-HHMMSS/           # Timestamp-based snapshots
        metadata.json              # Run information
        [tool-id].json             # Tool-specific data
        [tool-id]_detailed.json    # (Optional) Detailed data
```

## Best Practices

1. Use the `BaseTool` class for all new tools
2. Store meaningful analytics that can help with monitoring and improving tool performance
3. Follow the established directory structure and patterns
4. Use proper error handling and logging
5. Document tool-specific functionality

## Limitations

- Repository information must be provided manually (no auto-detection yet)
- Analytics schema validation is basic and should be improved
- Does not yet support cross-tool analytics aggregation
