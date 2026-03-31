import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { formatCurrency } from './format';

describe('formatCurrency', () => {
  it('formats 12000 as ₩12,000', () => {
    expect(formatCurrency(12000)).toBe('₩12,000');
  });

  it('formats 0 as ₩0', () => {
    expect(formatCurrency(0)).toBe('₩0');
  });

  // PBT: formatCurrency always starts with ₩
  it('property: always starts with ₩ prefix', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100_000_000 }), (amount) => {
        const result = formatCurrency(amount);
        return result.startsWith('₩');
      }),
    );
  });

  // PBT: formatCurrency output contains only valid characters
  it('property: output contains only ₩, digits, and commas', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100_000_000 }), (amount) => {
        const result = formatCurrency(amount);
        return /^₩[\d,]+$/.test(result);
      }),
    );
  });
});
