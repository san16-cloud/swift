import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logsDir = '/logs';
if (!fs.existsSync(logsDir)) {
  try {
    fs.mkdirSync(logsDir, { recursive: true });
  } catch (error) {
    console.error(`Failed to create logs directory: ${error}`);
    // Fall back to local logs directory if mounted volume is not available
    fs.mkdirSync('logs', { recursive: true });
  }
}

// Define custom log format with trace ID
const logFormat = winston.format.printf(({ level, message, timestamp, traceId, type }) => {
  return `${timestamp} [${level.toUpperCase()}] [${traceId || 'NO_TRACE_ID'}] [${type || 'SERVER'}]: ${message}`;
});

// Create Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.json()
  ),
  defaultMeta: { service: 'api-server' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        logFormat
      )
    }),
    // File transport for all logs
    new winston.transports.File({ 
      filename: path.join(logsDir, 'api-server.log'),
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        winston.format.json()
      )
    }),
    // File transport for error logs
    new winston.transports.File({ 
      filename: path.join(logsDir, 'api-server-error.log'), 
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        winston.format.json()
      )
    })
  ]
});

// Helper functions for different log types
export const logRequest = (message: string, traceId: string, req?: any) => {
  logger.info(message, { 
    traceId, 
    type: 'REQUEST',
    path: req?.path,
    method: req?.method,
    ip: req?.ip
  });
};

export const logResponse = (message: string, traceId: string, statusCode?: number, responseTime?: number) => {
  logger.info(message, { 
    traceId, 
    type: 'RESPONSE',
    statusCode,
    responseTime
  });
};

export const logError = (message: string, traceId: string, error?: Error) => {
  logger.error(message, { 
    traceId, 
    type: 'ERROR',
    error: error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : undefined
  });
};

export const logInfo = (message: string, traceId: string, metadata?: any) => {
  logger.info(message, { 
    traceId,
    type: 'INFO',
    ...metadata
  });
};

export default logger;