import { ConfigService } from '@nestjs/config';

/**
 * Resolve the JWT signing secret from configuration.
 *
 * In production we must NEVER fall back to an insecure default — an unset
 * JWT_SECRET would let anyone forge tokens. Instead we throw so the app fails
 * to boot with a clear error. In non-production (dev/test) we allow a known
 * dev secret so local setups keep working without manual env wiring.
 */
export function resolveJwtSecret(config: ConfigService): string {
  const secret = config.get<string>('JWT_SECRET');
  if (secret && secret.trim() && secret !== 'CHANGE_ME') {
    return secret.trim();
  }
  const env = config.get<string>('NODE_ENV', 'development');
  if (env === 'production') {
    throw new Error(
      'JWT_SECRET is not configured. Set a strong JWT_SECRET environment variable before running in production.',
    );
  }
  // Dev/test fallback only — never used in production.
  return 'dev-only-insecure-jwt-secret';
}
