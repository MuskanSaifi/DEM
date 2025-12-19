import mongoose from "mongoose";

// ✅ Cache the connection to prevent multiple connections
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectdb = async () => {
  try {
    // ✅ If already connected, return existing connection
    if (cached.conn) {
      return cached.conn;
    }

    // ✅ If connection is in progress, wait for it
    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4, // Use IPv4, skip trying IPv6
      };

      cached.promise = mongoose.connect(process.env.MONGO_URL, opts).then((mongoose) => {
        return mongoose;
      });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null; // Reset promise on error
    console.error(`Database connection failed: ${error.message}`);
    throw error;
  }
};

export default connectdb;