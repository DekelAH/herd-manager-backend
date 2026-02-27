import { createLogger, format, transports } from 'winston'

const { combine, timestamp, printf, colorize, json, errors } = format

const readableFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
  return stack
    ? `${timestamp} [${level}] ${message}\n${stack}`
    : `${timestamp} [${level}]  ${message}${metaStr}`
})

const isDev = process.env.NODE_ENV !== 'production'

const logger = createLogger({
  level: isDev ? 'debug' : 'http',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
  ),
  transports: [
    new transports.Console({
      format: isDev
        ? combine(colorize(), readableFormat)
        : combine(json())
    })
  ],
  silent: process.env.NODE_ENV === 'test'
})

export default logger
