import env from 'dotenv-defaults';

const root = process.cwd();
env.config({
    path: `${root}/configurations/.env`,
    defaults: `${root}/configurations/.env.defaults`,
});

const {
    NODE_ENV,
    ENVIRONMENT,
    SERVER_PORT,

    POSTGRES_CONNECTION,
    RABBIT_MQ_CONNECTION,
    EMAIL_SENDER,
    EMAIL_SMTP_CONNECTION,

    ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_MAX_AGE,
    REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_MAX_AGE,
} = process.env;
const environment = NODE_ENV || ENVIRONMENT;

const rawEnvironment = {
    is: {
        original: environment,
        development: environment === 'development',
        test: environment === 'test',
        production: environment === 'production',
    },
    server: {
        root,
        port: Number(SERVER_PORT),
    },
    connections: {
        postgres: POSTGRES_CONNECTION,
        rabbitMQ: RABBIT_MQ_CONNECTION,
        email: {
            sender: EMAIL_SENDER,
            connection: EMAIL_SMTP_CONNECTION,
        },
    },
    security: {
        tokens: {
            access: {
                secret: ACCESS_TOKEN_SECRET,
                maxAge: Number(ACCESS_TOKEN_MAX_AGE),
            },
            refresh: {
                secret: REFRESH_TOKEN_SECRET,
                maxAge: Number(REFRESH_TOKEN_MAX_AGE),
            },
        },
    },
};

export { rawEnvironment as environment };
