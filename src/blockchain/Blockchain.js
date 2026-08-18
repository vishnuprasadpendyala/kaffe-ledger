import { Block } from './Block.js';
import { getDifficulty } from '../config.js';
import { validateTransaction } from '../validation/transaction.js';

export const GENESIS_TIMESTAMP = Date.parse('2024-01-01T00:00:00.000Z');

export class InvalidTransactionError extends Error {
  constructor(errors) {
    super('Ogiltig transaktion');
    this.name = 'InvalidTransactionError';
    this.status = 400;
    this.errors = errors;
  }
}

export class EmptyTransactionPoolError extends Error {
  constructor() {
    super('Det finns inga väntande transaktioner att mine:a.');
    this.name = 'EmptyTransactionPoolError';
    this.status = 400;
  }
}

export class Blockchain {
  constructor(difficulty = getDifficulty()) {
    this.difficulty = difficulty;
    this.chain = [this.createGenesisBlock()];
    this.pendingTransactions = [];
  }

  createGenesisBlock() {
    const genesis = new Block(0, GENESIS_TIMESTAMP, [], '0');
    return genesis.mineBlock(this.difficulty);
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addTransaction(payload) {
    const { valid, errors, transaction } = validateTransaction(payload);

    if (!valid) {
      throw new InvalidTransactionError(errors);
    }

    this.pendingTransactions.push(transaction);

    return {
      transaction,
      blockIndex: this.getLatestBlock().index + 1
    };
  }

  minePendingTransactions() {
    if (this.pendingTransactions.length === 0) {
      throw new EmptyTransactionPoolError();
    }

    const block = new Block(
      this.chain.length,
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );

    block.mineBlock(this.difficulty);

    this.chain.push(block);
    this.pendingTransactions = [];

    return block;
  }

  isChainValid() {
  const genesis = this.chain[0];

  if (!genesis.hasValidHash(this.difficulty)) {
    return false;
  }

  if (genesis.index !== 0 || genesis.previousHash !== '0') {
    return false;
  }

  for (let i = 1; i < this.chain.length; i += 1) {
    const current = this.chain[i];
    const previous = this.chain[i - 1];

    if (!current.hasValidHash(this.difficulty)) {
      return false;
    }

    if (current.previousHash !== previous.hash) {
      return false;
    }

    if (current.index !== previous.index + 1) {
      return false;
    }
  }

  return true;
}


}