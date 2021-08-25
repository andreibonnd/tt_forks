// https://github.com/sideway/joi/blob/master/API.md
import joi from 'joi';
import { validate } from './../helpers/index.js';

const common = {
    UUIDv4: joi.string().trim().guid({ version: 'uuidv4' }).required(),
    email: joi.string().email().max(128).required(),
    text: joi.string().trim().min(2).max(32).required(),
    password: joi.string().trim().min(2).max(64).required(),
};

// prettier-ignore
const queries = {
    limit: joi
        .object()
        .keys({
            limit: joi.number().integer().positive().min(1).max(100).required(),
            offset: joi.number().integer().positive().allow(0).required(),
        }).preferences({ convert: true }).required(),
};

// prettier-ignore
const schemas = {
    users: {
        registration: {
            body: joi.object().keys({
                login: common.text,
                email: common.email,
                password: common.password,
            }).required(),
        },
        authentication: {
            body: joi.object().keys({
                login: common.text.optional(),
                email: joi.when('login', {
                    is: joi.exist(),
                    then: common.email.optional(),
                    otherwise: common.email.required(),
                }),
                password: common.password,
            }).or('login', 'email').required(),
        },
    },
    forks: {
        create: {
            body: joi.object().keys({
                name: joi.string().min(2).max(32).required(),
                description: joi.string().min(2).max(512).required(),
                creation_year: joi.number().integer().min(-10_000).max(10_000).required(),
                category_id: common.UUIDv4.optional(),
            }).required(),
        },
        find: {
            all: { query: queries.limit },
            byID: { parameters: joi.object().keys({ id: common.UUIDv4 }).required() },
            categories: { query: queries.limit },
            byCategory: {
                parameters: joi.object().keys({ id: common.UUIDv4 }).required(),
                query: queries.limit,
            },
            byUser: {
                parameters: joi.object().keys({ login: common.text }).required(),
                query: queries.limit,
            },
        },
        remove: { parameters: joi.object().keys({ id: common.UUIDv4 }).required() },
        subscribe: {
            byCategory: { parameters: joi.object().keys({ id: common.UUIDv4 }).required() },
        },
        unsubscribe: {
            byCategory: { parameters: joi.object().keys({ id: common.UUIDv4 }).required() },
        },
    },
};

const validation = {
    users: {
        registration: validate.bind(null, schemas.users.registration),
        authentication: validate.bind(null, schemas.users.authentication),
    },
    forks: {
        create: validate.bind(null, schemas.forks.create),
        find: {
            all: validate.bind(null, schemas.forks.find.all),
            byID: validate.bind(null, schemas.forks.find.byID),
            categories: validate.bind(null, schemas.forks.find.categories),
            byCategory: validate.bind(null, schemas.forks.find.byCategory),
            byUser: validate.bind(null, schemas.forks.find.byUser),
        },
        remove: validate.bind(null, schemas.forks.remove),
        subscribe: {
            byCategory: validate.bind(null, schemas.forks.subscribe.byCategory),
        },
        unsubscribe: {
            byCategory: validate.bind(null, schemas.forks.unsubscribe.byCategory),
        },
    },
};

export { schemas, validation };
