import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../.mongo_data');

let mongoMemoryServer = null;

/**
 * Reusable MongoDB Connection Module with Persistent Disk Fallback.
 * Connects to process.env.MONGO_URI (or local 27017), and automatically
 * falls back to a disk-persisted embedded MongoDB server if offline.
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
    console.warn(`[Database Info] Primary MongoDB at '${targetUri}' is offline. Launching disk-persisted embedded MongoDB server...`);

    try {
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }

      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbPath,
          storageEngine: 'wiredTiger',
        },
      });

      const memUri = mongoMemoryServer.getUri();

      const conn = await mongoose.connect(memUri, {
        dbName: 'globetrotter',
      });

      console.log(`===========================================`);
      console.log(` ⚡ Disk-Persisted Embedded MongoDB Active!`);
      console.log(` 💾 Data Storage Location: ${dbPath}`);
      console.log(`===========================================`);
      return conn;
    } catch (fallbackErr) {
      console.error(`[Database Error] Failed to launch Embedded MongoDB:`, fallbackErr.message);
      return null;
    }
  }
};
