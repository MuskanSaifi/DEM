import mongoose from "mongoose";

// ✅ Cache the connection to prevent multiple connections
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// ✅ Connection health check
const isConnected = () => {
  return (
    cached.conn &&
    mongoose.connection.readyState === 1 // 1 = connected
  );
};

// ✅ Setup connection event handlers (only once)
if (!cached.setupComplete) {
  mongoose.connection.on("connected", () => {
    console.log("✅ MongoDB connected successfully");
  });

  mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB connection error:", err.message);
    cached.conn = null; // Reset connection on error
    cached.promise = null;
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB disconnected. Will reconnect on next request.");
    cached.conn = null; // Reset connection
    cached.promise = null;
  });

  // ✅ Handle process termination
  process.on("SIGINT", async () => {
    if (cached.conn) {
      await mongoose.connection.close();
      console.log("MongoDB connection closed through app termination");
      process.exit(0);
    }
  });

  cached.setupComplete = true;
}

const connectdb = async () => {
  try {
    // ✅ Check if already connected and healthy
    if (isConnected()) {
      return cached.conn;
    }

    // ✅ If connection is in progress, wait for it
    if (cached.promise) {
      try {
        cached.conn = await cached.promise;
        return cached.conn;
      } catch (error) {
        // If connection failed, reset and try again
        cached.promise = null;
        cached.conn = null;
      }
    }

    // ✅ Create new connection
    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        maxPoolSize: 10, // Maintain up to 10 socket connections
        minPoolSize: 2, // Keep at least 2 connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
        family: 4, // Use IPv4, skip trying IPv6
        heartbeatFrequencyMS: 10000, // Check connection health every 10 seconds
      };

      cached.promise = mongoose
        .connect(process.env.MONGO_URL, opts)
        .then((mongoose) => {
          console.log("✅ MongoDB connection established");
          return mongoose;
        })
        .catch((error) => {
          cached.promise = null;
          cached.conn = null;
          throw error;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null; // Reset promise on error
    cached.conn = null;
    console.error(`❌ Database connection failed: ${error.message}`);
    throw error;
  }
};

export default connectdb;