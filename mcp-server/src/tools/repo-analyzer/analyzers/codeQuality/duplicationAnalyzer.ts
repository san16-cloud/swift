/**
 * Code Duplication Analyzer
 * 
 * Analyzes code to detect duplicated code blocks across files.
 * Uses a simplified approach to identify potentially duplicated code segments.
 */

import fs from 'fs';
import { CodeDuplication } from './index.js';
import { logError } from '../../../../utils/logFormatter.js';

// Constants
const SERVICE_NAME = 'swift-mcp-service';
const SERVICE_VERSION = '1.0.0';
const MIN_CHUNK_SIZE = 4; // Minimum lines to consider as a duplicate
const MIN_LINE_LENGTH = 5; // Minimum line length to consider (to avoid short lines)

/**
 * Create a normalized fingerprint for a code chunk to identify duplication
 * with insignificant differences ignored (whitespace, variable names, etc.)
 * 
 * @param chunk - Code chunk (array of lines)
 * @returns Normalized fingerprint for comparison
 */
function normalizeChunk(chunk: string[]): string {
  // Clean each line: trim whitespace, remove comments
  const cleanedChunk = chunk.map(line => {
    let cleaned = line.trim()
      .replace(/\/\/.*$/, '') // Remove single-line comments
      .replace(/^\s*\*.*$/, '') // Remove lines that are just JSDoc/block comment content
      .trim();
      
    // Skip empty lines after cleaning
    if (!cleaned || cleaned.length < MIN_LINE_LENGTH) {
      return '';
    }
    
    return cleaned;
  }).filter(line => line !== ''); // Remove empty lines
  
  // Skip chunks that are too short after cleaning
  if (cleanedChunk.length < MIN_CHUNK_SIZE) {
    return '';
  }
  
  // Join the cleaned chunk back to a string
  return cleanedChunk.join('\n');
}

/**
 * Extract chunks from a file's content (with a sliding window approach)
 * 
 * @param content - File content
 * @param chunkSize - Size of chunk to extract
 * @returns Map of chunk fingerprints to their original content and line numbers
 */
function extractChunks(
  content: string,
  chunkSize: number = MIN_CHUNK_SIZE
): Map<string, { original: string[], startLine: number }> {
  const lines = content.split('\n');
  const chunks = new Map<string, { original: string[], startLine: number }>();
  
  // Use a sliding window to extract chunks
  for (let i = 0; i <= lines.length - chunkSize; i++) {
    const chunk = lines.slice(i, i + chunkSize);
    const normalized = normalizeChunk(chunk);
    
    // Only consider non-empty normalized chunks
    if (normalized) {
      chunks.set(normalized, { original: chunk, startLine: i + 1 });
    }
  }
  
  return chunks;
}

/**
 * Analyze code to detect duplicated blocks
 * 
 * @param files - Array of file paths to analyze
 * @param minChunkSize - Minimum chunk size to consider (default: 4 lines)
 * @returns Array of code duplication objects
 */
export async function analyzeCodeDuplication(
  files: string[],
  minChunkSize: number = MIN_CHUNK_SIZE
): Promise<CodeDuplication[]> {
  // Map to store all chunks across files
  const allChunks = new Map<
    string, // Normalized content as key
    Array<{ file: string; startLine: number; content: string[] }> // Occurrences
  >();
  
  // Process each file
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const fileChunks = extractChunks(content, minChunkSize);
      
      // Add chunks to the global collection
      for (const [normalized, { original, startLine }] of fileChunks.entries()) {
        if (!allChunks.has(normalized)) {
          allChunks.set(normalized, []);
        }
        
        allChunks.get(normalized)?.push({
          file,
          startLine,
          content: original
        });
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logError(`Error analyzing duplication in ${file}`, SERVICE_NAME, SERVICE_VERSION, err, {
        context: {
          module: 'codeQuality',
          function: 'analyzeCodeDuplication',
          filePath: file
        }
      });
    }
  }
  
  // Filter to chunks that appear in multiple files/locations
  const duplicatedChunks: CodeDuplication[] = [];
  
  for (const [normalized, occurrences] of allChunks.entries()) {
    // Only consider chunks that appear at least twice
    if (occurrences.length >= 2) {
      const duplication: CodeDuplication = {
        files: occurrences.map(o => `${o.file}:${o.startLine}`),
        content: occurrences[0].content.join('\n'),
        lineCount: occurrences[0].content.length
      };
      
      duplicatedChunks.push(duplication);
    }
  }
  
  // Sort duplications by number of lines (largest first)
  return duplicatedChunks.sort((a, b) => b.lineCount - a.lineCount);
}
