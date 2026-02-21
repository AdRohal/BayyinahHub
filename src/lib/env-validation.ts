/**
 * Environment variable validation
 * Run this on startup to ensure all required variables are present
 */

export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required variables
  const required = ['OPENAI_API_KEY'];
  const optional = ['NODE_ENV'];

  for (const key of required) {
    if (!process.env[key]) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  }

  // Validate API key format
  if (process.env.OPENAI_API_KEY) {
    const key = process.env.OPENAI_API_KEY;
    if (key.length < 10 || key.includes(' ')) {
      errors.push('OPENAI_API_KEY has invalid format');
    }
  }

  // Verify we're in a secure environment in production
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.OPENAI_API_KEY) {
      errors.push('OPENAI_API_KEY must be set in production');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Log environment validation results
 */
export function logEnvironmentValidation(): void {
  const result = validateEnvironment();

  if (!result.valid) {
    console.error('❌ Environment validation failed:');
    result.errors.forEach(error => console.error(`   - ${error}`));
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Environment validation failed in production');
    }
  } else {
    console.log('✅ Environment validation passed');
  }
}

// Export for use in API routes
export const ENV_VALIDATED = process.env.NODE_ENV !== 'production' || validateEnvironment().valid;
