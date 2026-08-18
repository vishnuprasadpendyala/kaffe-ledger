import { describe, it, expect } from 'vitest';
import { Block } from '../../src/blockchain/Block.js';
import {
  Blockchain,
  GENESIS_TIMESTAMP
} from '../../src/blockchain/Blockchain.js';

describe('genesis block validation', () => {
  it('detects when the genesis block transactions are changed', () => {
    const blockchain = new Blockchain(1);

    blockchain.chain[0].transactions.push({
      sender: 'Unknown farm',
      recipient: 'Fake roastery',
      batchId: 'FAKE-001',
      weightKg: 9999
    });

    expect(blockchain.isChainValid()).toBe(false);
  });

  it('detects when the genesis block is replaced', () => {
    const blockchain = new Blockchain(1);

    const fakeGenesis = new Block(
      0,
      GENESIS_TIMESTAMP,
      [],
      'not-the-original-genesis'
    );

    fakeGenesis.mineBlock(blockchain.difficulty);
    blockchain.chain[0] = fakeGenesis;

    expect(blockchain.isChainValid()).toBe(false);
  });
});