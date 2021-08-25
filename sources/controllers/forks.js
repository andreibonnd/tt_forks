import { logger } from './../connections/index.js';
import { forks } from './../services/index.js';

async function create(context) {
    logger.profile('controller:forks.create');
    const body = context.request.body;
    const user = context.state.payload.user;

    context.response.body = await forks.create(body, user, context.throw);
    logger.profile('controller:forks.create');
}

const find = {
    all: async function (context) {
        logger.profile('controller:forks.find.all');
        const query = context.request.query;
        const user = context.state.payload.user;

        context.response.body = await forks.find.all(query, user, context.throw);
        logger.profile('controller:forks.find.all');
    },
    byID: async function (context) {
        logger.profile('controller:forks.find.byID');
        const parameters = context.request.params;
        const user = context.state.payload.user;

        context.response.body = await forks.find.byID(parameters, user, context.throw);
        logger.profile('controller:forks.find.byID');
    },
    categories: async function (context) {
        logger.profile('controller:forks.find.categories');
        const query = context.request.query;
        const user = context.state.payload.user;

        context.response.body = await forks.find.categories(query, user, context.throw);
        logger.profile('controller:forks.find.categories');
    },
    byCategory: async function (context) {
        logger.profile('controller:forks.find.byCategory');
        const parameters = context.request.params;
        const query = context.request.query;
        const user = context.state.payload.user;

        context.response.body = await forks.find.byCategory({ ...parameters, ...query }, user, context.throw);
        logger.profile('controller:forks.find.byCategory');
    },
    byUser: async function (context) {
        logger.profile('controller:forks.find.byUser');
        const parameters = context.request.params;
        const query = context.request.query;
        const user = context.state.payload.user;

        context.response.body = await forks.find.byUser({ ...parameters, ...query }, user, context.throw);
        logger.profile('controller:forks.find.byUser');
    },
};

async function remove(context) {
    logger.profile('controller:forks.remove');
    const parameters = context.request.params;
    const user = context.state.payload.user;

    context.response.body = await forks.remove(parameters, user, context.throw);
    logger.profile('controller:forks.remove');
}

const subscribe = {
    byCategory: async function (context) {
        logger.profile('controller:forks.subscribe.byCategory');
        const parameters = context.request.params;
        const user = context.state.payload.user;

        context.response.body = await forks.subscribe.byCategory(parameters, user, context.throw);
        logger.profile('controller:forks.subscribe.byCategory');
    },
};

const unsubscribe = {
    byCategory: async function (context) {
        logger.profile('controller:forks.unsubscribe.byCategory');
        const parameters = context.request.params;
        const user = context.state.payload.user;

        context.response.body = await forks.unsubscribe.byCategory(parameters, user, context.throw);
        logger.profile('controller:forks.unsubscribe.byCategory');
    },
};

export { create, find, remove, subscribe, unsubscribe };
