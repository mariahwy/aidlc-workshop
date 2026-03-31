import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateLoginForm, validateMenuForm, validateStaffForm } from './validation';

describe('validateLoginForm', () => {
  it('returns errors for empty fields', () => {
    const errors = validateLoginForm({ store_id: '', username: '', password: '' });
    expect(errors.length).toBe(3);
  });

  it('returns no errors for valid input', () => {
    const errors = validateLoginForm({ store_id: 'abc-123', username: 'admin', password: '12345678' });
    expect(errors.length).toBe(0);
  });

  // PBT: valid inputs never produce errors
  it('property: valid inputs produce no errors', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 8, maxLength: 50 }),
        (storeId, username, password) => {
          const errors = validateLoginForm({ store_id: storeId, username, password });
          return errors.length === 0;
        },
      ),
    );
  });

  // PBT: empty store_id always produces error
  it('property: empty store_id always produces error', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 8, maxLength: 50 }),
        (username, password) => {
          const errors = validateLoginForm({ store_id: '', username, password });
          return errors.some((e) => e.field === 'store_id');
        },
      ),
    );
  });
});

describe('validateMenuForm', () => {
  // PBT: valid menu data produces no errors
  it('property: valid menu data produces no errors', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.integer({ min: 0, max: 1_000_000 }),
        fc.uuid(),
        (name, price, categoryId) => {
          const errors = validateMenuForm({
            name,
            price: String(price),
            category_id: categoryId,
          });
          return errors.length === 0;
        },
      ),
    );
  });
});

describe('validateStaffForm', () => {
  // PBT: short passwords always produce error
  it('property: passwords under 8 chars produce error', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 7 }),
        (username, password) => {
          const errors = validateStaffForm({ username, password });
          return errors.some((e) => e.field === 'password');
        },
      ),
    );
  });
});
