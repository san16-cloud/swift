/**
 * Filter Utilities
 * 
 * Utilities for filtering security vulnerabilities
 */

/**
 * Filter analysis results based on severity threshold
 * 
 * @param results - Security analysis results
 * @param threshold - Severity threshold to filter by
 */
export function filterResultsBySeverity(results: any, threshold: string): void {
  const severityLevels = {
    'critical': 4,
    'high': 3,
    'medium': 2,
    'low': 1,
    'info': 0
  };
  
  const thresholdLevel = severityLevels[threshold as keyof typeof severityLevels];
  
  // Filter code vulnerabilities
  if (results.codeVulnerabilities) {
    results.codeVulnerabilities = results.codeVulnerabilities.filter((vuln: any) => {
      const vulnLevel = severityLevels[vuln.severity.toLowerCase() as keyof typeof severityLevels];
      return vulnLevel >= thresholdLevel;
    });
  }
  
  // Filter dependency vulnerabilities
  if (results.dependencyVulnerabilities) {
    results.dependencyVulnerabilities = results.dependencyVulnerabilities.filter((vuln: any) => {
      const vulnLevel = severityLevels[vuln.severity.toLowerCase() as keyof typeof severityLevels];
      return vulnLevel >= thresholdLevel;
    });
  }
  
  // Filter hardcoded credentials
  if (results.hardcodedCredentials) {
    results.hardcodedCredentials = results.hardcodedCredentials.filter((cred: any) => {
      const credLevel = severityLevels[cred.severity.toLowerCase() as keyof typeof severityLevels];
      return credLevel >= thresholdLevel;
    });
  }
  
  // Filter security anti-patterns
  if (results.securityAntiPatterns) {
    results.securityAntiPatterns = results.securityAntiPatterns.filter((pattern: any) => {
      const patternLevel = severityLevels[pattern.severity.toLowerCase() as keyof typeof severityLevels];
      return patternLevel >= thresholdLevel;
    });
  }
}
