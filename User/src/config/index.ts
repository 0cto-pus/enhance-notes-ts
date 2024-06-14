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
