require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

    const shutdown = (signal) => {
      console.log(`${signal} received; closing server`);
      server.close(async () => {
        await mongoose.connection.close(false);
        process.exit(0);
      });
    };
    process.once("SIGTERM", () => shutdown("SIGTERM"));
    process.once("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
