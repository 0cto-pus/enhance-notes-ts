import dotEnv from 'dotenv';

if (process.env.NODE_ENV !== 'prod') {
  console.log(process.env.NODE_ENV);

  dotEnv.config({ path: './.env.dev' });
} else {
  dotEnv.config();
}

export const PORT = process.env.PORT;
export const DB_URI = process.env.MONGODB_URI;
export const APP_SECRET = process.env.APP_SECRET;
export const SUGGESTION_SERVICE = 'suggestion_service';
export const USER_SERVICE = 'user_service';
export const QUEUE_NAME = 'NOTES_QUEUE';
export const EXCHANGE_NAME = 'ENHANCE_NOTE';
export const MESSAGE_BROKER_URL = process.env.MESSAGE_BROKER_URL;
export const RPC_QUEUE_NAME = 'NOTES_RPC';
