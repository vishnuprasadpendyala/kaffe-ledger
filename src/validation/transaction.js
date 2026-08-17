const REQUIRED_STRINGS = ['sender', 'recipient', 'batchId'];

export function validateTransaction(payload) {
  const errors = [];

  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    return {
      valid: false,
      errors: ['Transaktionen måste vara ett objekt.'],
      transaction: null
    };
  }

  for (const field of REQUIRED_STRINGS) {
    const value = payload[field];

    if (typeof value !== 'string' || value.trim() === '') {
      errors.push(
        `Fältet "${field}" krävs och måste vara en icke-tom sträng.`
      );
    }
  }

  const weightKg = payload.weightKg;

  if (typeof weightKg !== 'number' || !Number.isFinite(weightKg)) {
    errors.push('Fältet "weightKg" krävs och måste vara ett tal.');
  } else if (weightKg <= 0) {
    errors.push('Fältet "weightKg" måste vara större än 0.');
  }

  if (errors.length > 0) {
    return { valid: false, errors, transaction: null };
  }

  return {
    valid: true,
    errors: [],
    transaction: {
      sender: payload.sender.trim(),
      recipient: payload.recipient.trim(),
      batchId: payload.batchId.trim(),
      weightKg
    }
  };
}