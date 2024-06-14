import * as express from 'express';
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;
import { UserPayload } from './suggestions-types';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
