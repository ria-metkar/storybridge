/**
 * Validates and sanitises request input with zod schemas.
 * Parsed body replaces req.body; parsed query/params land on req.validated.
 */
export const validate =
  ({ body, query, params } = {}) =>
  (req, _res, next) => {
    try {
      req.validated = {};
      if (body) req.body = body.parse(req.body ?? {});
      if (query) req.validated.query = query.parse(req.query);
      if (params) req.validated.params = params.parse(req.params);
      next();
    } catch (err) {
      next(err);
    }
  };
