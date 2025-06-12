import winston from 'winston';
import { env } from './env';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Tell winston about these colors
winston.addColors(colors);

// Define the format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define which transports the logger must use
const transports = [
  // Write all logs with level 'error' and below to 'error.log'
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  // Write all logs with level 'info' and below to 'combined.log'
  new winston.transports.File({
    filename: 'logs/combined.log',
  }),
];

// If we're not in production, log to the console as well
if (env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    })
  );
}

// Create the logger
const Logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels,
  format,
  transports,
});

// Create a stream object with a write function that will be used by Morgan
export const stream = {
  write: (message: string) => {
    Logger.http(message.trim());
  },
};

export default Logger; 