# Architecture

The binding decision behind this structure is
[ADR 0001](decisions/0001-ports-and-adapters.md). New significant decisions use
the process and template in [Architecture Decision Records](decisions/README.md).

## Objective

Student Workspace Manager reconciles university rosters with Google Chat and,
later, Google Classroom. It follows Ports and Adapters so business policy stays
independent from Google, Next.js, storage, and AI providers.

## Dependency direction

```text
Next.js UI / Route Handlers / Chat bot
                 |
          driving adapters
                 |
        application use cases
          |               |
       domain       outbound ports
                          ^
                          |
        Google / database / AI driven adapters
```

Dependencies point inward. Inner layers never import outer layers.

## Module structure

```text
src/modules/<capability>/
├── domain/                 Pure business concepts and invariants
├── application/
│   ├── ports/              Interfaces owned by the application
│   └── use-cases/          Workflow orchestration
├── adapters/
│   ├── driving/            Web, HTTP and Chat-event entry points
│   └── driven/             Google, persistence and AI implementations
└── public/                 Deliberate cross-module API only
```

`src/app` contains Next.js delivery code and imports ready application graphs
from `src/bootstrap`. Dependency injection is explicit at that composition
boundary; use cases never construct SDK clients. Modules must never import
`src/bootstrap`.
When a second capability module is introduced, add explicit dependency-cruiser
rules that permit cross-module imports only through each module's `public/`
entry point. Generic capture-group rules are not accepted because they can
mistake same-module imports for cross-module coupling.

## Security invariants

- Read and write OAuth scopes are separated.
- A write use case requires explicit human confirmation.
- Preview/check and execute/add are separate operations.
- Every external write produces an audit record.
- Raw OAuth tokens, client secrets, student lists, and reports are local secrets.
- AI can propose a command, but cannot supply human confirmation.

## Fitness functions

`npm run architecture` checks dependency direction and cycles.
`npm run typecheck` checks strict TypeScript contracts.
`npm run test:run` checks business invariants.
`npm run lint` checks source quality.
`npm run build` checks the real Next.js production boundary.

Run all of them with:

```bash
npm run check
```

CI must use `npm run check`. A pull request is invalid while any fitness
function fails.
