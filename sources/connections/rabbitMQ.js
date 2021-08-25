import rabbitMQ from 'amqplib';
import { environment, other } from './../configuration/index.js';
import { connection as logger } from './logger.js';
import { sendMail } from './../helpers/index.js';

const queues = { email: 'email' };
let connection;
let channel;

// TODO: Just move to another service
function consumers(channel) {
    channel.consume(
        queues.email,
        async function (message) {
            if (message !== null) {
                try {
                    await sendMail(JSON.parse(message.content.toString()));
                    channel.ack(message);
                } catch (error) {
                    logger.error('rabbitMQ.consume', error);
                }
            }
        },
        { noAck: false },
    );
}

async function connect() {
    connection = await rabbitMQ.connect(environment.connections.rabbitMQ, other.rabbitMQ);
    channel = await connection.createChannel();

    // @ts-ignore
    for (const queue of Object.values(queues)) {
        await channel.assertQueue(queue, { durable: true });
    }

    consumers(channel);
}

/**
 * @argument { Object } payload
 * @argument { String } queue
 * @return { Promise<Boolean> }
 */
const publish = async (payload, queue) => await channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)));

async function disconnect() {
    if (channel) await channel.close();
    await connection.close();
}

export { connect, connection, queues, publish, disconnect };
