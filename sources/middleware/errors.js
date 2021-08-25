import { v4 } from 'uuid';
import * as helpers from './../helpers/index.js';
import { logger } from './../connections/index.js';

const beautify = (object) => JSON.stringify(object, undefined, 4);
const getRequest = (context) => ({
    url: context.request.url,
    method: context.request.method,
    body: { ...context.request.body },
});

function errors(application) {
    application.on('error', (error, context) =>
        logger.error(
            'server:errors.internal',
            beautify({ ip: context.request.ip, error, request: getRequest(context) }),
        ),
    );

    return async function (context, next) {
        try {
            await next();
        } catch (error) {
            context.status = error.statusCode || error.status || helpers.status.internal_server_error;

            if (context.status < 500) {
                logger.warn('server:warnings.client', { error, request: getRequest(context) });
                context.body = error.message;
            } else {
                const uuid = v4();
                const body = { message: error.message };
                body.uuid = error.uuid = uuid;

                context.body = body;
                context.app.emit('error', error, context);
            }
        }
    };
}

export { errors };
