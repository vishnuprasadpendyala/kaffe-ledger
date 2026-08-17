import { describe, it, expect } from 'vitest';
import { Block } from '../../src/blockchain/Block.js';
import { calculateHash } from '../../src/blockchain/hashing.js';

const transactions = [
  {
    sender: 'Finca La Aurora',
    recipient: 'Nordic Roastery',
    batchId: 'B-001',
    weightKg: 60
  }
];

describe('Block', () => {
  it('sätter index, timestamp, transactions, previousHash, nonce och hash', () => {
    const block = new Block(1, 1700000000000, transactions, 'abc123');

    expect(block.index).toBe(1);
    expect(block.timestamp).toBe(1700000000000);
    expect(block.transactions).toEqual(transactions);
    expect(block.previousHash).toBe('abc123');
    expect(block.nonce).toBe(0);
    expect(block.hash).toBe(calculateHash(block));
  });

  describe('mineBlock (Proof-of-Work)', () => {
    it('hittar en hash som inleds med angivet antal nollor', () => {
      const block = new Block(1, 1700000000000, transactions, 'abc123');

      block.mineBlock(2);

      expect(block.hash.startsWith('00')).toBe(true);
    });

    it('höjer nonce tills målet nås', () => {
      const block = new Block(1, 1700000000000, transactions, 'abc123');
      const nonceBefore = block.nonce;

      block.mineBlock(3);

      expect(block.nonce).toBeGreaterThan(nonceBefore);
      expect(block.hash.startsWith('000')).toBe(true);
    });

    it('lämnar en hash som fortfarande stämmer med blockets innehåll', () => {
      const block = new Block(1, 1700000000000, transactions, 'abc123');

      block.mineBlock(2);

      expect(block.hash).toBe(block.calculateHash());
    });

    it('returnerar blocket självt så att anrop kan kedjas', () => {
      const block = new Block(1, 1700000000000, transactions, 'abc123');

      expect(block.mineBlock(1)).toBe(block);
    });
  });

  describe('hasValidHash', () => {
    it('är sant för ett korrekt mine:at block', () => {
      const block = new Block(1, 1700000000000, transactions, 'abc123').mineBlock(2);

      expect(block.hasValidHash(2)).toBe(true);
    });

    it('är falskt om innehållet manipulerats i efterhand', () => {
      const block = new Block(1, 1700000000000, transactions, 'abc123').mineBlock(2);

      block.transactions[0].weightKg = 6000;

      expect(block.hasValidHash(2)).toBe(false);
    });

    it('är falskt om hashen inte uppfyller svårighetsgraden', () => {
      const block = new Block(1, 1700000000000, transactions, 'abc123').mineBlock(1);

      expect(block.hasValidHash(6)).toBe(false);
    });
  });
});