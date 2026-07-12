const validateRequest = (schema) => (req, _res, next) => {
  const parsed = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!parsed.success) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.details = parsed.error.flatten();
    return next(error);
  }

  req.body = parsed.data.body ?? req.body;
  req.params = parsed.data.params ?? req.params;
  req.query = parsed.data.query ?? req.query;
  return next();
};

module.exports = validateRequest;
