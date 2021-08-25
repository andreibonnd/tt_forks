import fetch from 'node-fetch';
import faker from 'faker';
import { application, connections, getApiUrl, gerRandom, parseJWT } from './../../index.js';

const knex = connections.postgres.knex;
const PORT = 3000;
const API_URL = getApiUrl(PORT);

const categories = [
    '57c4fa0a-3715-4805-b18e-306bfeba92ab',
    '126ff00b-848d-483a-8b0e-a11ab001a8d3',
    '577cbd79-009b-4691-88b4-729a591a9b77',
    'f880fcb2-102e-43e4-b581-df2da21b7e8d',
    '80629165-5bea-4006-ad76-0e945a2223cb',
    'aa2f8f9b-86ca-455f-8d6e-06558de9ace2',
    '7e4cf5c0-c042-42ef-a946-9a3735bf1c8b',
];

const USERS_LENGTH = 10;
const store = {
    users: [],
};

async function fillUsers() {
    console.log(`[scripts]: fill.users.start`);

    for (let i = 0; i < USERS_LENGTH; i++) {
        const email = faker.unique(faker.internet.email);
        const login = email.split('@')[0];
        const password = email.split('@')[0];

        const response = await fetch(`${API_URL}/users/registration`, {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login, email, password }),
        });

        !response.ok && console.log(await response.text());

        const token = response.headers.get('authorization').split(' ')[1];
        const userID = parseJWT(token).user.id;
        // @ts-ignore
        store.users.push({ login, email, password, token, userID });
    }

    console.log(`[scripts]: fill.users.end`);
}

async function fillForks() {
    console.log(`[scripts]: fill.forks.start`);

    for (let i = 0; i < USERS_LENGTH; i++) {
        for (let j = 0; j < 2; j++) {
            const user = store.users[i];
            const response = await fetch(`${API_URL}/forks`, {
                method: 'post',
                // @ts-ignore
                headers: { 'Content-Type': 'application/json', authorization: `Bearer ${user.token}` },
                body: JSON.stringify({
                    name: faker.random.word(),
                    description: faker.random.word(),
                    creation_year: faker.datatype.datetime().getFullYear(),
                    category_id: Math.random() < 0.5 ? gerRandom(categories) : undefined,
                }),
            });

            !response.ok && console.log(await response.text());
        }
    }

    console.log(`[scripts]: fill.forks.end`);
}

(async () => {
    const server = application.listen(PORT);

    try {
        // *Default values
        await knex('users').insert({
            // password => user
            id: '57c4fa0a-3715-4805-b18e-306bfeba92ab',
            login: 'user',
            email: 'user@gmail.com',
            hash: 'AAAAEAAHoSDNVlhwIgRuBXRkH7j-rjnkqSu4UGX5V1WqbBvvlMmZrYC00YEqNJ4uTLmqxYhoqG0NyIjEPHh41naELk88Qrs91qN4-0P5TSmhwOqonAtGng',
            role: 'user',
        });

        await knex('categories').insert([
            {
                id: '57c4fa0a-3715-4805-b18e-306bfeba92ab',
                name: 'Table fork',
                description:
                    "It's ideal for a wide range of food choices, including pasta, dessert, salad and meat entrees.",
            },
            {
                id: '126ff00b-848d-483a-8b0e-a11ab001a8d3',
                name: 'Deli fork',
                description:
                    'This type of fork has only two tines and was actually created for picking up slices of prosciutto.',
            },
            {
                id: '577cbd79-009b-4691-88b4-729a591a9b77',
                name: 'Fish fork',
                description:
                    'This fork has one tine that’s wider than the others, which makes it easier to pull the fish flesh from the bones and skin.',
            },
            {
                id: 'f880fcb2-102e-43e4-b581-df2da21b7e8d',
                name: 'Fruit fork',
                description:
                    "It's a smaller fork that you can use for cutting large pieces of fruit on your plate or spearing smaller ones.",
            },
            {
                id: '80629165-5bea-4006-ad76-0e945a2223cb',
                name: 'Salad fork',
                description:
                    'This type of fork is a bit longer than the average utensil and is designed to work with a salad spoon.',
            },
            {
                id: 'aa2f8f9b-86ca-455f-8d6e-06558de9ace2',
                name: 'Ice cream fork',
                description:
                    'It has a bowl shape with three tines on the end. Use it to break apart and then scoop up the ice cream.',
            },
            {
                id: '7e4cf5c0-c042-42ef-a946-9a3735bf1c8b',
                name: 'Dessert fork',
                description:
                    "It's smaller than both a table and a fruit fork and is perfect for cake, pie and other sweet treats.",
            },
        ]);

        await fillUsers();
        await fillForks();
    } catch (error) {
        await connections.postgres.disconnect();
        server.close();

        console.error(`[scripts]: fill (${error.message})`);
    } finally {
        process.exit();
    }
})();
