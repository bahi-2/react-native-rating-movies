/*************************************************************/
/************************** Imports **************************/
/*************************************************************/

const winston = require('winston');
const { combine, timestamp, align, 
        prettyPrint, colorize } = winston.format;


/*************************************************************/
/************************** Constants ************************/
/*************************************************************/

const loggingLevels = {
    critical: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
};

const loggingLevelColors = {
    critical: 'red',
    error: 'magenta',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
};

winston.addColors(loggingLevelColors);

const logger = winston.createLogger({
  levels: loggingLevels,
  format: combine(
    colorize(),
    timestamp(),
    align(),
    prettyPrint(),
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});


/*************************************************************/
/************************** Exports **************************/
/*************************************************************/

module.exports = {
    logger: logger,
};