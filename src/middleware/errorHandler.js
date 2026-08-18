export function notFoundHandler(req, res) {
  res.status(404).json({
    error: `Hittade ingen route för ${req.method} ${req.originalUrl}`
  });
}

export function errorHandler(err, req, res, next) {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Ogiltig JSON i request body.' });
  }

  const status = err.status ?? 500;
  const body = { error: err.message || 'Internt serverfel' };

  if (Array.isArray(err.errors)) {
    body.details = err.errors;
  }

  return res.status(status).json(body);
}