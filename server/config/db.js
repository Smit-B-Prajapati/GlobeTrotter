import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

/**
 * Reusable MongoDB Connection Module with Instant In-Memory Fallback.
 * Connects to process.env.MONGO_URI (or local 27017), and automatically
 * falls back to an embedded in-memory MongoDB server if offline.
 */
export const connectDB = async () => {
  const targetUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/globetrotter';

  try {
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 2000,
    });

    console.log(`===========================================`);
    console.log(` 🍃 Connected to Primary MongoDB Host: ${conn.connection.host}`);
    console.log(` 📂 Database Name: ${conn.connection.name}`);
    console.log(`===========================================`);
    return conn;
  } catch (error) {
    console.warn(`[Database Info] Primary MongoDB at '${targetUri}' is offline. Launching embedded In-Memory MongoDB server...`);

    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();

      const conn = await mongoose.connect(memUri, {
        dbName: 'globetrotter',
      });

      console.log(`===========================================`);
      console.log(` ⚡ Embedded In-Memory MongoDB Server Active!`);
      console.log(` 📍 Database URI: ${memUri}`);
      console.log(`===========================================`);
      return conn;
    } catch (fallbackErr) {
      console.error(`[Database Error] Failed to launch In-Memory MongoDB:`, fallbackErr.message);
      return null;
    }
  }
};
