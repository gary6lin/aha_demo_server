# Simple Login Server
- This is the backend server for the [Simple Login Client](https://github.com/gary6lin/aha_demo_client).
- Built with the [NestJS](https://github.com/nestjs/nest) framework.
- Following the RESTful API design.
- Uses the [Prisma](https://github.com/prisma/prisma) ORM to manipulate the database.
- Native module support for generating a live Swagger API documentation.
- Uses cache mechanism for global information such as the total user count, to reduce workload on the database.
- The authentication system is relying on Firebase Auth to issue tokens for the clients and verifying them on backend.
- Uses the GitHub Actions as a workflow tool for delivering the live service and app.

### About the config file
- For security reason the .env and firebase_config.json are not committed.
- The config and env files are injected to the web service during the deployments.

### About the user database
- Timestamp of user sign up: is the created time of the user.
- Number of times logged in: there is no effective way to count this number, since we are using token based authentication.
- Timestamp of the last user session: relies on the last sign in time from the Firebase Auth server. 

### About the user statistics
- Total number of users who have signed up: counts up the total user copies from our own database instead of the list from Firebase Auth server.
- Total number of users with active sessions today: a user is treated as active if the sign in time fall between the start and end of today's date.
- Average number of active session users in the last 7 days rolling: whenever we count the active users, we store the result to the statistic table by date.
- Those numbers are cached and alive for 10 minutes.


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
