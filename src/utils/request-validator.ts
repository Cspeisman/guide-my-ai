/**
 * Utility functions for validating and parsing HTTP requests
 */

export class RequestValidator {
  /**
   * Extracts and validates authorization header
   */
  static extractBearerToken(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Validates that a bearer token is present
   */
  static validateBearerToken(authHeader: string | null): string | null {
    const token = this.extractBearerToken(authHeader);
    if (!token) {
      return null;
    }
    return token;
  }

  /**
   * Parses query parameters from a URL
   */
  static parseQueryParams(url: URL): Record<string, string> {
    return Object.fromEntries(url.searchParams.entries());
  }

  /**
   * Validates required fields in an object
   */
  static validateRequired<T extends Record<string, any>>(
    data: T,
    fields: (keyof T)[]
  ): { valid: boolean; missing: string[] } {
    const missing: string[] = [];
    for (const field of fields) {
      if (!data[field]) {
        missing.push(String(field));
      }
    }
    return {
      valid: missing.length === 0,
      missing,
    };
  }
}

