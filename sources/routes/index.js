import Router from '@koa/router';
import { router as maintenance } from './maintenance.js';
import { router as users } from './users.js';
import { router as forks } from './forks.js';

const routes = new Router({ prefix: '/api' });
routes.use(maintenance.routes(), maintenance.allowedMethods());
routes.use(users.routes(), users.allowedMethods());
routes.use(forks.routes(), forks.allowedMethods());

export { routes };
