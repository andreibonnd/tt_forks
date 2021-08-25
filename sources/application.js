import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import * as configuration from './configuration/index.js';
import * as middleware from './middleware/index.js';
import { routes } from './routes/index.js';

const application = new Koa({ proxy: true });

application
    .use(middleware.errors(application))
    .use(cors(configuration.security.cors))
    .use(bodyParser(configuration.other.bodyParser))
    .use(routes.routes())
    .use(routes.allowedMethods());

export { application };
