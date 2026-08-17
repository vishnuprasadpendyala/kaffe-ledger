import { describe, it, expect } from 'vitest';
import { getDifficulty, getPort } from '../../src/config.js';

describe('getDifficulty', () => {
  it('är 1 i testmiljö så att mining aldrig ger test-timeout', () => {
    expect(getDifficulty({ NODE_ENV: 'test' })).toBe(1);
  });

  it('går inte att skruva upp via DIFFICULTY i testmiljö', () => {
    expect(getDifficulty({ NODE_ENV: 'test', DIFFICULTY: '5' })).toBe(1);
  });

  it('är 2 i development och 3 i production som standard', () => {
    expect(getDifficulty({ NODE_ENV: 'development' })).toBe(2);
    expect(getDifficulty({ NODE_ENV: 'production' })).toBe(3);
  });

  it('faller tillbaka på development när NODE_ENV saknas', () => {
    expect(getDifficulty({})).toBe(2);
  });

  it('låter DIFFICULTY styra utanför testmiljö', () => {
    expect(getDifficulty({ NODE_ENV: 'production', DIFFICULTY: '4' })).toBe(4);
  });

  it('ignorerar ogiltiga DIFFICULTY-värden', () => {
    expect(getDifficulty({ NODE_ENV: 'production', DIFFICULTY: 'kaffe' })).toBe(3);
    expect(getDifficulty({ NODE_ENV: 'production', DIFFICULTY: '-1' })).toBe(3);
  });
});

describe('getPort', () => {
  it('använder PORT när den är satt', () => {
    expect(getPort({ PORT: '8080' })).toBe(8080);
  });

  it('faller tillbaka på 3000', () => {
    expect(getPort({})).toBe(3000);
    expect(getPort({ PORT: 'abc' })).toBe(3000);
  });
});