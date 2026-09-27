import { createApp } from './app.js';
import { ENV } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { logger } from './utils/logger.js';

async function startServer() {
  try {
    await connectDatabase();

    const app = createApp();
    const server = app.listen(ENV.PORT, () => {
      logger.info(`🚀 LinkVault Backend Server running on http://localhost:${ENV.PORT}`);
      logger.info(`📡 API Endpoints active at http://localhost:${ENV.PORT}/api/v1`);
      logger.info(`🔒 Allowed CORS Origin: ${ENV.FRONTEND_URL}`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDatabase();
        process.exit(0);
      });

      // Force close if graceful fails after 10s
      setTimeout(() => {
        logger.error('Forceful shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err: any) {
    logger.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
