import { environment } from './environment.js';

const logging = {
    winston: {
        level: 'info',
        exitOnError: false, // function(error)
        // defaultMeta: { '#node': environment.application.uuid },
    },
    // service: {
    //     token: environment.connections.logger,
    //     url: 'https://logsene-receiver.sematext.com/_bulk',
    //     type: 'logger',
    // },
};

const security = {
    cors: {
        origin: undefined,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'PATCH'],
        allowHeaders: ['content-type', 'authorization', 'x-refresh-token'],
        exposeHeaders: ['authorization', 'x-refresh-token'],
        credentials: false,
        maxAge: 604_800, // 7d * 24h * 60m * 60s
        optionsSuccessStatus: 204,
    },
    tokens: {
        algorithm: 'HS512', // RS512 for microservices
        access: {
            secret: environment.security.tokens.access.secret,
            maxAge: environment.security.tokens.access.maxAge,
        },
        refresh: {
            secret: environment.security.tokens.refresh.secret,
            maxAge: environment.security.tokens.refresh.maxAge,
        },
    },
    pbkdf2: {
        hashBytes: 64,
        saltBytes: 16,
        iterations: 500_000,
        algorithm: 'sha512',
        encoding: 'base64url', // 'hex'
    },
    layers: {
        admin: ['admin', 'moderator', 'user'],
        moderator: ['moderator', 'user'],
        user: ['user'],
    },
};

const other = {
    bodyParser: {
        enableTypes: ['json'],
        encoding: 'utf-8',
        jsonLimit: '320kb',
        strict: true,
        onerror: async function (error, context) {
            const { status } = await import('./../helpers/index.js');
            context.throw(status.unprocessable_entity, error);
        },
    },
    rabbitMQ: {
        channelMax: 100,
        locale: 'en_US',
    },
    nodemailer: {
        maxMessages: 250,
        maxConnections: 20,
    },
};

export { logging, security, other };
