const express = require('express');
const logger = require('./config/logger');

const app = express();
const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.send(`Hello, this is a test message on ${PORT}`);
  logger.info(`Hello, this is a test message on ${PORT}`);
});

const shutdown = () => {
  logger.info('Stopping server...');
  server.close(() => {
    logger.info('Server stopped');
    process.nextTick(() => process.exit(0));
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);