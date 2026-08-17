import { describe, it, expect } from 'vitest';
import { validateTransaction } from '../../src/validation/transaction.js';

const giltig = {
  sender: 'Finca La Aurora',
  recipient: 'Nordic Roastery',
  batchId: 'B-001',
  weightKg: 60
};

describe('validateTransaction', () => {
  it('godkänner en komplett transaktion och trimmar strängarna', () => {
    const result = validateTransaction({ ...giltig, sender: '  Finca La Aurora  ' });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.transaction).toEqual(giltig);
  });

  it.each(['sender', 'recipient', 'batchId'])('avvisar när %s saknas', (field) => {
    const payload = { ...giltig };
    delete payload[field];

    const result = validateTransaction(payload);

    expect(result.valid).toBe(false);
    expect(result.transaction).toBeNull();
    expect(result.errors.some((e) => e.includes(field))).toBe(true);
  });

  it('avvisar tomma strängar', () => {
    expect(validateTransaction({ ...giltig, batchId: '   ' }).valid).toBe(false);
  });

  it('avvisar weightKg som inte är ett tal', () => {
    expect(validateTransaction({ ...giltig, weightKg: '60' }).valid).toBe(false);
    expect(validateTransaction({ ...giltig, weightKg: Number.NaN }).valid).toBe(false);
  });

  it('avvisar weightKg som är noll eller negativt', () => {
    expect(validateTransaction({ ...giltig, weightKg: 0 }).valid).toBe(false);
    expect(validateTransaction({ ...giltig, weightKg: -3 }).valid).toBe(false);
  });

  it('avvisar payloads som inte är objekt', () => {
    expect(validateTransaction(null).valid).toBe(false);
    expect(validateTransaction('kaffe').valid).toBe(false);
    expect(validateTransaction([]).valid).toBe(false);
  });

  it('samlar upp flera fel samtidigt', () => {
    const result = validateTransaction({});

    expect(result.errors).toHaveLength(4);
  });
});