import dotEnv from 'dotenv';

if (process.env.NODE_ENV !== 'prod') {
  dotEnv.config({ path: './.env.dev' });
} else {
  dotEnv.config();
}

export const PORT = process.env.PORT;
export const DB_URI = process.env.MONGODB_URI;
export const APP_SECRET = process.env.APP_SECRET;
export const OPEN_AI_SECRET = process.env.OPEN_AI_SECRET;
export const EXCHANGE_NAME = 'ENHANCE_NOTE';
export const SUGGESTION_SERVICE = 'suggestion_service';
export const QUEUE_NAME = 'NOTES_QUEUE';
export const MESSAGE_BROKER_URL = process.env.MESSAGE_BROKER_URL;
