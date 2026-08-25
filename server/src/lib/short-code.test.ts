import { describe, expect, it } from 'vitest';
import { SHORT_CODE_LENGTH } from '../config/constants.js';
import { generateShortCode } from './short-code.js';

describe('generateShortCode', () => {
  it('generates URL-safe codes with the configured length', () => {
    const code = generateShortCode();
    expect(code).toHaveLength(SHORT_CODE_LENGTH);
    expect(code).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});
