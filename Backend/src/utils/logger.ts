import { ENV } from '../config/env.js';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function formatLog(level: LogLevel, message: string, meta?: any) {
  const timestamp = new Date().toISOString();
  const logObj = {
    timestamp,
    level,
    message,
    ...(meta ? { meta } : {})
  };

  if (ENV.NODE_ENV === 'production') {
    return JSON.stringify(logObj);
  }

  const prefix = {
    info: 'ℹ️ [INFO]',
    warn: '⚠️ [WARN]',
    error: '❌ [ERROR]',
    debug: '🔍 [DEBUG]'
  }[level];

  return `${prefix} [${timestamp}] ${message} ${meta ? JSON.stringify(meta) : ''}`;
}

export const logger = {
  info(message: string, meta?: any) {
    console.log(formatLog('info', message, meta));
  },
  warn(message: string, meta?: any) {
    console.warn(formatLog('warn', message, meta));
  },
  error(message: string, meta?: any) {
    console.error(formatLog('error', message, meta));
  },
  debug(message: string, meta?: any) {
    if (ENV.NODE_ENV !== 'production') {
      console.debug(formatLog('debug', message, meta));
    }
  }
};
