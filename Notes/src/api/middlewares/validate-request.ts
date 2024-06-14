import { validationResult } from 'express-validator';
import { RequestValidationError } from '../../utils/errors/app-errors';
import { NextFunction, Request, Response } from 'express';

export default (req: Request, Res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    throw new RequestValidationError(errorMessages.join(', '));
  }
  next();
};
