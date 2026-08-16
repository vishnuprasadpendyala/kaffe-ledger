import { describe, it, expect } from 'vitest';
import { calculateHash, hasValidProof } from '../../src/blockchain/hashing.js';

const blockData = {
  index: 1,
  previousHash: '0000abc',
  timestamp: 1700000000000,
  transactions: [
    {
      sender: 'Finca La Aurora',
      recipient: 'Nordic Roastery',
      batchId: 'B-001',
      weightKg: 60
    }
  ],
  nonce: 0
};

describe('calculateHash', () => {
  it('returns a SHA-256 hash with 64 hexadecimal characters', () => {
    const hash = calculateHash(blockData);

    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('is deterministic: identical content gives the same hash', () => {
    expect(calculateHash(blockData)).toBe(calculateHash({ ...blockData }));
  });

  it('returns a different hash when nonce changes', () => {
    const first = calculateHash(blockData);
    const second = calculateHash({ ...blockData, nonce: 1 });

    expect(second).not.toBe(first);
  });

  it('returns a different hash when a transaction is manipulated', () => {
    const tampered = {
      ...blockData,
      transactions: [{ ...blockData.transactions[0], weightKg: 6000 }]
    };

    expect(calculateHash(tampered)).not.toBe(calculateHash(blockData));
  });
});

describe('hasValidProof', () => {
  it('accepts a hash with the required number of leading zeroes', () => {
    expect(hasValidProof('00abc', 2)).toBe(true);
    expect(hasValidProof('000abc', 3)).toBe(true);
  });

  it('rejects a hash with too few leading zeroes', () => {
    expect(hasValidProof('0abc', 2)).toBe(false);
    expect(hasValidProof('abc', 1)).toBe(false);
  });

  it('accepts every hash at difficulty zero', () => {
    expect(hasValidProof('abc', 0)).toBe(true);
  });

  it('rejects values that are not strings', () => {
    expect(hasValidProof(undefined, 1)).toBe(false);
    expect(hasValidProof(42, 1)).toBe(false);
  });
});