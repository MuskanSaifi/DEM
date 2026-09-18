import "./dnsSetup.js";
import { Resolver } from "node:dns/promises";
import mongoose from "mongoose";
import { PUBLIC_DNS } from "./dnsSetup.js";

function makeDnsResolver() {
  const resolver = new Resolver();
  resolver.setServers(PUBLIC_DNS);
  return resolver;
}

/**
 * mongodb+srv uses Node `resolveSrv` (c-ares → 127.0.0.1 on this machine → ECONNREFUSED).
 * Rewrite to mongodb://seed-hosts so the driver uses OS `dns.lookup` instead.
 */
async function toDirectMongoUrl(mongoUrl) {
  if (!mongoUrl.startsWith("mongodb+srv://")) return mongoUrl;

  const parsed = new URL(mongoUrl);
  const resolver = makeDnsResolver();
  const srvName = `_mongodb._tcp.${parsed.hostname}`;
  const records = await resolver.resolveSrv(srvName);
  if (!records?.length) {
    throw new Error(`No SRV records for ${srvName}`);
  }

  const hosts = records
    .slice()
    .sort((a, b) => a.priority - b.priority || b.weight - a.weight)
    .map((r) => `${r.name.replace(/\.$/, "")}:${r.port || 27017}`)
    .join(",");

  const search = new URLSearchParams(parsed.search);
  search.set("tls", "true");
  try {
    const txt = await resolver.resolveTxt(parsed.hostname);
    const txtJoined = txt.flat().join("");
    const txtParams = new URLSearchParams(txtJoined);
    for (const [key, value] of txtParams.entries()) {
      if (!search.has(key)) search.set(key, value);
    }
  } catch {
    // TXT is optional
  }
  if (!search.has("authSource")) search.set("authSource", "admin");

  const user = parsed.username ? decodeURIComponent(parsed.username) : "";
  const pass = parsed.password ? decodeURIComponent(parsed.password) : "";
  const auth =
    user || pass
      ? `${encodeURIComponent(user)}:${encodeURIComponent(pass)}@`
      : "";
  const dbPath = parsed.pathname && parsed.pathname !== "/" ? parsed.pathname : "/";

  return `mongodb://${auth}${hosts}${dbPath}?${search.toString()}`;
}

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
        serverSelectionTimeoutMS: 15000, // Keep trying to send operations
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        connectTimeoutMS: 15000, // Give up initial connection after 15 seconds
        family: 4, // Use IPv4, skip trying IPv6
        heartbeatFrequencyMS: 10000, // Check connection health every 10 seconds
      };

      const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI || process.env.MONGO_URI;
      if (!mongoUrl) {
        throw new Error("MongoDB connection string not found in environment variables (MONGO_URL, MONGODB_URI, or MONGO_URI)");
      }

      cached.promise = (async () => {
        const directUrl = await toDirectMongoUrl(mongoUrl);
        const conn = await mongoose.connect(directUrl, opts);
        console.log("✅ MongoDB connection established");
        return conn;
      })().catch((error) => {
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
