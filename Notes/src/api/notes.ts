import { NextFunction, Response, Request } from 'express';
import NotesService from '../services/notes-service';
import { body } from 'express-validator';
import validateRequest from './middlewares/validate-request';
import UserAuth from './middlewares/auth';
import { publishMessage, RPCObserver, getUser } from '../utils';
import { RPC_QUEUE_NAME, SUGGESTION_SERVICE } from '../config';
import { AddNoteParams, AppParams } from 'types/notes-types';

export default ({ app, channel }: AppParams) => {
  const service = new NotesService();

  RPCObserver({ RPC_QUEUE_NAME, service });

  app.post(
    '/addnote',
    UserAuth,
    [
      body('note')
        .isLength({ min: 10 })
        .withMessage('Notes must be minimum 10 characters'),
    ],
    validateRequest,
    async (
      req: Request<{}, {}, AddNoteParams>,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const user = getUser(req);
        const { _id } = user;
        const { note } = req.body;
        const { notesResult, payload } = await service.createNote({
          _id,
          note,
        });

        publishMessage({
          channel,
          serviceName: SUGGESTION_SERVICE,
          msg: JSON.stringify(payload),
        });

        return res.json(notesResult);
      } catch (error) {
        next(error);
      }
    }
  );
  app.get(
    '/',
    UserAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      const user = getUser(req);
      const { _id } = user;
      try {
        const data = await service.getNotes({ _id });
        return res.status(200).json(data);
      } catch (error) {
        next(error);
      }
    }
  );
};
