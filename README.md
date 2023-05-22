# Simple Login Server
- This is the backend server for the [Simple Login Client](https://github.com/gary6lin/aha_demo_client).
- Built with the [NestJS](https://github.com/nestjs/nest) framework.
- Following the RESTful API design.
- Uses the [Prisma](https://github.com/prisma/prisma) ORM to manipulate the database.
- Native module support for generating a live Swagger API documentation.
- Uses cache mechanism for global information such as the total user count, to reduce workload on the database.
- The authentication system is relying on Firebase Auth to issue tokens for the clients and verifying them on backend.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
