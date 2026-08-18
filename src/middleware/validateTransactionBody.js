import { validateTransaction } from '../validation/transaction.js';

export function validateTransactionBody(req, res, next) {
  const { valid, errors, transaction } = validateTransaction(req.body);

  if (!valid) {
    return res.status(400).json({
      error: 'Ogiltig transaktion',
      details: errors
    });
  }

  req.validatedTransaction = transaction;
  return next();
}