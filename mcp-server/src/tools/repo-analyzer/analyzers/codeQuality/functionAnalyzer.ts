/**
 * Function Length Analyzer
 * 
 * Analyzes code to identify functions and methods that exceed a certain length threshold.
 * Long functions often indicate code that is difficult to understand and maintain.
 */

import fs from 'fs';
import { LongFunction } from './index.js';
import { logError } from '../../../../utils/logFormatter.js';

// Constants
const SERVICE_NAME = 'swift-mcp-service';
const SERVICE_VERSION = '1.0.0';
const LINE_THRESHOLD = 30; // Configurable threshold for long functions
const METHOD_PATTERNS = [
  // TypeScript/JavaScript function patterns
  // Named function
  /function\s+([a-zA-Z0-9_$]+)\s*\(/g,
  // Method definition in class
  /(?:public|private|protected)?\s*(?:static)?\s*(?:async)?\s*([a-zA-Z0-9_$]+)\s*\(/g,
  // Arrow function assignment
  /(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async)?\s*\(?.*\)?\s*=>/g,
  // Property assignment with function
  /([a-zA-Z0-9_$]+)\s*:\s*(?:async)?\s*\(?.*\)?\s*=>/g,
  // Object method definition
  /([a-zA-Z0-9_$]+)\s*\([^)]*\)\s*{/g,
];

/**
 * Extract function information from code
 * 
 * @param code - Source code content
 * @param filePath - Path to the file
 * @returns Array of function objects with name, start line, and length
 */
function extractFunctions(
  code: string,
  filePath: string
): Array<{ name: string; startLine: number; length: number }> {
  const lines = code.split('\n');
  const functions: Array<{ name: string; startLine: number; length: number }> = [];
  
  // Stack to track nested functions and their starting positions
  const functionStack: Array<{ name: string; startLine: number; braceCount: number }> = [];
  
  // Process each line to detect function declarations and closings
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for function declarations
    for (const pattern of METHOD_PATTERNS) {
      pattern.lastIndex = 0; // Reset regex state
      const match = pattern.exec(line);
      
      if (match) {
        const name = match[1] || 'anonymous';
        // Count opening braces to track when we reach the function end
        const openBraces = (line.match(/{/g) || []).length;
        const closeBraces = (line.match(/}/g) || []).length;
        const braceCount = openBraces - closeBraces;
        
        functionStack.push({ name, startLine: i + 1, braceCount });
      }
    }
    
    // Check for opening/closing braces to track function scope
    if (functionStack.length > 0) {
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      const braceBalance = openBraces - closeBraces;
      
      // Update brace count for current function
      functionStack[functionStack.length - 1].braceCount += braceBalance;
      
      // If braces are balanced, the function is closed
      if (functionStack[functionStack.length - 1].braceCount === 0) {
        const func = functionStack.pop();
        if (func) {
          const length = i - func.startLine + 1;
          functions.push({
            name: func.name,
            startLine: func.startLine,
            length
          });
        }
      }
    }
  }
  
  return functions;
}

/**
 * Analyze functions in files to find those exceeding length threshold
 * 
 * @param files - Array of file paths to analyze
 * @param threshold - Line count threshold (default: 30)
 * @returns Array of long functions
 */
export async function analyzeFunctionLength(
  files: string[],
  threshold: number = LINE_THRESHOLD
): Promise<LongFunction[]> {
  const longFunctions: LongFunction[] = [];
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const functions = extractFunctions(content, file);
      
      // Find functions exceeding the threshold
      for (const func of functions) {
        if (func.length > threshold) {
          longFunctions.push({
            file,
            line: func.startLine,
            name: func.name,
            length: func.length
          });
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logError(`Error analyzing function length in ${file}`, SERVICE_NAME, SERVICE_VERSION, err, {
        context: {
          module: 'codeQuality',
          function: 'analyzeFunctionLength',
          filePath: file
        }
      });
    }
  }
  
  // Sort by length (longest first)
  return longFunctions.sort((a, b) => b.length - a.length);
}
