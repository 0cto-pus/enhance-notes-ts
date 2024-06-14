import * as express from 'express';
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;
import { UserPayload } from './notes-types';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
