# TaskFlow Dashboard

![CI](https://github.com/sciamanamarcio/taskflow-dashboard/actions/workflows/ci.yml/badge.svg)

A React + TypeScript single-page app for managing tasks, built on top of [TaskFlow API](https://github.com/sciamanamarcio/taskflow-api). It features JWT authentication, protected routes, server-state caching with TanStack Query, component tests, a Docker image served by nginx, and a CI pipeline.

## Features

- Register, log in and log out, with the session restored from a stored token
- Protected and guest-only routes
- Task list with status filter and pagination
- Create, edit, change status and delete tasks
- Typed API client with consistent error handling (auto logout on expired token)
- Cache invalidation after every mutation
- Component and unit tests with Vitest and Testing Library
- Multi-stage Docker build (Node build, nginx runtime) and GitHub Actions CI
- Automated dependency updates with Dependabot

## Tech stack

| Layer | Choice |
|-------|--------|
| UI | React 19 + TypeScript (strict) |
| Build tool | Vite 6 |
| Routing | React Router 6 |
| Server state | TanStack Query 5 |
| Testing | Vitest + Testing Library |
| DevOps | Docker, nginx, GitHub Actions |

## Architecture

```
src/
├── auth/         # AuthContext, ProtectedRoute, GuestRoute
├── components/   # AppLayout, TaskForm, TaskItem
├── lib/          # API client, tasks API, React Query hooks
├── pages/        # Login, Register, Tasks
└── test/         # test setup
```

- `lib/api.ts` is the single HTTP entry point: it attaches the token, normalizes errors into `ApiError` and triggers logout on `401`.
- Query keys include the user id, so cached data never leaks between accounts.

## Getting started

Requires the [TaskFlow API](https://github.com/sciamanamarcio/taskflow-api) running on `http://localhost:3333`.

```bash
cp .env.example .env
npm install
npm run dev
# http://localhost:5173
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Typecheck and build for production |
| `npm test` | Run the test suite |
| `npm run lint` | Lint the code |

### Docker

```bash
docker compose up --build
# http://localhost:5173
```

## Design decisions

- **TanStack Query** for server state instead of hand-written effects, to get caching, loading states and invalidation for free.
- **Route guards as layout routes**, so pages never worry about authentication.
- **Centralized unauthorized handler**, keeping expiry logic out of the components.
- **nginx fallback to `index.html`**, so deep links work on reload.

## Roadmap

- [ ] Refresh tokens
- [ ] Optimistic updates
- [ ] End-to-end tests with Playwright

## License

MIT
