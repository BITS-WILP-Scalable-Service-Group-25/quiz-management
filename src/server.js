const express = require("express");
const logger = require("./config/logger");
const connectDB = require("./config/db");
const quizRoutes = require("./routes/quizRoutes");
const startGrpcServer = require("./config/grpc");

const app = express();
const PORT = process.env.PORT || 5001;

connectDB();
startGrpcServer();

const server = app.listen(PORT, () => {
  logger.info(`✅ Server running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send(`Hello, this is a test message on ${PORT}`);
  logger.info(`Hello, this is a test message on ${PORT}`);
});

app.use(express.json());
if (process.env.ENABLE_REST_API === "true") {
  app.use("/api/quizzes", quizRoutes);
  logger.info("✅ REST API enabled.");
} else {
  logger.info("❌ REST API disabled.");
}

const shutdown = () => {
  logger.info("Stopping server...");
  server.close(() => {
    logger.info("Server stopped");
    process.nextTick(() => process.exit(0));
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
