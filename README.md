# ApplyTrack

A web app for tracking job applications: where I applied, the status of each one, and notes along the way.

> **Status:** In early development.

## Tech Stack

| Layer    | Technology                                                  |
| -------- | ----------------------------------------------------------- |
| Client   | React 19, Vite, React Router, Tailwind CSS                  |
| Server   | Express 5 (Node.js)                                         |
| Database | MySQL 8.0.16 or newer (8.4 LTS recommended), Knex, mysql2   |
| Testing  | Jest, Supertest                                             |

**Requirements:** Node.js 20.19+, 22.13+, or 24+ (Node 22 or 24 recommended), and MySQL 8.0.16+. MariaDB is not supported.

## Project Structure

```
.
├── client/                  # React frontend, organized by feature
│   └── src/
│       ├── app/             # Router, providers, app shell
│       ├── features/        # One folder per feature
│       │   ├── auth/
│       │   ├── applications/
│       │   ├── dashboard/
│       │   ├── documents/
│       │   ├── interviews/
│       │   ├── reminders/
│       │   └── settings/
│       └── shared/          # Components, hooks, and utilities used by more than one feature
└── server/                  # Express REST API and Knex migrations
```

Each folder in `client/src/features/` holds everything for that feature (components, hooks, API calls, and types). Code that two or more features need goes in `shared/`.

## Tests

```bash
cd server
npm test
```