import { describe, it, expect, beforeEach } from 'vitest';
import {
  Blockchain,
  InvalidTransactionError,
  EmptyTransactionPoolError
} from '../../src/blockchain/Blockchain.js';

const validTransaction = {
  sender: 'Finca La Aurora',
  recipient: 'Nordic Roastery',
  batchId: 'B-001',
  weightKg: 60
};

describe('Blockchain', () => {
  let blockchain;

  beforeEach(() => {
    blockchain = new Blockchain();
  });

  it('startar med ett mine:at genesisblock och en tom transaktionspool', () => {
    expect(blockchain.chain).toHaveLength(1);
    expect(blockchain.chain[0].index).toBe(0);
    expect(blockchain.chain[0].previousHash).toBe('0');
    expect(blockchain.chain[0].hasValidHash(blockchain.difficulty)).toBe(true);
    expect(blockchain.pendingTransactions).toEqual([]);
  });

  it('använder svårighetsgrad 1 i testmiljön', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(blockchain.difficulty).toBe(1);
  });

  describe('addTransaction', () => {
    it('lägger giltiga transaktioner i pendingTransactions', () => {
      const { transaction, blockIndex } = blockchain.addTransaction(validTransaction);

      expect(blockchain.pendingTransactions).toEqual([transaction]);
      expect(blockIndex).toBe(1);
    });

    it('kastar InvalidTransactionError när batchId saknas', () => {
      const { batchId, ...utanBatchId } = validTransaction;

      expect(() => blockchain.addTransaction(utanBatchId)).toThrow(InvalidTransactionError);
      expect(blockchain.pendingTransactions).toHaveLength(0);
    });

    it('kastar InvalidTransactionError när weightKg inte är ett positivt tal', () => {
      expect(() => blockchain.addTransaction({ ...validTransaction, weightKg: -5 })).toThrow(
        InvalidTransactionError
      );
    });
  });

  describe('minePendingTransactions', () => {
    it('kastar EmptyTransactionPoolError när poolen är tom', () => {
      expect(() => blockchain.minePendingTransactions()).toThrow(EmptyTransactionPoolError);
    });

    it('lägger ett giltigt block i kedjan och tömmer poolen', () => {
      blockchain.addTransaction(validTransaction);

      const block = blockchain.minePendingTransactions();

      expect(blockchain.chain).toHaveLength(2);
      expect(blockchain.chain[1]).toBe(block);
      expect(block.index).toBe(1);
      expect(block.transactions).toEqual([validTransaction]);
      expect(block.previousHash).toBe(blockchain.chain[0].hash);
      expect(block.hash.startsWith('0'.repeat(blockchain.difficulty))).toBe(true);
      expect(blockchain.pendingTransactions).toEqual([]);
    });

    it('länkar flera block efter varandra', () => {
      blockchain.addTransaction(validTransaction);
      const first = blockchain.minePendingTransactions();

      blockchain.addTransaction({
        ...validTransaction,
        sender: 'Nordic Roastery',
        recipient: 'Kafé Bönan'
      });
      const second = blockchain.minePendingTransactions();

      expect(second.index).toBe(2);
      expect(second.previousHash).toBe(first.hash);
    });
  });

  describe('isChainValid', () => {
    it('är sant för en orörd kedja', () => {
      blockchain.addTransaction(validTransaction);
      blockchain.minePendingTransactions();

      expect(blockchain.isChainValid()).toBe(true);
    });

    it('upptäcker att en transaktion skrivits om i efterhand', () => {
      blockchain.addTransaction(validTransaction);
      blockchain.minePendingTransactions();

      blockchain.chain[1].transactions[0].weightKg = 9999;

      expect(blockchain.isChainValid()).toBe(false);
    });

    it('upptäcker en bruten länk mellan block', () => {
      blockchain.addTransaction(validTransaction);
      blockchain.minePendingTransactions();

      blockchain.chain[1].previousHash = '0'.repeat(64);
      blockchain.chain[1].hash = blockchain.chain[1].calculateHash();

      expect(blockchain.isChainValid()).toBe(false);
    });

    it('upptäcker ett block med felaktigt index', () => {
      blockchain.addTransaction(validTransaction);
      blockchain.minePendingTransactions();

      blockchain.chain[1].index = 7;
      blockchain.chain[1].mineBlock(blockchain.difficulty);

      expect(blockchain.isChainValid()).toBe(false);
    });
  });
});