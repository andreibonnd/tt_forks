import { logger } from './../connections/index.js';
import { status as codes, jwt } from './../helpers/index.js';

async function status(context) {
    context.status = codes.ok;
    context.body = 'OK';
}

async function refreshToken(context) {
    logger.profile('controller:maintenance.refreshToken');
    const tokens = await jwt.refresh.update(context);

    context.response.set('authorization', `Bearer ${tokens.access}`);
    context.response.set('x-refresh-token', tokens.refresh);
    context.response.status = codes.ok;
    logger.profile('controller:maintenance.refreshToken');
}

async function revokeToken(context) {
    logger.profile('controller:maintenance.revokeToken');
    jwt.refresh.check(context);
    context.response.status = codes.ok;
    logger.profile('controller:maintenance.revokeToken');
}

export { status, refreshToken, revokeToken };
