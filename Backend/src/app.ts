import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { notFoundHandler } from './middleware/notFound.middleware.js';
import { generalLimiter } from './middleware/rateLimit.middleware.js';

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  );

  // CORS
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman, same-origin)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
          ENV.FRONTEND_URL,
          'http://localhost:5173',
          'http://localhost:3000',
          'http://127.0.0.1:5173'
        ];

        if (allowedOrigins.includes(origin) || origin.endsWith('.localhost')) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive in dev if customized
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS', 'PUT'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-Workspace-ID', 'x-workspace-id', 'X-Workspace-Slug', 'x-workspace-slug']
    })
  );

  // Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // General Rate Limiter
  app.use('/api', generalLimiter);

  // Root welcome / health ping
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: '🚀 LinkVault API is running smoothly',
      version: '1.0.0',
      endpoints: '/api/v1',
      documentation: '/api/v1/health'
    });
  });

  // API Versioning Mounts
  app.use('/api/v1', apiRouter);
  app.use('/api', apiRouter);

  // 404 & Error Handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
