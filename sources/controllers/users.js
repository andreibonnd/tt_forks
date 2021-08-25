import { logger } from './../connections/index.js';
import { security } from './../configuration/index.js';
import { status, jwt } from './../helpers/index.js';
import { users } from './../services/index.js';

async function registration(context) {
    logger.profile('controller:users.registration');
    const body = context.request.body;

    const registered = await users.registration(body, context.throw);
    const tokens = {
        access: jwt.access.generate(registered.payload),
        refresh: await jwt.refresh.generate({ userID: registered.payload.user.id }),
    };

    context.response.set('authorization', `Bearer ${tokens.access}`);
    context.response.set('x-refresh-token', tokens.refresh);
    context.response.body = registered.user;
    context.response.status = status.ok;
    logger.profile('controller:users.registration');
}

async function authentication(context) {
    logger.profile('controller:users.authentication');
    const body = context.request.body;

    const authenticated = await users.authentication(body, context.throw);
    const tokens = {
        access: jwt.access.generate(authenticated.payload),
        refresh: await jwt.refresh.generate({ userID: authenticated.payload.user.id }),
    };

    context.response.set('authorization', `Bearer ${tokens.access}`);
    context.response.set('x-refresh-token', tokens.refresh);
    context.response.body = authenticated.user;
    context.response.status = status.ok;
    logger.profile('controller:users.authentication');
}

const reducer = (accumulator, layer) => ((accumulator[layer] = jwt.access.check.bind(null, layer)), accumulator);
const authorization = Object.keys(security.layers).reduce(reducer, {});

export { registration, authentication, authorization };
