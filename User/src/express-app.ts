import express from 'express';
import cors from 'cors';
import { user } from './api';

export default async (app: express.Application) => {
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cors());
  app.use(express.static(__dirname + '/public'));

  user(app);
};
