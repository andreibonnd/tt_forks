import { connections } from './../index.js';

const knex = connections.postgres.knex;

(async () => {
    try {
        await knex.raw('create extension if not exists "uuid-ossp"');

        // *refresh_tokens.expired_at
        // *TTL indexes can be used with MongoDB
        // *But with Postgres we need to write a trigger with conditions
        // *Or use cron tasks

        await knex.schema
            .createTable('users', function (table) {
                table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
                table.string('login', 32).unique().notNullable();
                table.string('email', 128).unique().notNullable();
                table.string('hash').notNullable();
                table.enum('role', ['user', 'moderator', 'admin']).defaultTo('user').notNullable();
            })
            .createTable('categories', function (table) {
                table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
                table.string('name', 32).unique().notNullable();
                table.string('description', 512).notNullable();
            })
            .createTable('forks', function (table) {
                table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
                table.string('name', 32).notNullable();
                table.string('description', 512).notNullable();
                table.specificType('creation_year', 'smallint').notNullable();
                table.uuid('creator_id').notNullable();
                table.uuid('category_id').defaultTo(null).nullable();

                table.foreign('creator_id').references('users.id').onUpdate('cascade').onDelete('cascade');
                table.foreign('category_id').references('categories.id').onUpdate('cascade');
            })
            .createTable('subscriptions', function (table) {
                table.uuid('user_id').notNullable();
                table.uuid('category_id').notNullable();

                table.foreign('user_id').references('users.id').onUpdate('cascade').onDelete('cascade');
                table.foreign('category_id').references('categories.id').onUpdate('cascade').onDelete('cascade');
                table.primary(['user_id', 'category_id']);
            })
            .createTable('refresh_tokens', function (table) {
                table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
                table.timestamp('expired_at', { useTz: false }).notNullable();
                table.uuid('user_id').notNullable();

                table.foreign('user_id').references('users.id').onUpdate('cascade').onDelete('cascade');
            });
    } catch (error) {
        await connections.postgres.disconnect();
        console.error(`[scripts]: structure (${error.message})`);
    } finally {
        process.exit();
    }
})();
