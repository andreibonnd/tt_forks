import { environment } from './../configuration/index.js';
import { postgres, rabbitMQ, email, logger } from './../connections/index.js';
import { status } from './constants.js';
import * as types from './../@types/index.js';

async function validate(schema, context, next) {
    const options = {
        abortEarly: false,
        allowUnknown: true,
        convert: false,
        stripUnknown: { arrays: true, objects: true },
    };

    try {
        if (schema.parameters) {
            context.request.params = await schema.parameters.validateAsync(context.request.params, options);
        }

        if (schema.query) {
            context.request.query = await schema.query.validateAsync(context.request.query, options);
        }

        if (schema.body) {
            context.request.body = await schema.body.validateAsync(context.request.body, options);
        }
    } catch (error) {
        context.throw(status.bad_request, error);
    }

    await next();
}

/**
 * @argument { Object } details
 * @argument { String } details.event
 * @argument { types.jwt_payload } details.user
 * @argument { Object } details.fork
 * @argument { String } details.fork.name
 * @argument { String } details.fork.description
 * @argument { String } details.fork.creation_year
 * @argument { String } details.fork.category_id
 */
async function events(details) {
    // prettier-ignore
    switch (details.event) {
        case 'fork-added': {
            async function queue(email) {
                try {
                    await rabbitMQ.publish(
                        {
                            to: email,
                            subject: 'A new fork has been added to the category',
                            message: `Name: "${details.fork.name}", description: "${details.fork.description}"`,
                        },
                        rabbitMQ.queues.email,
                    );
                } catch (error) {
                    logger.error('events.fork-added.queue', error.message);
                }
            }

            const subscribers = await postgres
                .knex('subscriptions')
                .select('email')
                .leftJoin('users', 'subscriptions.user_id', '=', 'users.id')
                .where({ 'subscriptions.category_id': details.fork.category_id })
                .groupBy('subscriptions.user_id', 'users.email')
                .pluck('email');

            subscribers.length > 0 && subscribers.forEach(queue);
        } break;
        default: break;
    }
}

/**
 * @argument { Object } details
 * @argument { String } details.to
 * @argument { String } details.subject
 * @argument { String } details.message
 */
async function sendMail({ to, subject, message }) {
    try {
        const sender = environment.connections.email.sender;
        const html = `<p align="center">${message}</p>`;
        const response = await email.sendMail({ from: sender, to, subject, text: message, html }, null);

        logger.info('email.sendMail', { id: response.messageId, to });
        if (environment.is.development) {
            const nodemailer = await import('nodemailer');
            console.log(`Email link: ${nodemailer.getTestMessageUrl(response)}`);
        }
    } catch (error) {
        logger.error('email.sendMail', { to, message: error.message });
        throw error;
    }
}

export { validate, events, sendMail };
