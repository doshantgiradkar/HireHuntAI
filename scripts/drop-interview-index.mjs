import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not set in .env.local');
  process.exit(1);
}

async function dropIndex() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const db = mongoose.connection.db;
    const collection = db.collection('interviews');
    
    // Drop the unique index on jobId
    await collection.dropIndex('jobId_1');
    
    console.log('✓ Successfully dropped unique index on jobId');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    if (error.message.includes('index not found')) {
      console.log('✓ Index already dropped or doesn\'t exist');
      await mongoose.connection.close();
      process.exit(0);
    }
    console.error('Error dropping index:', error.message);
    process.exit(1);
  }
}

dropIndex();
