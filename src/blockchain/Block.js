import { calculateHash, hasValidProof } from './hashing.js';

export class Block {
  constructor(index, timestamp, transactions, previousHash = '', nonce = 0) {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = nonce;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return calculateHash(this);
  }

  mineBlock(difficulty) {
    while (!hasValidProof(this.hash, difficulty)) {
      this.nonce += 1;
      this.hash = this.calculateHash();
    }

    return this;
  }

  hasValidHash(difficulty) {
    return this.hash === this.calculateHash() && hasValidProof(this.hash, difficulty);
  }
}