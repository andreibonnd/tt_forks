import nodemailer from 'nodemailer';
import { environment, other } from './../configuration/index.js';

const connection = nodemailer.createTransport(environment.connections.email.connection, other.nodemailer);

export { connection };
