import Router from '@koa/router';
import { maintenance } from './../controllers/index.js';

const router = new Router({ prefix: '/maintenance' });
router
    // @ts-ignore
    .get('/status', maintenance.status)
    .patch('/refresh-token', maintenance.refreshToken)
    .patch('/revoke-token', maintenance.revokeToken);

export { router };
