import express from 'express';
import { PORT } from './config';
import { databaseConnection } from './database';
import expressApp from './express-app';
import errorHandler from './utils/errors/error-handler';
import { createChannel } from './utils';

const StartServer = async () => {
  const app = express();

  await databaseConnection();

  const channel = await createChannel();

  await expressApp({ app, channel });

  errorHandler(app);

  app
    .listen(PORT, () => {
      console.log(`listening to port ${PORT}`);
    })
    .on('error', (err) => {
      console.log(err);
      process.exit();
    });
};

StartServer();