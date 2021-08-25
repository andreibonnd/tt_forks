# Test task - Forks

## Installation and local launch

1. Clone this repo: `git clone https://github.com/andreibonnd/tt-forks`
2. Launch the [PostgreSQL](https://postgresql.org/download) locally or in [cloud](https://elephantsql.com/plans.html)
3. Launch the [RabbitMQ](https://rabbitmq.com/download.html) locally or in [cloud](https://cloudamqp.com/plans.html)
4. Connect SMTP account, for example [ethereal.email](http://ethereal.email/create)
5. Create `.env` with the environment variables listed below. Also, please, consider looking at `.env.defaults`
6. Run `npm install` in the root folder
7. Run `npm develop`

And you should be good to go

## Environment variables

| Name                    | Description                                         |
| ----------------------- | --------------------------------------------------- |
| `POSTGRES_CONNECTION`   | Postgres connection string                          |
| `RABBIT_MQ_CONNECTION`  | RabbitMQ connection string                          |
| `EMAIL_SENDER`          | Name and email address of the sender (this service) |
| `EMAIL_SMTP_CONNECTION` | Email SMTP connection string                        |
| `ACCESS_TOKEN_SECRET`   | JWT access token secret                             |
| `ACCESS_TOKEN_MAX_AGE`  | JWT access token maximum age                        |
| `REFRESH_TOKEN_SECRET`  | JWT refresh token secret                            |
| `REFRESH_TOKEN_MAX_AGE` | JWT refresh token maximum age                       |

## Requirements

Restrictions

1. Use a relational database
2. Don't use Passport.js

Clarifications:

1. Use any framework / library for routing
2. Use anything to work with the database
3. Use whatever approach you like, both REST and GraphQl or WebSockets
4. Do anything with the database, the main thing is that the product has the necessary functionality described above and that the tables have fields indicated below

Required entity fields

1. User
    - Login
    - Password
    - Email
2. Fork
    - Name
    - Description
    - Year of creation
    - User who created
3. Forks category
    - Name
    - Description
