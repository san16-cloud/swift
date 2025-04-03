import { CodeSymbol, SymbolType, CallRelation, InheritanceRelation } from './semanticAnalyzer.js';

/**
 * Reference from one symbol to another
 */
export interface SymbolReference {
  sourceSymbol: string;     // Name of the source symbol
  targetSymbol: string;     // Name of the target symbol
  referenceType: ReferenceType; // Type of reference
  sourceFile: string;       // File containing the reference
  location: {               // Location in source file
    line: number;
    column: number;
  };
}

/**
 * Type of reference between symbols
 */
export enum ReferenceType {
  Call = 'call',            // Function/method call
  Inheritance = 'inheritance', // Class extension or interface implementation
  Import = 'import',        // Module import
  Assignment = 'assignment', // Variable assignment
  Access = 'access',        // Property/field access
  Declaration = 'declaration' // Symbol declaration
}

/**
 * Symbol usage statistics
 */
export interface SymbolUsage {
  symbolName: string;
  type: SymbolType;
  declaredIn: string;      // File where the symbol is declared
  referenceCount: number;  // Number of references to this symbol
  callers: string[];       // Symbols that call this symbol (if applicable)
  callees: string[];       // Symbols called by this symbol (if applicable)
}

/**
 * Results from cross-reference analysis
 */
export interface CrossReferenceResult {
  references: SymbolReference[];     // All symbol references
  symbolUsage: Record<string, SymbolUsage>; // Usage statistics by symbol
  hotspots: string[];              // Most referenced symbols
  unused: string[];               // Symbols with no references
  filesWithMostSymbols: Array<{   // Files with most symbols
    file: string;
    symbolCount: number;
  }>;
}

/**
 * Analyze cross-references between symbols
 * 
 * This function builds a cross-reference database that maps symbols to their
 * definitions and usages, identifies the most referenced symbols, and calculates
 * usage statistics.
 * 
 * @param symbols - Map of all symbols
 * @param calls - Function/method call relations
 * @param inheritance - Inheritance relations
 * @returns Cross-reference analysis results
 */
export function analyzeCrossReferences(
  symbols: Record<string, CodeSymbol>,
  calls: CallRelation[],
  inheritance: InheritanceRelation[]
): CrossReferenceResult {
  // Initialize references array
  const references: SymbolReference[] = [];
  
  // Initialize symbol usage map
  const symbolUsage: Record<string, SymbolUsage> = {};
  
  // Initialize map for files to symbols count
  const fileSymbolCount: Record<string, number> = {};
  
  // Process declarations and initialize usage stats
  for (const [name, symbol] of Object.entries(symbols)) {
    // Add declaration reference
    references.push({
      sourceSymbol: name,
      targetSymbol: name,
      referenceType: ReferenceType.Declaration,
      sourceFile: symbol.filePath,
      location: symbol.location
    });
    
    // Initialize symbol usage
    symbolUsage[name] = {
      symbolName: name,
      type: symbol.type,
      declaredIn: symbol.filePath,
      referenceCount: 0,  // Will be incremented later
      callers: [],
      callees: []
    };
    
    // Count symbols per file
    fileSymbolCount[symbol.filePath] = (fileSymbolCount[symbol.filePath] || 0) + 1;
  }
  
  // Process call references
  for (const call of calls) {
    // Add call reference
    references.push({
      sourceSymbol: call.caller,
      targetSymbol: call.callee,
      referenceType: ReferenceType.Call,
      sourceFile: call.filePath,
      location: call.location
    });
    
    // Update caller/callee lists
    if (symbolUsage[call.callee]) {
      symbolUsage[call.callee].callers.push(call.caller);
    }
    
    if (symbolUsage[call.caller]) {
      symbolUsage[call.caller].callees.push(call.callee);
    }
  }
  
  // Process inheritance references
  for (const inherit of inheritance) {
    references.push({
      sourceSymbol: inherit.child,
      targetSymbol: inherit.parent,
      referenceType: ReferenceType.Inheritance,
      sourceFile: symbols[inherit.child]?.filePath || '',
      location: symbols[inherit.child]?.location || { line: 0, column: 0 }
    });
  }
  
  // Count references to each symbol
  for (const ref of references) {
    // Skip self-references (declarations)
    if (ref.referenceType !== ReferenceType.Declaration && 
        symbolUsage[ref.targetSymbol]) {
      symbolUsage[ref.targetSymbol].referenceCount++;
    }
  }
  
  // Identify hotspot symbols (most referenced)
  const hotspots = Object.entries(symbolUsage)
    .filter(([_, usage]) => usage.referenceCount > 0)
    .sort((a, b) => b[1].referenceCount - a[1].referenceCount)
    .slice(0, 10)  // Top 10 most referenced
    .map(([name, _]) => name);
  
  // Identify unused symbols
  const unused = Object.entries(symbolUsage)
    .filter(([_, usage]) => usage.referenceCount === 0)
    .map(([name, _]) => name);
  
  // Identify files with most symbols
  const filesWithMostSymbols = Object.entries(fileSymbolCount)
    .map(([file, count]) => ({ file, symbolCount: count }))
    .sort((a, b) => b.symbolCount - a.symbolCount)
    .slice(0, 10);  // Top 10 files
  
  return {
    references,
    symbolUsage,
    hotspots,
    unused,
    filesWithMostSymbols
  };
}
