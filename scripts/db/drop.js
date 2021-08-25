import { connections } from './../index.js';

const knex = connections.postgres.knex;

(async () => {
    try {
        await knex.schema
            .dropTableIfExists('refresh_tokens')
            .dropTableIfExists('subscriptions')
            .dropTableIfExists('forks')
            .dropTableIfExists('categories')
            .dropTableIfExists('users');
    } catch (error) {
        console.error(`[scripts]: drop (${error.message})`);
    } finally {
        await connections.postgres.disconnect();
    }
})();
