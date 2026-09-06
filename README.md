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
