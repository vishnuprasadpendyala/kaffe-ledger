import { createHash } from 'node:crypto';

export function calculateHash({
  index,
  previousHash,
  timestamp,
  transactions,
  nonce
}) {
  const payload =
    String(index) +
    String(previousHash) +
    String(timestamp) +
    JSON.stringify(transactions) +
    String(nonce);

  return createHash('sha256').update(payload).digest('hex');
}

export function hasValidProof(hash, difficulty) {
  if (typeof hash !== 'string') return false;

  return hash.startsWith('0'.repeat(difficulty));
}