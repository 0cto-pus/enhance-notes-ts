import mongoose from 'mongoose';
import { DB_URI } from '../config';

export default async () => {
  try {
    if (!DB_URI) {
      throw new Error('MONGO_URI must be defined');
    }
    await mongoose.connect(DB_URI);
    console.log('Db Connected');
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
