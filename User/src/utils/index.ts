import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';
import {
  TokenExpiredError,
  AuthorizeError,
  APIError,
} from './errors/app-errors';
import { APP_SECRET } from '../config';
import { ValidatePasswordParams, GeneratePasswordParams } from '../types';

//Auth Operations
//TODO: PUBLIC, PRIVATE ERROR MESSAGE DURUMLARI AYARLANACAK

export const generateSalt = async (): Promise<string> => {
  try {
    return await bcrypt.genSalt();
  } catch (error) {
    throw new APIError('Auth Error');
  }
};

export const generatePassword = async ({
  password,
  salt,
}: GeneratePasswordParams): Promise<string> => {
  try {
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new APIError('Auth Error');
  }
};

export const validatePassword = async ({
  password,
  savedPassword,
  salt,
}: ValidatePasswordParams): Promise<boolean> => {
  const hashedPassword = await generatePassword({
    password,
    salt,
  });
  return hashedPassword === savedPassword;
};

export const generateSignature = async (
  payload: JwtPayload
): Promise<string> => {
  if (!APP_SECRET) {
    throw new AuthorizeError('APP_SECRET is not defined');
  }
  try {
    return jwt.sign(payload, APP_SECRET, { expiresIn: '1d' });
  } catch (error) {
    throw new APIError('An error occurred while generating the token');
  }
};

export const validateSignature = async (req: Request): Promise<boolean> => {
  const signature = req.get('Authorization');

  if (signature) {
    try {
      if (!APP_SECRET) {
        throw new AuthorizeError('APP_SECRET is not defined');
      }
      const payload = jwt.verify(
        signature.split(' ')[1],
        APP_SECRET
      ) as JwtPayload;
      req.user = payload;
      return true;
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new TokenExpiredError('Token has expired');
      }
      throw new AuthorizeError('Invalid token');
    }
  } else {
    throw new AuthorizeError('No token provided');
  }
};
