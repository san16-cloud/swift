/**
 * Code Quality Metrics Analyzer
 * 
 * This module analyzes code quality metrics including:
 * - Function/method complexity (cyclomatic complexity)
 * - Long functions/methods
 * - Code duplication
 * - Comment analysis and code-to-comment ratios
 */

import { analyzeCodeComplexity } from './complexityAnalyzer.js';
import { analyzeFunctionLength } from './functionAnalyzer.js';
import { analyzeCodeDuplication } from './duplicationAnalyzer.js'; 
import { analyzeComments } from './commentAnalyzer.js';
import { scanDirectory } from '../../utils/fileUtils.js';
import { validateRepositoryPath } from '../../utils/pathUtils.js';

/**
 * Interface for function length metrics
 */
export interface LongFunction {
  file: string;
  line: number;
  name: string;
  length: number;
}

/**
 * Interface for code duplication metrics
 */
export interface CodeDuplication {
  files: string[];
  content: string;
  lineCount: number;
}

/**
 * Interface for comment ratio metrics
 */
export interface CommentRatio {
  file: string;
  codeLines: number;
  commentLines: number;
  ratio: number;
  commentedOutCode: boolean;
}

/**
 * Interface for code quality metrics results
 */
export interface CodeQualityMetrics {
  complexity: Record<string, number>; // filepath -> complexity
  longFunctions: LongFunction[];
  duplications: CodeDuplication[];
  commentRatios: Record<string, CommentRatio>; // filepath -> comment ratio
  excessiveComments: string[]; // files with excessive comments
  overallScore: number; // 0-100
}

/**
 * Analyze code quality metrics in a repository
 * 
 * @param repositoryPath - Path to the repository
 * @param excludePaths - Paths to exclude from analysis
 * @returns Code quality metrics results
 */
export async function analyzeCodeQuality(
  repositoryPath: string,
  excludePaths: string[] = ['node_modules', 'dist', '.git', 'build']
): Promise<CodeQualityMetrics> {
  // Validate the repository path
  validateRepositoryPath(repositoryPath);
  
  // Scan relevant code files (focus on .ts, .js, .tsx, .jsx)
  const codeFileExtensions = ['.ts', '.js', '.tsx', '.jsx'];
  const files = (await scanDirectory(repositoryPath, excludePaths))
    .filter(file => codeFileExtensions.some(ext => file.endsWith(ext)));
  
  // Calculate complexity metrics
  const complexity = await analyzeCodeComplexity(files);
  
  // Find long functions
  const longFunctions = await analyzeFunctionLength(files);
  
  // Detect code duplication
  const duplications = await analyzeCodeDuplication(files);
  
  // Analyze comments and calculate ratio
  const commentAnalysis = await analyzeComments(files);
  const { commentRatios, excessiveComments } = commentAnalysis;
  
  // Calculate overall score (0-100) based on metrics
  const overallScore = calculateOverallScore(
    complexity,
    longFunctions,
    duplications,
    commentRatios
  );
  
  return {
    complexity,
    longFunctions,
    duplications,
    commentRatios,
    excessiveComments,
    overallScore
  };
}

/**
 * Calculate overall code quality score based on all metrics
 * 
 * @param complexity - Complexity metrics
 * @param longFunctions - Long functions metrics
 * @param duplications - Code duplication metrics
 * @param commentRatios - Comment ratio metrics
 * @returns Overall score (0-100)
 */
function calculateOverallScore(
  complexity: Record<string, number>,
  longFunctions: LongFunction[],
  duplications: CodeDuplication[],
  commentRatios: Record<string, CommentRatio>
): number {
  // Calculate complexity score (lower is better)
  const complexityValues = Object.values(complexity);
  const avgComplexity = complexityValues.length > 0
    ? complexityValues.reduce((sum, value) => sum + value, 0) / complexityValues.length
    : 0;
  // Score decreases as complexity increases (ideal < 10)
  const complexityScore = Math.max(0, 100 - (avgComplexity - 5) * 5);
  
  // Calculate long functions score (fewer is better)
  const longFunctionsRatio = Object.keys(complexity).length > 0
    ? longFunctions.length / Object.keys(complexity).length
    : 0;
  // Score decreases as percentage of long functions increases
  const longFunctionsScore = Math.max(0, 100 - longFunctionsRatio * 500);
  
  // Calculate duplication score (lower is better)
  const totalDuplicatedLines = duplications.reduce((sum, dup) => sum + dup.lineCount, 0);
  const totalLinesOfCode = Object.values(commentRatios).reduce((sum, ratio) => sum + ratio.codeLines, 0);
  const duplicationRatio = totalLinesOfCode > 0 ? totalDuplicatedLines / totalLinesOfCode : 0;
  // Score decreases as duplication increases
  const duplicationScore = Math.max(0, 100 - duplicationRatio * 500);
  
  // Calculate comment ratio score (balanced is better)
  let commentScoreSum = 0;
  const files = Object.keys(commentRatios);
  for (const file of files) {
    const ratio = commentRatios[file].ratio;
    // Ideal ratio is around 0.2 (20% comments)
    // Score reduces if too few or too many comments
    const fileCommentScore = 100 - Math.min(100, Math.abs(ratio - 0.2) * 200);
    commentScoreSum += fileCommentScore;
  }
  const commentScore = files.length > 0 ? commentScoreSum / files.length : 100;
  
  // Calculate weighted average for overall score
  // Complexity and duplication are more critical than other metrics
  return Math.round(
    (complexityScore * 0.4) +
    (longFunctionsScore * 0.2) +
    (duplicationScore * 0.3) +
    (commentScore * 0.1)
  );
}
