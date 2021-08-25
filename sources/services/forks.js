import { postgres } from './../connections/index.js';
import { status, events } from './../helpers/index.js';
import * as types from './../@types/index.js';

const build = {
    creator: postgres.knex.raw(`jsonb_build_object('id', "users"."id", 'login', "users"."login") as "creator"`),
    category: postgres.knex.raw(
        `jsonb_strip_nulls(jsonb_build_object('id', "categories"."id", 'name', "categories"."name", 'description', "categories"."description")) as "category"`,
    ),
};

const select = [
    'forks.id',
    'forks.name',
    'forks.description',
    'forks.creation_year',
    'forks.creator_id',
    'forks.category_id',
    'users.id as user_id',
    'users.login as user_login',
    'categories.id as category_id',
    'categories.name as category_name',
    'categories.description as category_description',
    build.creator,
    build.category,
];

/** @returns { types.fork } */
function filterFork({ creator_id, user_id, user_login, category_id, category_name, category_description, ...keep }) {
    // @ts-ignore
    return keep;
}

/**
 * @argument { Object } details
 * @argument { String } details.name
 * @argument { String } details.description
 * @argument { String } details.creation_year
 * @argument { String } details.category_id
 * @argument { types.jwt_payload } user
 * @argument { Function } _throw
 * @returns { Promise<String> } id
 */
async function create(details, user, _throw) {
    const entry = { ...details, creator_id: user.id };
    const created = await postgres.knex('forks').insert(entry).returning('id');

    if (details.category_id) events({ event: 'fork-added', user, fork: details });
    return created[0];
}

const find = {
    /**
     * @argument { Object } details
     * @argument { Number } details.limit
     * @argument { Number } details.offset
     * @argument { types.jwt_payload } user
     * @argument { Function } _throw
     * @returns { Promise<types.fork[]> }
     */
    all: async function (details, user, _throw) {
        const forks = await postgres
            .knex('forks')
            .select(...select)
            .leftJoin('users', 'forks.creator_id', '=', 'users.id')
            .leftJoin('categories', 'forks.category_id', '=', 'categories.id')
            .limit(details.limit)
            .offset(details.offset);

        if (forks.length === 0) _throw(status.not_found, 'No forks have been added yet');

        return forks.map(filterFork);
    },
    /**
     * @argument { Object } details
     * @argument { String } details.id
     * @argument { types.jwt_payload } user
     * @argument { Function } _throw
     * @returns { Promise<fork> }
     */
    byID: async function (details, user, _throw) {
        const fork = await postgres
            .knex('forks')
            .select(...select)
            .leftJoin('users', 'forks.creator_id', '=', 'users.id')
            .leftJoin('categories', 'forks.category_id', '=', 'categories.id')
            .where({ 'forks.id': details.id });

        if (fork.length === 0) _throw(status.not_found, `A fork with this ID was not found: "${details.id}"`);

        // @ts-ignore
        return fork.map(filterFork)[0];
    },
    /**
     * @argument { Object } details
     * @argument { Number } details.limit
     * @argument { Number } details.offset
     * @argument { types.jwt_payload } user
     * @argument { Function } _throw
     * @returns { Promise<types.category[]> }
     */
    categories: async function (details, user, _throw) {
        const categories = await postgres
            .knex('categories')
            .select('categories.id', 'categories.name', 'categories.description')
            .limit(details.limit)
            .offset(details.offset);

        if (categories.length === 0) _throw(status.not_found, 'No category has been created yet');

        return categories;
    },
    /**
     * @argument { Object } details
     * @argument { String } details.id
     * @argument { Number } details.limit
     * @argument { Number } details.offset
     * @argument { types.jwt_payload } user
     * @argument { Function } _throw
     * @returns { Promise<types.fork[]> }
     */
    byCategory: async function (details, user, _throw) {
        const forks = await postgres
            .knex('forks')
            .select(
                'forks.id',
                'forks.name',
                'forks.description',
                'forks.creation_year',
                'forks.creator_id',
                // 'forks.category_id',
                'users.id as user_id',
                'users.login as user_login',
                // 'categories.id as category_id',
                // 'categories.name as category_name',
                // 'categories.description as category_description',
                build.creator,
                // build.category,
            )
            .leftJoin('users', 'forks.creator_id', '=', 'users.id')
            // .leftJoin('categories', 'forks.category_id', '=', 'categories.id')
            .where({ 'forks.category_id': details.id })
            .limit(details.limit)
            .offset(details.offset);

        if (forks.length === 0) _throw(status.not_found, 'No forks have been added to this category yet');

        return forks.map(filterFork);
    },
    /**
     * @argument { Object } details
     * @argument { String } details.login
     * @argument { Number } details.limit
     * @argument { Number } details.offset
     * @argument { types.jwt_payload } user
     * @argument { Function } _throw
     * @returns { Promise<types.fork[]> }
     */
    byUser: async function (details, user, _throw) {
        const forks = await postgres
            .knex('users')
            .select(...select)
            .leftJoin('forks', 'users.id', '=', 'forks.creator_id')
            .leftJoin('categories', 'forks.category_id', '=', 'categories.id')
            .where({ 'users.login': details.login })
            .limit(details.limit)
            .offset(details.offset);

        if (forks.length === 0) _throw(status.not_found, 'This user has not added any forks yet');

        return forks.map(filterFork);
    },
};

/**
 * @argument { Object } details
 * @argument { String } details.id
 * @argument { types.jwt_payload } user
 * @argument { Function } _throw
 * @returns { Promise<types.response_OK> }
 */
async function remove(details, user, _throw) {
    const response = await postgres.knex('forks').where({ id: details.id, creator_id: user.id }).del('id');
    const id = response && response[0];

    if (!(id && id === details.id)) _throw(status.request_failed, 'For some reason, the entry could not be deleted');

    return 'OK';
}

const subscribe = {
    /**
     * @argument { Object } details
     * @argument { String } details.id
     * @argument { types.jwt_payload } user
     * @argument { Function } _throw
     * @returns { Promise<types.response_OK> }
     */
    byCategory: async function (details, user, _throw) {
        await postgres
            .knex('subscriptions')
            .insert({ user_id: user.id, category_id: details.id })
            .onConflict(['user_id', 'category_id'])
            .ignore();

        return 'OK';
    },
};

const unsubscribe = {
    /**
     * @argument { Object } details
     * @argument { String } details.id
     * @argument { types.jwt_payload } user
     * @argument { Function } _throw
     * @returns { Promise<types.response_OK> }
     */
    byCategory: async function (details, user, _throw) {
        await postgres.knex('subscriptions').where({ user_id: user.id, category_id: details.id }).del();

        return 'OK';
    },
};

export { create, find, remove, subscribe, unsubscribe };
