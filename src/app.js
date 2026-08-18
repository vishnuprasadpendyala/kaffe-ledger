import express from 'express';
import { Blockchain } from './blockchain/Blockchain.js';
import { validateTransactionBody } from './middleware/validateTransactionBody.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp(blockchain = new Blockchain()) {
  const app = express();

  app.use(express.json());
  app.locals.blockchain = blockchain;

  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      difficulty: blockchain.difficulty,
      env: process.env.NODE_ENV ?? 'development'
    });
  });

  app.get('/blockchain', (req, res) => {
    res.json({
      length: blockchain.chain.length,
      difficulty: blockchain.difficulty,
      isValid: blockchain.isChainValid(),
      pendingTransactions: blockchain.pendingTransactions,
      chain: blockchain.chain
    });
  });

  app.post('/transactions', validateTransactionBody, (req, res, next) => {
    try {
      const { transaction, blockIndex } = blockchain.addTransaction(req.validatedTransaction);
      res.status(201).json({
        message: `Transaktionen läggs till i block ${blockIndex}.`,
        blockIndex,
        transaction
      });
    } catch (err) {
      next(err);
    }
  });

  app.post('/mine', (req, res, next) => {
    try {
      const block = blockchain.minePendingTransactions();
      res.status(201).json({
        message: 'Nytt block mine:at och tillagt i kedjan.',
        block
      });
    } catch (err) {
      next(err);
    }
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}