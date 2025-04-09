Backend Team Implementation Document
1. System Architecture Overview
1.1 Components

MCP Server (existing)
API Server (new)
Shared Tool Libraries
Database Layer (Supabase)

1.2 Architecture Diagram
┌────────────────┐    ┌────────────────┐    ┌───────────────┐
│  Claude/LLM    │    │  Frontend App  │    │ Admin Portal  │
└───────┬────────┘    └───────┬────────┘    └───────┬───────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌────────────────┐    ┌────────────────┐    ┌───────────────┐
│   MCP Server   │    │   API Server   │◄───┤ Auth Service  │
└───────┬────────┘    └───────┬────────┘    └───────┬───────┘
        │                     │                     │
        └─────────┬───────────┘                     │
                  ▼                                 ▼
         ┌────────────────┐                ┌────────────────┐
         │ Shared Tools   │                │   Supabase     │
         └────────────────┘                └────────────────┘
2. API Endpoints
2.1 Tool Endpoints

GET /api/tools - List all available tools
POST /api/tools/analyze-repo - Analyze repository structure
POST /api/tools/scan-tech-debt - Scan for technical debt
POST /api/tools/scan-security - Scan for security vulnerabilities
POST /api/tools/analyze-dependencies - Analyze dependencies
POST /api/tools/analyze-impact - Analyze impact of changes

2.2 Room Management

GET /api/rooms - List user's rooms
POST /api/rooms - Create a new room
GET /api/rooms/:roomId - Get room details
DELETE /api/rooms/:roomId - Delete a room
POST /api/rooms/:roomId/chat - Send message in room

2.3 API Key Management

GET /api/api-keys - List user's API keys (names only)
POST /api/api-keys - Add a new API key
DELETE /api/api-keys/:keyName - Delete an API key

2.4 Repository Management

GET /api/repositories - List user's repositories
POST /api/repositories - Add a new repository
DELETE /api/repositories/:repoId - Delete a repository

3. Database Schema
3.1 User Table
users
- id (primary key)
- email
- created_at
- last_login
- account_tier
3.2 API Keys Table
api_keys
- id (primary key)
- user_id (foreign key)
- key_name
- provider (openai, anthropic, etc.)
- encrypted_key
- created_at
- last_used
3.3 Repositories Table
repositories
- id (primary key)
- user_id (foreign key)
- name
- path
- repository_type (git, local)
- group_name (optional)
- created_at
3.4 Rooms Table
rooms
- id (primary key)
- user_id (foreign key)
- name
- api_key_id (foreign key)
- created_at
- last_accessed
3.5 Room-Repository Join Table
room_repositories
- room_id (foreign key)
- repository_id (foreign key)
3.6 Messages Table (Optional - if storing on backend)
messages
- id (primary key)
- room_id (foreign key)
- sender_type (user, assistant)
- content
- timestamp
4. Authentication Flow
4.1 Login Process

User authenticates via Supabase OAuth
Supabase returns JWT token
Frontend stores JWT in session storage
JWT is sent with all API requests

4.2 Token Validation

API server extracts JWT from Authorization header
Validates signature using Supabase public key
Extracts user ID and permissions
Attaches user context to request

4.3 Token Refresh

Monitor token expiration (default: 1 hour)
Implement silent refresh when token nears expiration
If refresh fails, redirect to login

4.4 Error Handling

401: Unauthorized - Invalid/expired token
403: Forbidden - Valid token but insufficient permissions
Redirect to login page on auth failures

5. Error Handling Framework
5.1 Standardized Error Codes
typescriptenum ErrorCode {
  AUTHENTICATION_ERROR = 'auth_error',
  AUTHORIZATION_ERROR = 'authorization_error',
  VALIDATION_ERROR = 'validation_error',
  RESOURCE_NOT_FOUND = 'not_found',
  TOOL_EXECUTION_ERROR = 'tool_error',
  RATE_LIMIT_EXCEEDED = 'rate_limit',
  INTERNAL_ERROR = 'internal_error'
}
5.2 Error Response Format
json{
  "status": "error",
  "code": "validation_error",
  "message": "Repository path is required",
  "details": { ... },
  "requestId": "req_123456"
}
5.3 Logging Strategy

