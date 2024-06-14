import { NextFunction, Response, Request } from 'express';
import { validateSignature } from '../../utils';

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    await validateSignature(req);
    return next();
  } catch (err) {
    return next(err);
  }
};
