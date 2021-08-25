import { postgres } from './../connections/index.js';
import { status, password } from './../helpers/index.js';
import * as types from './../@types/index.js';

/**
 * @argument { String } login
 * @argument { String } email
 * @argument { Function } _throw
 * @returns { Promise<Boolean> }
 */
async function isRegistered(login, email, _throw) {
    const check = await postgres.knex('users').where({ login }).orWhere({ email }).select('id', 'login', 'email');
    const user = check && check[0];

    if (user?.id) {
        if (user.login === login) _throw(status.conflict, 'User with this login is already registered');
        if (user.email === email) _throw(status.conflict, 'User with this email is already registered');
    }

    return false;
}

/**
 * @argument { Object } details
 * @argument { String } details.login
 * @argument { String } details.email
 * @argument { String } details.password
 * @argument { Function } _throw
 * @returns { Promise<{ payload: { user: types.jwt_payload }, user: types.user }> }
 */
async function registration(details, _throw) {
    await isRegistered(details.login, details.email, _throw);

    const entry = {
        login: details.login,
        email: details.email,
        hash: await password.hash(details.password),
        role: 'user',
    };

    const registered = await postgres.knex('users').insert(entry).returning('id');

    return {
        payload: { user: { id: registered[0], role: entry.role } },
        user: { login: details.login, email: details.email, subscriptions: [] },
    };
}

/**
 * @argument { Object } details
 * @argument { String } details.login
 * @argument { String } details.email
 * @argument { String } details.password
 * @argument { Function } _throw
 * @returns { Promise<{ payload: { user: types.jwt_payload }, user: types.user }> }
 */
async function authentication(details, _throw) {
    const response = await postgres
        .knex('users')
        .select(
            'users.id',
            'users.login',
            'users.email',
            'users.hash',
            'users.role',
            postgres.knex.raw(
                `coalesce(jsonb_agg(jsonb_build_object('id', "categories"."id", 'name', "categories"."name")) filter (where "subscriptions" is not null), '[]'::jsonb) as "subscriptions"`,
            ),
        )
        .leftJoin('subscriptions', 'users.id', '=', 'subscriptions.user_id')
        .leftJoin('categories', 'subscriptions.category_id', '=', 'categories.id')
        .where(details.email ? { 'users.email': details.email } : { 'users.login': details.login })
        .groupBy('users.id');

    const user = response && response[0];

    if (!user?.id) {
        _throw(status.not_found, 'User does not exist');
    }

    if (!(await password.compare(details.password, user.hash))) {
        _throw(status.request_failed, 'Incorrect password');
    }

    return {
        payload: { user: { id: user.id, role: user.role } },
        user: { login: user.login, email: user.email, subscriptions: user.subscriptions },
    };
}

export { registration, authentication };
