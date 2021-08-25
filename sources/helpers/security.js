import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { security } from './../configuration/index.js';
import { logger, postgres } from './../connections/index.js';
import { status } from './index.js';

const password = {
    hash: async function (password) {
        const salt = await new Promise((resolve, reject) =>
            crypto.randomBytes(security.pbkdf2.saltBytes, (error, buffer) =>
                error ? reject(`RandomBytes: ${error.message}`) : resolve(buffer),
            ),
        );

        const hash = await new Promise((resolve, reject) =>
            crypto.pbkdf2(
                password,
                salt,
                security.pbkdf2.iterations,
                security.pbkdf2.hashBytes,
                security.pbkdf2.algorithm,
                (error, derivedKey) => (error ? reject(`pbkdf2: ${error.message}`) : resolve(derivedKey)),
            ),
        );

        const array = new ArrayBuffer(hash.length + salt.length + 8);
        const hashFrame = Buffer.from(array);

        hashFrame.writeUInt32BE(salt.length, 0);
        hashFrame.writeUInt32BE(security.pbkdf2.iterations, 4);

        salt.copy(hashFrame, 8);
        hash.copy(hashFrame, salt.length + 8);

        // @ts-ignore
        return hashFrame.toString(security.pbkdf2.encoding);
    },
    compare: async function (password, hashFrame) {
        // @ts-ignore
        hashFrame = Buffer.from(hashFrame, security.pbkdf2.encoding);

        const saltBytes = hashFrame.readUInt32BE(0);
        const hashBytes = hashFrame.length - saltBytes - 8;

        const iterations = hashFrame.readUInt32BE(4);

        const salt = hashFrame.slice(8, saltBytes + 8);
        const hash = hashFrame.slice(saltBytes + 8, saltBytes + hashBytes + 8);

        return await new Promise((resolve, reject) =>
            crypto.pbkdf2(password, salt, iterations, hashBytes, security.pbkdf2.algorithm, (error, verify) =>
                error ? reject(`pbkdf2: ${error.message}`) : verify.equals(hash) ? resolve(true) : resolve(false),
            ),
        );
    },
};

/** @throws 401 Unauthorized */
function unauthorized(context) {
    context.response.redirect('/sign_in');
    context.throw(status.unauthorized, '401 Unauthorized');
}

const tokens = {
    access: {
        /**
         * @argument { Object } payload
         * @returns { String }
         */
        generate: (payload) =>
            jwt.sign(payload, security.tokens.access.secret, {
                expiresIn: security.tokens.access.maxAge,
                algorithm: security.tokens.algorithm,
            }),
        /**
         * @argument { String } role
         * @argument { any } context
         * @argument { Function } next
         * @returns { Promise } Update context.state.payload
         */
        check: async function (role, context, next) {
            if (!context.headers || !context.headers['authorization']) unauthorized(context);

            const token = context.request.headers['authorization'].split(' ')[1];
            if (!token) unauthorized(context);

            try {
                const payload = jwt.verify(token, security.tokens.access.secret, {
                    algorithms: [security.tokens.algorithm],
                    complete: false,
                    maxAge: security.tokens.access.maxAge,
                });

                if (!security.layers[payload.user.role].includes(role)) {
                    context.response.redirect('/');
                    context.throw(status.forbidden, '403 Forbidden');
                }

                context.state.payload = payload;
            } catch (error) {
                unauthorized(context);
            }

            await next();
        },
    },
    refresh: {
        /**
         * @argument { Object } payload
         * @argument { String } payload.userID
         * @returns { Promise<String> }
         */
        generate: async function (payload) {
            const expiredAt = new Date().getTime() + security.tokens.refresh.maxAge * 1_000 + 3_600_000; // After 1 hour, it is automatically deleted
            const inserted = await postgres
                .knex('refresh_tokens')
                .insert({
                    expired_at: new Date(expiredAt).toISOString(),
                    user_id: payload.userID,
                })
                .returning('id');

            const token = jwt.sign({ userID: payload.userID, tokenID: inserted[0] }, security.tokens.refresh.secret, {
                expiresIn: security.tokens.refresh.maxAge,
                algorithm: security.tokens.algorithm,
            });

            return token;
        },
        /**
         * @argument { any } context
         * @returns { Promise<{ access: any, refresh: any }> } Payloads
         */
        check: async function (context) {
            // console.log(context.headers);
            if (!context.headers || !context.headers['authorization'] || !context.headers['x-refresh-token']) {
                unauthorized(context);
            }

            const tokens = {
                access: context.request.headers['authorization'].split(' ')[1],
                refresh: context.request.headers['x-refresh-token'],
            };

            if (!tokens.access || !tokens.refresh) unauthorized(context);

            try {
                const payloads = {
                    access: jwt.verify(tokens.access, security.tokens.access.secret, {
                        algorithms: [security.tokens.algorithm],
                        complete: false,
                        ignoreExpiration: true,
                    }),
                    refresh: jwt.verify(tokens.refresh, security.tokens.refresh.secret, {
                        algorithms: [security.tokens.algorithm],
                        complete: false,
                        maxAge: security.tokens.refresh.maxAge,
                    }),
                };

                const entry = await postgres
                    .knex('refresh_tokens')
                    .where({ id: payloads.refresh.tokenID })
                    .del(['id', 'user_id']);

                // @ts-ignore
                if (!entry[0]?.id || payloads.access.user.id !== payloads.refresh.userID) unauthorized(context);

                delete payloads.access.iat;
                delete payloads.access.exp;
                delete payloads.refresh.iat;
                delete payloads.refresh.exp;
                return payloads;
            } catch (error) {
                console.log(error);
                logger.error('server:errors.client.refreshToken', error.message);
                throw unauthorized(context);
            }
        },
        /**
         * @argument { any } context
         * @returns { Promise<{ access: String, refresh: String }> } New tokens
         */
        update: async function (context) {
            const payloads = await tokens.refresh.check(context);

            return {
                access: tokens.access.generate(payloads.access),
                refresh: await tokens.refresh.generate({ userID: payloads.refresh.userID }),
            };
        },
    },
};

export { password, tokens as jwt };
