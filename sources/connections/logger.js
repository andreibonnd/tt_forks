import winston from 'winston';
// import logsene from 'winston-logsene';
import * as configuration from './../configuration/index.js';

const connection = winston.createLogger(configuration.logging.winston);
connection.add(new winston.transports.Console({ level: 'debug' }));

// if (configuration.environment.is.production) {
//     // @ts-ignore
//     connection.add(new logsene(configuration.logging.service));
// }

export { connection };
