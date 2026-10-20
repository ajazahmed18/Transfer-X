import mongoose from 'mongoose';

/**
 * Connect to MongoDB database using Mongoose.
 * Easy-to-understand connection helper with clear console logs.
 */
export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/transferx';
    console.log(`[Database] Connecting to MongoDB at ${mongoUri}...`);

    const conn = await mongoose.connect(mongoUri);
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    console.log('[Database Tip] If you do not have MongoDB running locally, you can use MongoDB Atlas or start MongoDB with: mongod');
  }
};
