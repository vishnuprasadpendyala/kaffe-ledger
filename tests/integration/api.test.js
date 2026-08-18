import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { Blockchain } from '../../src/blockchain/Blockchain.js';

const transaktion = {
  sender: 'Finca La Aurora',
  recipient: 'Nordic Roastery',
  batchId: 'B-2024-001',
  weightKg: 60
};

describe('Coffee ledger API', () => {
  let blockchain;
  let app;

  beforeEach(() => {
    blockchain = new Blockchain();
    app = createApp(blockchain);
  });

  describe('GET /health', () => {
    it('svarar med status och aktuell svårighetsgrad', async () => {
      const res = await request(app).get('/health').expect(200);
      expect(res.body).toMatchObject({ status: 'ok', difficulty: 1, env: 'test' });
    });
  });

  describe('GET /blockchain', () => {
    it('returnerar hela kedjan med genesisblocket', async () => {
      const res = await request(app).get('/blockchain').expect(200);
      expect(res.body.length).toBe(1);
      expect(res.body.chain).toHaveLength(1);
      expect(res.body.chain[0].index).toBe(0);
      expect(res.body.isValid).toBe(true);
      expect(res.body.pendingTransactions).toEqual([]);
    });

    it('speglar väntande transaktioner och nya block', async () => {
      await request(app).post('/transactions').send(transaktion).expect(201);
      await request(app).post('/mine').expect(201);
      const res = await request(app).get('/blockchain').expect(200);
      expect(res.body.length).toBe(2);
      expect(res.body.chain[1].transactions).toEqual([transaktion]);
      expect(res.body.isValid).toBe(true);
    });
  });

  describe('POST /transactions', () => {
    it('lägger en giltig kaffeförflyttning i pendingTransactions', async () => {
      const res = await request(app).post('/transactions').send(transaktion).expect(201);
      expect(res.body.blockIndex).toBe(1);
      expect(res.body.transaction).toEqual(transaktion);
      expect(blockchain.pendingTransactions).toEqual([transaktion]);
    });

    it('avvisar en transaktion som saknar batchId med 400', async () => {
      const { batchId, ...utanBatchId } = transaktion;
      const res = await request(app).post('/transactions').send(utanBatchId).expect(400);
      expect(res.body.error).toBe('Ogiltig transaktion');
      expect(res.body.details.some((d) => d.includes('batchId'))).toBe(true);
      expect(blockchain.pendingTransactions).toHaveLength(0);
    });

    it('avvisar en tom body med 400 och listar alla saknade fält', async () => {
      const res = await request(app).post('/transactions').send({}).expect(400);
      expect(res.body.details).toHaveLength(4);
    });

    it('avvisar negativ vikt med 400', async () => {
      await request(app)
        .post('/transactions')
        .send({ ...transaktion, weightKg: -10 })
        .expect(400);
    });

    it('avvisar trasig JSON med 400 istället för att krascha', async () => {
      const res = await request(app)
        .post('/transactions')
        .set('Content-Type', 'application/json')
        .send('{"sender": ')
        .expect(400);
      expect(res.body.error).toMatch(/JSON/i);
    });
  });

  describe('POST /mine', () => {
    it('mine:ar ett block, tömmer poolen och returnerar blocket', async () => {
      await request(app).post('/transactions').send(transaktion).expect(201);
      await request(app)
        .post('/transactions')
        .send({ sender: 'Nordic Roastery', recipient: 'Kafé Bönan', batchId: 'B-2024-001', weightKg: 12 })
        .expect(201);
      const res = await request(app).post('/mine').expect(201);
      const { block } = res.body;
      expect(block.index).toBe(1);
      expect(block.transactions).toHaveLength(2);
      expect(block.previousHash).toBe(blockchain.chain[0].hash);
      expect(block.hash.startsWith('0')).toBe(true);
      expect(block).toHaveProperty('nonce');
      expect(block).toHaveProperty('timestamp');
      expect(blockchain.pendingTransactions).toEqual([]);
    });

    it('svarar 400 när det inte finns några väntande transaktioner', async () => {
      const res = await request(app).post('/mine').expect(400);
      expect(res.body.error).toMatch(/väntande transaktioner/i);
    });

    it('bygger en giltig kedja över flera block', async () => {
      for (const batchId of ['B-1', 'B-2', 'B-3']) {
        await request(app).post('/transactions').send({ ...transaktion, batchId }).expect(201);
        await request(app).post('/mine').expect(201);
      }
      const res = await request(app).get('/blockchain').expect(200);
      expect(res.body.length).toBe(4);
      expect(res.body.isValid).toBe(true);
    });
  });

  describe('okända routes', () => {
    it('svarar 404 med ett tydligt felmeddelande', async () => {
      const res = await request(app).get('/kaffe').expect(404);
      expect(res.body.error).toContain('/kaffe');
    });
  });
});