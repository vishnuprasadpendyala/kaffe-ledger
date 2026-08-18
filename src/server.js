import { createApp } from './app.js';
import { Blockchain } from './blockchain/Blockchain.js';
import { getPort } from './config.js';

const blockchain = new Blockchain();
const app = createApp(blockchain);
const port = getPort();

app.listen(port, () => {
  console.log(`☕ KaffeLedger lyssnar på http://localhost:${port}`);
  console.log(`   Miljö: ${process.env.NODE_ENV ?? 'development'} | Svårighetsgrad: ${blockchain.difficulty}`);
});