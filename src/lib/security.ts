/**
 * Security utilities for input validation and sanitization
 */

/**
 * Sanitize string input to prevent XSS and injection attacks
 */
export function sanitizeString(input: unknown, maxLength: number = 5000): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Trim whitespace
  let sanitized = input.trim();

  // Enforce max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  return sanitized;
}

/**
 * Validate that a string is not empty after sanitization
 */
export function validateNonEmptyString(input: unknown, fieldName: string = 'input'): { valid: boolean; error?: string; value?: string } {
  const sanitized = sanitizeString(input);
  
  if (!sanitized) {
    return {
      valid: false,
      error: `${fieldName} is required and cannot be empty`,
    };
  }

  return { valid: true, value: sanitized };
}

/**
 * Validate and sanitize JSON input
 */
export async function validateRequestJSON(request: Request): Promise<{ valid: boolean; data?: Record<string, unknown>; error?: string }> {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return { valid: false, error: 'Content-Type must be application/json' };
    }

    const data = await request.json();

    if (typeof data !== 'object' || data === null) {
      return { valid: false, error: 'Request body must be a JSON object' };
    }

    return { valid: true, data };
  } catch (error) {
    return { valid: false, error: 'Invalid JSON in request body' };
  }
}

/**
 * Get client IP address from request headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp.trim();
  }

  return 'unknown';
}

/**
 * Validate API key format (basic check)
 */
export function validateApiKey(key: unknown): boolean {
  if (typeof key !== 'string') return false;
  if (key.length < 10) return false;
  if (key.includes(' ')) return false;
  return true;
}

/**
 * Create safe error response that doesn't leak sensitive info
 */
export function createSafeErrorResponse(error: unknown, defaultMessage: string = 'An error occurred'): string {
  // Log the actual error server-side for debugging
  if (error instanceof Error) {
    console.error('[DEBUG]', error.message);
  } else {
    console.error('[DEBUG]', error);
  }

  // Return generic message to client
  return defaultMessage;
}

/**
 * Validate email format (basic)
 */
export function isValidEmail(email: unknown): boolean {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Rate limit check helper
 */
export interface RateLimitEntry {
  count: number;
  ts: number;
}

export function checkRateLimit(
  map: Map<string, RateLimitEntry>,
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = map.get(key) || { count: 0, ts: now };

  // Reset if window expired
  if (now - entry.ts > windowMs) {
    entry.count = 0;
    entry.ts = now;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count += 1;
  map.set(key, entry);
  return true;
}

/**
 * Sanitize error messages before sending to client
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Only expose specific safe error types
    if (error.message.includes('rate limit')) {
      return 'تم تجاوز حد الطلبات. يرجى المحاولة لاحقاً';
    }
    if (error.message.includes('timeout')) {
      return 'انتهت مهلة الانتظار. يرجى المحاولة مجدداً';
    }
    if (error.message.includes('JSON')) {
      return 'البيانات المرسلة غير صحيحة';
    }
  }
  return 'حدث خطأ ما. يرجى المحاولة لاحقاً';
}
