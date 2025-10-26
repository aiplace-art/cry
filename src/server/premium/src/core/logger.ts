import pino from 'pino';
import { config } from './config.js';

const baseLogger = pino({
  level: config.logLevel,
  ...(config.logPretty && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  }),
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'password',
      'token',
      'apiKey',
      'jwt',
      'authorization',
      'cookie',
      '*.password',
      '*.token',
      '*.apiKey',
    ],
    remove: true,
  },
});

export class Logger {
  private logger: pino.Logger;

  constructor(context?: string) {
    this.logger = context ? baseLogger.child({ context }) : baseLogger;
  }

  trace(msg: string, obj?: object) {
    this.logger.trace(obj, msg);
  }

  debug(msg: string, obj?: object) {
    this.logger.debug(obj, msg);
  }

  info(msg: string, obj?: object) {
    this.logger.info(obj, msg);
  }

  warn(msg: string, obj?: object) {
    this.logger.warn(obj, msg);
  }

  error(msg: string, error?: Error | object) {
    if (error instanceof Error) {
      this.logger.error({
        err: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
      }, msg);
    } else {
      this.logger.error(error, msg);
    }
  }

  fatal(msg: string, error?: Error | object) {
    if (error instanceof Error) {
      this.logger.fatal({
        err: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
      }, msg);
    } else {
      this.logger.fatal(error, msg);
    }
  }

  child(context: string) {
    return new Logger(context);
  }
}

export const logger = new Logger();
