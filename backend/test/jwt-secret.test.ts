import { ConfigService } from '@nestjs/config';
import { resolveJwtSecret } from '../src/common/utils/jwt-secret';

/**
 * Minimal fake ConfigService so we can exercise resolveJwtSecret in
 * isolation without spinning up the full Nest DI container.
 */
class FakeConfig extends ConfigService {
  constructor(private readonly map: Record<string, string | undefined>) {
    super();
  }
  override get<T = string>(key: string, defaultValue?: T): T {
    const v = this.map[key];
    return (v === undefined ? (defaultValue as T) : (v as unknown as T));
  }
}

describe('resolveJwtSecret (production safety)', () => {
  it('returns the configured secret when valid', () => {
    const cfg = new FakeConfig({ JWT_SECRET: 'a-very-strong-production-secret-123', NODE_ENV: 'production' });
    expect(resolveJwtSecret(cfg)).toBe('a-very-strong-production-secret-123');
  });

  it('throws in production when JWT_SECRET is missing', () => {
    const cfg = new FakeConfig({ JWT_SECRET: undefined, NODE_ENV: 'production' });
    expect(() => resolveJwtSecret(cfg)).toThrow(/JWT_SECRET is not configured/);
  });

  it('throws in production when JWT_SECRET is the placeholder CHANGE_ME', () => {
    const cfg = new FakeConfig({ JWT_SECRET: 'CHANGE_ME', NODE_ENV: 'production' });
    expect(() => resolveJwtSecret(cfg)).toThrow(/JWT_SECRET is not configured/);
  });

  it('falls back to a dev secret only outside production', () => {
    const cfg = new FakeConfig({ JWT_SECRET: undefined, NODE_ENV: 'development' });
    const secret = resolveJwtSecret(cfg);
    expect(secret).toBe('dev-only-insecure-jwt-secret');
  });

  it('trims whitespace from the secret', () => {
    const cfg = new FakeConfig({ JWT_SECRET: '  spaced-secret-456  ', NODE_ENV: 'production' });
    expect(resolveJwtSecret(cfg)).toBe('spaced-secret-456');
  });
});
