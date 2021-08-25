import Router from '@koa/router';
import { validation, users } from './../controllers/index.js';

const validate = validation.users;
const router = new Router({ prefix: '/users' });
router
    // @ts-ignore
    .post('/registration', validate.registration, users.registration)
    .post('/authentication', validate.authentication, users.authentication);

export { router };
