/**
 * Log Formatter Utility
 * Provides consistent log formatting with structured data for all tools
 * @version 1.0.0
 */

/**
 * Standard log entry structure interface
 */
export interface StructuredLogEntry {
  timestamp: string;
  service: string;
  level: string;
  message: string;
  version: string;
  correlationId?: string;
  moduleId?: string;
  environment?: string;
  context?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
    code?: string | number;
  };
}

/**
 * Log levels enum for consistent level naming
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace',
}

/**
 * Current environment (fallback to development if not set)
 */
export const ENVIRONMENT = process.env.NODE_ENV || 'development';

/**
 * Format a log message into a structured log entry
 *
 * @param level Log level
 * @param message Log message
 * @param serviceName Service or component name
 * @param version Version of the service or tool
 * @param options Additional log options
 * @returns Formatted log entry
 */
export function formatStructuredLog(
  level: LogLevel,
  message: string,
  serviceName: string,
  version: string,
  options?: {
    correlationId?: string;
    moduleId?: string;
    context?: Record<string, unknown>;
    error?: Error;
  }
): StructuredLogEntry {
  const timestamp = new Date().toISOString();

  const logEntry: StructuredLogEntry = {
    timestamp,
    service: serviceName,
    level,
    message,
    version,
    environment: ENVIRONMENT,
  };

  // Add optional fields if provided
  if (options?.correlationId) {
    logEntry.correlationId = options.correlationId;
  }

  if (options?.moduleId) {
    logEntry.moduleId = options.moduleId;
  }

  if (options?.context) {
    logEntry.context = options.context;
  }

  // Add error information if provided
  if (options?.error) {
    logEntry.error = {
      message: options.error.message,
      stack: options.error.stack,
    };

    // Add error code if it exists
    const errorWithCode = options.error as { code?: string | number };
    if (errorWithCode.code) {
      logEntry.error.code = errorWithCode.code;
    }
  }

  return logEntry;
}

/**
 * Convert a structured log entry to a string format for logging
 *
 * @param entry Structured log entry
 * @returns String representation of the log entry
 */
export function structuredLogToString(entry: StructuredLogEntry): string {
  // Create base log string
  let logString = `${entry.timestamp} [${entry.service}] [${entry.level.toUpperCase()}] ${entry.message}`;

  // Add correlation ID if present
  if (entry.correlationId) {
    logString += ` [correlationId=${entry.correlationId}]`;
  }

  // Add module ID if present
  if (entry.moduleId) {
    logString += ` [moduleId=${entry.moduleId}]`;
  }

  // Add environment
  logString += ` [env=${entry.environment}]`;

  // Add context if present
  if (entry.context && Object.keys(entry.context).length > 0) {
    logString += ` [context=${JSON.stringify(entry.context)}]`;
  }

  // Add error details if present
  if (entry.error) {
    logString += ` [error=${entry.error.message}]`;
    if (entry.error.code) {
      logString += ` [errorCode=${entry.error.code}]`;
    }
    if (entry.error.stack) {
      logString += ` [stack=${entry.error.stack}]`;
    }
  }

  return logString;
}

/**
 * Log and return a structured log entry
 *
 * @param level Log level
 * @param message Log message
 * @param serviceName Service or component name
 * @param version Version of the service or tool
 * @param options Additional log options
 * @returns Structured log entry
 */
export function logStructured(
  level: LogLevel,
  message: string,
  serviceName: string,
  version: string,
  options?: {
    correlationId?: string;
    moduleId?: string;
    context?: Record<string, unknown>;
    error?: Error;
  }
): StructuredLogEntry {
  const entry = formatStructuredLog(level, message, serviceName, version, options);

  // Log to console based on level
  const logString = structuredLogToString(entry);
  switch (level) {
    case LogLevel.ERROR:
      console.error(logString);
      break;
    case LogLevel.WARN:
      console.warn(logString);
      break;
    case LogLevel.INFO:
    case LogLevel.DEBUG:
    case LogLevel.TRACE:
      console.error(logString); // Using console.error to match linting rules
      break;
  }

  return entry;
}

/**
 * Helper function to log errors
 */
export function logError(
  message: string,
  serviceName: string,
  version: string,
  error: Error,
  options?: {
    correlationId?: string;
    moduleId?: string;
    context?: Record<string, unknown>;
  }
): StructuredLogEntry {
  return logStructured(LogLevel.ERROR, message, serviceName, version, {
    ...options,
    error,
  });
}

/**
 * Helper function to log warnings
 */
export function logWarning(
  message: string,
  serviceName: string,
  version: string,
  options?: {
    correlationId?: string;
    moduleId?: string;
    context?: Record<string, unknown>;
    error?: Error;
  }
): StructuredLogEntry {
  return logStructured(LogLevel.WARN, message, serviceName, version, options);
}

/**
 * Helper function to log info messages
 */
export function logInfo(
  message: string,
  serviceName: string,
  version: string,
  options?: {
    correlationId?: string;
    moduleId?: string;
    context?: Record<string, unknown>;
  }
): StructuredLogEntry {
  return logStructured(LogLevel.INFO, message, serviceName, version, options);
}
