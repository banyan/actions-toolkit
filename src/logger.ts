/**
 * A logger backed by [bunyan](https://github.com/trentm/node-bunyan)
 *
 * The default log level is `info`, but you can change it by setting the
 * `LOG_LEVEL` environment variable to `trace`, `debug`, `info`, `warn`,
 * `error`, or `fatal`.
 *
 * ```js
 * app.log("This is an info message");
 * app.log.debug("…so is this");
 * app.log.trace("Now we're talking");
 * app.log.info("I thought you should know…");
 * app.log.warn("Woah there");
 * app.log.error("ETOOMANYLOGS");
 * app.log.fatal("Goodbye, cruel world!");
 * ```
 */

import Logger from 'bunyan'
import bunyanFormat from 'bunyan-format'

function toBunyanLogLevel (level: string) {
  switch (level) {
    case 'info':
    case 'trace':
    case 'debug':
    case 'warn':
    case 'error':
    case 'fatal':
    case undefined:
      return level
    default:
      throw new Error('Invalid log level')
  }
}

function toBunyanFormat (format: string) {
  switch (format) {
    case 'short':
    case 'long':
    case 'simple':
    case 'json':
    case 'bunyan':
    case undefined:
      return format
    default:
      throw new Error('Invalid log format')
  }
}

export const logger = new Logger({
  level: toBunyanLogLevel(process.env.LOG_LEVEL || 'info'),
  name: 'actions',
  stream: new bunyanFormat({ outputMode: toBunyanFormat(process.env.LOG_FORMAT || 'short') })
})