Log all errors with request ID, timestamp, user ID
Include stack traces in development, omit in production
Integrate with monitoring system for error rate alerts

6. API Rate Limiting
6.1 Implementation

Use Express rate-limit middleware
Store rate limit counters in Redis
Include rate limit headers in responses

6.2 Limit Tiers

Free tier: 100 requests/hour
Pro tier: 1000 requests/hour
Enterprise: Custom limits

6.3 Per-Endpoint Limits

Tool endpoints: Lower limits due to resource intensity
Chat endpoints: Higher limits
Management endpoints: Highest limits

7. Performance Optimization
7.1 Caching Strategy

Redis cache for analysis results
TTL based on repository size
Cache invalidation on repository update

7.2 Query Optimization

Index fields used in WHERE clauses
Use database views for complex queries
Implement pagination for list endpoints

7.3 Response Optimization

Compress HTTP responses
Implement partial response with field selection
Use ETags for caching

8. Monitoring and Logging
8.1 Request Logging

Log all requests with unique request ID
Capture method, path, status code, response time
Mask sensitive data (API keys, tokens)

8.2 Tool Execution Logging

Log tool name, execution time, repository size
Track success/failure rates
Capture resource utilization

8.3 Metrics Collection

Route-based metrics (requests/sec, latency)
Tool-based metrics (execution time, failure rate)
System metrics (CPU, memory, disk)

8.4 Alerting

Alert on high error rates
Alert on sustained high latency
Alert on unusual authentication failures

9. Testing Strategy
9.1 Unit Testing

Jest framework
Test each tool in isolation
Mock external dependencies

9.2 Integration Testing

Test API endpoints with database
Test authentication flow
Test tool execution with sample repositories

9.3 Load Testing

Simulate multiple concurrent users
Test behavior under high load
Identify performance bottlenecks

10. Security Considerations
10.1 API Key Storage

Encrypt API keys at rest (AES-256)
Store encryption key in environment variables
Never log or expose full API keys

10.2 Request Validation

Validate all input parameters
Sanitize file paths to prevent directory traversal
Implement input size limits

10.3 HTTPS

Enforce HTTPS for all requests
Set secure and httpOnly cookie flags
Implement proper CORS policies

11. MCP Server Integration
11.1 Shared Code Structure
src/
  tools/
    base-tool.ts
    repo-analyzer/
      shared/
        analyzer.ts      # Shared logic
      mcp-adapter.ts     # MCP-specific wrapper
      api-adapter.ts     # API-specific wrapper
11.2 Tool Adapter Pattern
typescript// Base tool implementation
class BaseAnalyzer {
  analyze(options) { ... }
}

// MCP Adapter
class MCPRepoAnalyzer extends BaseAnalyzer {
  run(input) {
    const options = this.parseInput(input);
    return this.analyze(options);
  }
}

// API Adapter
class APIRepoAnalyzer extends BaseAnalyzer {
  execute(req, res) {
    const options = req.body;
    const result = this.analyze(options);
    return res.json({ status: 'success', data: result });
  }
}
12. Implementation Timeline
12.1 Phase 1: Core API (Weeks 1-2)

Setup Express API server structure
Implement authentication with Supabase
Create tool adapters for API use

12.2 Phase 2: Room & Repository Management (Weeks 3-4)

Implement room and repository endpoints
Create database schema and migrations
Setup API key management

12.3 Phase 3: Chat Functionality (Weeks 5-6)

Implement chat endpoints
Connect to LLM providers via stored API keys
Test integration with frontend

12.4 Phase 4: Monitoring & Optimization (Weeks 7-8)

Implement logging and monitoring
Add rate limiting
Performance optimization