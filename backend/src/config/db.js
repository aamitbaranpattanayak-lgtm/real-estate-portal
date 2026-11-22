const mongoose = require("mongoose");

let connectionPromise;
let queryMonitoringAttached = false;

const attachSlowQueryLogger = (connection) => {
  if (queryMonitoringAttached || process.env.MONGO_QUERY_LOGS !== "true") return;

  const slowQueryMs = Number(process.env.MONGO_SLOW_QUERY_MS) || 200;
  const started = new Map();
  const client = connection.connection.getClient();
  client.on("commandStarted", (event) => {
    started.set(event.requestId, { command: event.commandName, database: event.databaseName, at: performance.now() });
  });
  client.on("commandSucceeded", (event) => {
    const operation = started.get(event.requestId);
    started.delete(event.requestId);
    if (!operation) return;
    const durationMs = performance.now() - operation.at;
    if (durationMs >= slowQueryMs) {
      console.warn(`Slow MongoDB query: ${operation.command} on ${operation.database} (${durationMs.toFixed(1)}ms)`);
    }
  });
  client.on("commandFailed", (event) => started.delete(event.requestId));
  queryMonitoringAttached = true;
};

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required");
  }

  // Reuse the application's one Mongoose connection if called more than once.
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE) || 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
      monitorCommands: process.env.MONGO_QUERY_LOGS === "true",
    });
  }

  try {
    const conn = await connectionPromise;
    attachSlowQueryLogger(conn);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    connectionPromise = undefined;
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
};

module.exports = connectDB;
