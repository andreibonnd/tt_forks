import knex from 'knex';
import { environment } from './../configuration/index.js';

const postgres = knex({
    client: 'pg',
    connection: environment.connections.postgres,
    pool: { min: 0, max: 7 },
});

const disconnect = async () => await postgres.destroy();

export { postgres as knex, disconnect };
