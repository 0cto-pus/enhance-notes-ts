import { Application, Request, Response, NextFunction } from 'express';
import UserService from '../services/user-service';
import { body } from 'express-validator';
import validateRequest from './middlewares/validate-request';
import { AuthRequestBodyParams } from 'types/user-types';

export default (app: Application) => {
  const service = new UserService();

  app.post(
    '/signup',
    [
      body('email').isEmail().withMessage('Email must be valid'),
      body('password')
        .isLength({ min: 10, max: 20 })
        .trim()
        .withMessage('Password must be between 10 and 20 characters'),
    ],
    validateRequest,
    async (
      req: Request<{}, {}, AuthRequestBodyParams>,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const { email, password } = req.body;
        const data = await service.signUp({ email, password });
        return res.json(data);
      } catch (error) {
        next(error);
      }
    }
  );

  app.post(
    '/signin',
    [
      body('email').isEmail().withMessage('Email must be valid'),
      body('password')
        .trim()
        .notEmpty()
        .withMessage('You must supply a password'),
    ],
    validateRequest,
    async (
      req: Request<{}, {}, AuthRequestBodyParams>,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const { email, password } = req.body;
        const data = await service.signIn({ email, password });
        return res.json(data);
      } catch (error) {
        next(error);
      }
    }
  );

  app.post(
    '/signout',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        res.clearCookie('jwt');
        res.status(200).send({ message: 'Signout successful' });
      } catch (error) {
        next(error);
      }
    }
  );
};
