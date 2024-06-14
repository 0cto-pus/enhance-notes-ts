import express from 'express';
import cors from 'cors';
import { suggestions } from './api';
import { AppParams } from './types';

export default async ({ app, channel }: AppParams) => {
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cors());
  app.use(express.static(__dirname + '/public'));

  suggestions({ app, channel });
};
