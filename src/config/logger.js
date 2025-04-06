const winston = require('winston');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const logDir = process.env.LOG_PATH || path.join(__dirname, '../../logs');
const enableLocalLogs = process.env.ENABLE_LOCAL_LOGS === 'true';
const enableLogglyLogs = process.env.ENABLE_LOGGLY_LOGS === 'true';

if (enableLocalLogs && !fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const transports = [];

if (enableLocalLogs) {
  transports.push(new winston.transports.File({ filename: path.join(logDir, 'app.log') }));
}

transports.push(
  new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
  })
);

if (enableLogglyLogs && process.env.LOGGLY_TOKEN && process.env.LOGGLY_SUBDOMAIN) {
  const { Loggly } = require('winston-loggly-bulk');
  transports.push(
    new Loggly({
      token: process.env.LOGGLY_TOKEN,
      subdomain: process.env.LOGGLY_SUBDOMAIN,
      tags: ["QuizMgmtService"],
      json: true,
    })
  );
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports,
});

if (enableLocalLogs) {
  logger.info("✅ Local Logs enabled.");
} else {
  logger.info("❌ Local Logs disabled.");
}

if (enableLogglyLogs) {
  logger.info("✅ Cloud Loggly Logs  enabled.");
} else {
  logger.info("❌ Cloud Loggly Logs disabled.");
}

module.exports = logger;