export const TEST_DIFFICULTY = 1;

export const DEFAULT_DIFFICULTY = {
  development: 2,
  production: 3
};

export function getDifficulty(env = process.env) {
  const nodeEnv = env.NODE_ENV || 'development';

  if (nodeEnv === 'test') {
    return TEST_DIFFICULTY;
  }

  const explicit = Number.parseInt(env.DIFFICULTY ?? '', 10);

  if (Number.isInteger(explicit) && explicit >= 0) {
    return explicit;
  }

  return DEFAULT_DIFFICULTY[nodeEnv] ?? DEFAULT_DIFFICULTY.development;
}

export function getPort(env = process.env) {
  const port = Number.parseInt(env.PORT ?? '', 10);

  return Number.isInteger(port) && port > 0 ? port : 3000;
}