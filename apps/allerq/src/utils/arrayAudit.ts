/**
 * Array Audit Utility - Catches "map is not a function" errors at development time
 * 
 * This utility scans code for potential array mapping issues and provides
 * comprehensive error detection and prevention.
 */

export interface ArrayAuditResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export function auditArrayUsage(code: string): ArrayAuditResult {
  const result: ArrayAuditResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  // Check for .map() usage without array validation
  const mapUsageRegex = /(\w+)\.map\(/g;
  let match;
  
  while ((match = mapUsageRegex.exec(code)) !== null) {
    const variableName = match[1];
    
    // Check if variable is validated as array before mapping
    const arrayCheckRegex = new RegExp(`Array\\.isArray\\(${variableName}\\)|${variableName}\\s*&&\\s*Array\\.isArray\\(${variableName}\\)`, 'g');
    
    if (!arrayCheckRegex.test(code)) {
      result.warnings.push(`Variable '${variableName}' used with .map() without array validation`);
      result.suggestions.push(`Consider using: Array.isArray(${variableName}) ? ${variableName}.map(...) : []`);
    }
  }

  // Check for common problematic patterns
  const problematicPatterns = [
    {
      pattern: /\.map\(\s*\(/g,
      message: "Direct .map() usage found - consider using safeMap() utility"
    },
    {
      pattern: /\w+\s*\?\s*\w+\.map/g,
      message: "Conditional map usage - ensure proper array validation"
    }
  ];

  problematicPatterns.forEach(({ pattern, message }) => {
    if (pattern.test(code)) {
      result.warnings.push(message);
    }
  });

  result.isValid = result.errors.length === 0;
  return result;
}

// Runtime array validation for development
export function validateArrayAtRuntime<T>(value: unknown, name: string): T[] {
  if (!Array.isArray(value)) {
    const error = `Runtime Error: ${name} is not an array. Type: ${typeof value}, Value: ${JSON.stringify(value)}`;
    console.error(error);
    
    if (process.env.NODE_ENV === 'development') {
      // In development, throw to catch issues early
      throw new Error(error);
    }
    
    // In production, return empty array to prevent crashes
    return [];
  }
  
  return value;
}

// Development-only array wrapper
export function devArrayWrapper<T>(array: T[], name: string): T[] {
  if (process.env.NODE_ENV === 'development') {
    return new Proxy(array, {
      get(target, prop) {
        if (prop === 'map' && !Array.isArray(target)) {
          throw new Error(`Attempted to call .map() on non-array: ${name}. Type: ${typeof target}`);
        }
        return target[prop as keyof T[]];
      }
    });
  }
  
  return array;
}
