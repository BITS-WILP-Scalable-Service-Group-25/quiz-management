require("dotenv").config();
const mongoose = require("mongoose");
const logger = require("./logger");

const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      logger.info("✅ MongoDB Connected Successfully");
    } catch (error) {
      logger.error("❌ MongoDB Connection Failed:", error.message);
      process.exit(1); // Exit process on failure
    }
};

module.exports = connectDB;
