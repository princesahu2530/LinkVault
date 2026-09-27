import mongoose from 'mongoose';
import { ENV } from './env.js';

let isConnected = false;
let memoryServer: any = null;

export async function connectDatabase(): Promise<typeof mongoose> {
  if (isConnected) {
    return mongoose;
  }

  const connectOptions: mongoose.ConnectOptions = {
    serverSelectionTimeoutMS: 5000,
  };

  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, connectOptions);
    isConnected = true;
    console.log(`✅ MongoDB Connected to: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err: any) {
    console.warn(`⚠️ Could not connect to primary MongoDB at "${ENV.MONGODB_URI}": ${err.message}`);
    
    // In development or test mode, spin up MongoDB server with persistent local storage
    if (ENV.NODE_ENV !== 'production') {
      try {
        console.log('🔄 Initializing persistent local MongoDB storage for seamless development...');
        const path = await import('path');
        const fs = await import('fs');
        const dbDir = path.resolve(process.cwd(), '.db_data');
        if (!fs.existsSync(dbDir)) {
          fs.mkdirSync(dbDir, { recursive: true });
        }

        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create({
          instance: {
            dbPath: dbDir,
            storageEngine: 'wiredTiger'
          }
        });
        const memoryUri = memoryServer.getUri('linkvault');
        const conn = await mongoose.connect(memoryUri);
        isConnected = true;
        console.log(`✅ Connected to Persistent Local MongoDB (${dbDir}) at: ${memoryUri}`);
        return conn;
      } catch (memErr: any) {
        console.warn('⚠️ Could not start persistent storage engine, falling back to dynamic instance:', memErr.message);
        try {
          const { MongoMemoryServer } = await import('mongodb-memory-server');
          memoryServer = await MongoMemoryServer.create();
          const memoryUri = memoryServer.getUri('linkvault');
          const conn = await mongoose.connect(memoryUri);
          isConnected = true;
          console.log(`✅ Connected to In-Memory MongoDB: ${memoryUri}`);
          return conn;
        } catch (subErr: any) {
          console.error('❌ Failed to start embedded MongoDB server:', subErr);
          throw subErr;
        }
      }
    }

    throw err;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) return;
  
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
    }
    isConnected = false;
    console.log('🔌 MongoDB connection closed gracefully.');
  } catch (err) {
    console.error('Error disconnecting MongoDB:', err);
  }
}

mongoose.connection.on('error', (err) => {
  console.error('MongoDB Runtime Error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected.');
  isConnected = false;
});
