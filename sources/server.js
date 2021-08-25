#!/usr/bin/env node

/**
 * @license
 * Copyright 2021 Andrei andrei.bonnd@mail.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { environment } from './configuration/index.js';
import { postgres, rabbitMQ, logger } from './connections/index.js';
import { application } from './application.js';

function detectAnomalies(server) {
    const handled = [];

    function handler(event, ...parameters) {
        if (handled.includes(event)) {
            return;
        } else {
            handled.push(event);
        }

        postgres.disconnect();
        rabbitMQ.disconnect();
        server.close();

        logger.error('[server]: artifact', { event, parameters });
        process.exitCode = 0;
    }

    for (const event of ['SIGINT', 'SIGTERM', 'uncaughtException', 'unhandledRejection']) {
        process.on(event, handler.bind(null, event));
    }
}

(async function () {
    try {
        const server = application.listen(environment.server.port);

        detectAnomalies(server);
        await rabbitMQ.connect();
        console.log(`[server]: address (http://localhost:${environment.server.port})`);
    } catch (error) {
        console.log(`[launching]: error (${error.message})`);
        await postgres.disconnect();
        await rabbitMQ.disconnect();
        throw error;
    }
})();
