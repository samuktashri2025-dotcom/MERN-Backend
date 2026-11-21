import { validationResult } from 'express-validator';

export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array().map(({ path, msg }) => ({ field: path, message: msg })),
    });
  }
  next();
}

export function requireFields(values, fields) {
  for (const field of fields) {
    if (typeof values[field] !== 'string' || !values[field].trim()) {
      const error = new Error(`${field} is required.`);
      error.statusCode = 400;
      throw error;
    }
  }
}
