# Student Workspace Manager

Internal KhAI tool for reconciling student rosters with Google Chat and Google
Classroom. The application uses TypeScript, Next.js, and Ports and Adapters.

## Requirements

- Node.js 24
- npm 11+

## Start locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Google OAuth

Copy `.env.example` to `.env.local` and set `AUTH_SECRET`, `AUTH_GOOGLE_ID`, and
`AUTH_GOOGLE_SECRET`. Use a Google OAuth client of type **Web application** with
this local redirect URI:

```text
http://localhost:3000/api/auth/callback/google
```

Only root `@khai.edu` accounts are accepted. Authentication requests the
read-only Google Chat membership scope; access tokens stay in the encrypted
server session and are never exposed in the public session payload.

## Architecture

Read these contracts before changing production code:

- [`docs/architecture.md`](docs/architecture.md)
- [`docs/clean-code.md`](docs/clean-code.md)
- [`docs/naming.md`](docs/naming.md)
- [`AGENTS.md`](AGENTS.md)

Business capabilities live under `src/modules`. Next.js is a delivery adapter;
Google APIs, persistence, and AI are driven adapters.

## Quality gate

```bash
npm run check
```

The command runs ESLint, strict TypeScript, dependency rules, unit tests, and a
production build. GitHub Actions runs the same command for every pull request
and push to `main`.

## Security

Never commit OAuth client secrets, tokens, roster imports, or generated reports.
External writes require explicit human confirmation and an audit record.
Operational logs are structured JSON produced by Pino and exclude member email
addresses. Authorization headers and access-token fields are redacted. Audit
records remain in the configured JSONL repository and must be access-controlled.
