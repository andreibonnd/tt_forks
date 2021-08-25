import test from 'ava';
import fetch from 'node-fetch';
import { postgres } from './../../connections/index.js';
import { application } from './../../application.js';
import { getApiUrl } from './../__helpers__/index.js';

const PORT = 3001;
const API_URL = getApiUrl(PORT);

const user = {
    tokens: {
        access: '',
        refresh: '',
    },
    email: 'user@gmail.com',
    password: 'user',
};

test.before('connect', async function (t) {
    try {
        t.context = {};
        // @ts-ignore
        t.context.server = application.listen(PORT);
    } catch (error) {
        await postgres.disconnect();
        // @ts-ignore
        t.context.server && t.context.server.close();
        throw error;
    }
});

test.serial('authentication', async function (t) {
    const email = user.email;
    const password = user.password;

    const response = await fetch(`${API_URL}/users/authentication`, {
        method: 'post',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' },
    });

    const tokens = (user.tokens = {
        access: response.headers.get('authorization').split(' ')[1],
        refresh: response.headers.get('x-refresh-token'),
    });

    t.assert(response.ok, 'Response status is not OK');
    t.not(tokens.access, undefined, 'Tokens.access is undefined');
    t.not(tokens.refresh, undefined, 'Tokens.refresh is undefined');
});

test.serial('refresh-token', async function (t) {
    const response = await fetch(`${API_URL}/maintenance/refresh-token`, {
        method: 'patch',
        headers: {
            authorization: `Bearer ${user.tokens.access}`,
            'x-refresh-token': user.tokens.refresh,
        },
    });

    const tokens = (user.tokens = {
        access: response.headers.get('authorization').split(' ')[1],
        refresh: response.headers.get('x-refresh-token'),
    });

    t.assert(response.ok, 'Response status is not OK');
    t.not(tokens.access, undefined, 'Tokens.access is undefined');
    t.not(tokens.refresh, undefined, 'Tokens.refresh is undefined');
});

test.serial('revoke-token', async function (t) {
    const response = await fetch(`${API_URL}/maintenance/revoke-token`, {
        method: 'patch',
        headers: {
            authorization: `Bearer ${user.tokens.access}`,
            'x-refresh-token': user.tokens.refresh,
        },
    });

    t.assert(response.ok, 'Response status is not OK');
});

test.after('disconnect', async function (t) {
    await postgres.disconnect();
    // @ts-ignore
    t.context.server.close();
});
