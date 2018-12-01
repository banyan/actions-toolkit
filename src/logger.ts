import winston from 'winston'

export interface ActionLogger extends winston.Logger {
  fold (summary: string, data: object): void
}

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
}) as ActionLogger

logger.fold = function (summary: string, data: object) {
  this.info(`%%%FOLD ${summary}%%%\n`, data, '\n%%%END FOLD%%%')
}

export default logger
