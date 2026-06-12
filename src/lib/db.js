import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}
//conn means connection is live while promise means will give u connection waiit, promis is used for simultaneous user going for conneciton 
//so there couldnt be so much flood of connection we are using promise that request has gone from sever for connection mongodb
async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;

// For NextAuth adapter
import { MongoClient } from 'mongodb';

const client = new MongoClient(MONGODB_URI);
const clientPromise = client.connect();

export { clientPromise };