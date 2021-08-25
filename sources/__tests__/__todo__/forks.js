import test from 'ava';
import fetch from 'node-fetch';
import { postgres } from './../../connections/index.js';
import { application } from './../../application.js';
import { getApiUrl } from './../__helpers__/index.js';

const PORT = 3003;
const API_URL = getApiUrl(PORT);

test.before('connect', async function (t) {
    try {
        t.context = {};
        // @ts-ignore
        t.context.server = application.listen(Number(process.env.PORT));
    } catch (error) {
        await postgres.disconnect();
        // @ts-ignore
        t.context.server.close();
        throw error;
    }
});

test.serial('', async function (t) {});

test.after('disconnect', async function (t) {
    await postgres.disconnect();
    // @ts-ignore
    t.context.server.close();
});
