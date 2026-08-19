# PeopleSpace — Full-stack user directory

A production-minded directory for discovering people by name, nationality, and shared interests. The application uses React, TypeScript, Express, and SQLite, with a responsive, virtualized paginated list and shareable URL state.

## Quick start

Prerequisites: Node.js 22+ and npm 10+.

```bash
npm install
npm run seed
npm run dev
```

Open `http://localhost:5173`. The API runs at `http://localhost:4000`. The server also seeds the database automatically when it starts if data is missing.

Demo login:

```text
Email: demo@peoplespace.com
Password: PeopleSpace@123
```

Passwords are stored as salted scrypt hashes. Authentication uses opaque server-side sessions and HTTP-only, SameSite cookies. Set `COOKIE_SECURE=true` when deploying behind HTTPS.

Useful commands:

```bash
npm run build       # type-check and create the production client
npm test            # API behavior tests plus client type-check
npm start           # serve API and built client on :4000
npm run seed        # recreate/ensure the 2,400-user data set
```

The generated SQLite file is `server/data/directory.db` and is intentionally git-ignored.

## Docker

```bash
docker compose up --build
```

Open `http://localhost:4000`. Database data is retained in the named `directory-data` volume. To start from a clean database, run `docker compose down -v` and rebuild.

## API

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/auth/session`
- `POST /api/auth/logout`
- `GET /api/users`
- `GET /api/users/facets`

User query parameters: `search`, repeated `nationality`, repeated `hobby`, repeated `ageRange` (for example `21-30`), `sortBy`, `sortDirection`, `page`, and `limit`. Arrays can also be comma-separated. Multiple age ranges use OR behavior. `sortBy` accepts `first_name`, `last_name`, `age`, or `nationality`; limit is capped at 50.

Example:

```text
/api/users?search=an&nationality=Indian&hobby=Reading&hobby=Travel&sortBy=age&sortDirection=desc&page=1
```

See [PROJECT_FLOW.md](./PROJECT_FLOW.md) for architecture, request flow, SQL semantics, performance choices, and extension guidance.

## Project structure

The client follows Feature-Sliced Design:

```text
client/src/
  app/       application bootstrap and global styles
  pages/     login and directory page composition
  widgets/   substantial page regions (virtual directory list)
  features/  authentication, filters, sorting, and URL state
  entities/  account/user data, API, model, and card UI
  shared/    reusable API, hooks, and UI primitives
```

Dependencies flow downward only. The server separates config, database/seed, transport routes, query parsing, and business/query services.

## Design and accessibility

The UI uses a warm neutral canvas, deep green typography, restrained accent color, consistent 4/8px-derived spacing, 10–15px radii, visible focus states, semantic controls, reduced-motion support, loading skeletons, retryable error states, and mobile filter drawer behavior. The list only mounts visible cards plus a small overscan window.
