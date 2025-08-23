/**
 * Safe Array Utilities - Prevents "map is not a function" errors
 * 
 * These utilities ensure arrays are always valid before mapping operations
 * and provide comprehensive error logging for debugging.
 */

export function ensureArray<T>(value: unknown, fallback: T[] = []): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  
  console.warn('[SafeArray] Value is not an array:', {
    type: typeof value,
    value: value,
    isNull: value === null,
    isUndefined: value === undefined,
    constructor: value?.constructor?.name,
    stackTrace: new Error().stack
  });
  
  return fallback;
}

export function safeMap<T, R>(
  array: unknown, 
  mapFn: (item: T, index: number, array: T[]) => R,
  fallback: T[] = []
): R[] {
  const safeArray = ensureArray<T>(array, fallback);
  
  try {
    return safeArray.map(mapFn);
  } catch (error) {
    console.error('[SafeArray] Map operation failed:', {
      error,
      arrayType: typeof array,
      arrayValue: array,
      isArray: Array.isArray(array),
      arrayLength: Array.isArray(array) ? array.length : 'N/A',
      stackTrace: new Error().stack
    });
    return [];
  }
}

export function debugArrayState(name: string, value: unknown): void {
  console.log(`[ArrayDebug] ${name}:`, {
    type: typeof value,
    isArray: Array.isArray(value),
    isNull: value === null,
    isUndefined: value === undefined,
    length: Array.isArray(value) ? value.length : 'N/A',
    value: Array.isArray(value) ? value : value,
    constructor: value?.constructor?.name
  });
}

// Hook for debugging array state in React components
export function useArrayDebug<T>(name: string, array: T[]): T[] {
  debugArrayState(name, array);
  return ensureArray(array);
}
