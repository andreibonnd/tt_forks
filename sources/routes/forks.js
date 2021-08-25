import Router from '@koa/router';
import { validation, users, forks } from './../controllers/index.js';

const validate = validation.forks;
const auth = users.authorization;
const router = new Router({ prefix: '/forks' });
router
    .use(auth['user'])
    // @ts-ignore
    .post('/', validate.create, forks.create)
    .get('/', validate.find.all, forks.find.all) // /?limit=100&offset=0
    .get('/:id', validate.find.byID, forks.find.byID)
    .get('/categories/all', validate.find.categories, forks.find.categories) // /?limit=100&offset=0
    .get('/category/:id', validate.find.byCategory, forks.find.byCategory) // /?limit=100&offset=0
    .get('/user/:login', validate.find.byUser, forks.find.byUser) // /?limit=100&offset=0
    .delete('/:id', validate.remove, forks.remove)
    .patch('/subscribe/category/:id', validate.subscribe.byCategory, forks.subscribe.byCategory)
    .patch('/unsubscribe/category/:id', validate.unsubscribe.byCategory, forks.unsubscribe.byCategory);

export { router };
