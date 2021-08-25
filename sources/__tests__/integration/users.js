import test from 'ava';
import fetch from 'node-fetch';
import { postgres } from './../../connections/index.js';
import { application } from './../../application.js';
import { getApiUrl, regex, parseJWT } from './../__helpers__/index.js';

const PORT = 3002;
const API_URL = getApiUrl(PORT);

const now = Date.now();
const user = {
    id: '',
    token: '',
    login: `${now}`,
    email: `${now}.tester@gmail.com`,
    password: 'tester',
    role: 'user',
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

test.serial('registration', async function (t) {
    const login = user.login;
    const email = user.email;
    const password = user.password;

    try {
        const response = await fetch(`${API_URL}/users/registration`, {
            method: 'post',
            body: JSON.stringify({ login, email, password }),
            headers: { 'Content-Type': 'application/json' },
        });
        const registered = await response.json();

        const token = response.headers.get('authorization').split(' ')[1];
        t.assert(response.ok, 'Response status is not OK');
        t.deepEqual(registered, { login, email, subscriptions: [] }, 'Returned data is incorrect');
        t.not(token, undefined, 'Token is undefined');

        const payload = parseJWT(token).user;
        t.is(payload.role, user.role, 'User role is incorrect');
        t.regex(payload.id, regex.uuid, 'Payload user id does not match regex');

        user.id = payload.id;
        user.token = token;
    } catch (error) {
        console.log(error);
    }
});

test.serial('authentication', async function (t) {
    const login = user.login;
    const email = user.email;
    const password = user.password;

    const response = await fetch(`${API_URL}/users/authentication`, {
        method: 'post',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' },
    });
    const authenticated = await response.json();

    const token = response.headers.get('authorization').split(' ')[1];
    t.assert(response.ok, 'Response status is not OK');
    t.deepEqual(authenticated, { login, email, subscriptions: [] }, 'Returned data is incorrect');
    t.not(token, undefined, 'Token is undefined');

    const payload = parseJWT(token).user;
    t.is(payload.role, user.role, 'User role is incorrect');
    t.regex(payload.id, regex.uuid, 'Payload user id does not match regex');
});

test.after('disconnect', async function (t) {
    await postgres.disconnect();
    // @ts-ignore
    t.context.server.close();
});
