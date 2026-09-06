<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Architecture contract

This repository uses Ports and Adapters (hexagonal architecture). These rules
are mandatory for humans and coding agents.

1. Read `docs/architecture.md`, `docs/clean-code.md`, and `docs/naming.md` before changing production code.
2. Organize business capabilities under `src/modules/<module>`.
3. `domain` contains business rules and value objects. It must not import
   Next.js, React, Google SDKs, databases, environment variables, HTTP, or npm
   runtime packages.
4. `application` contains use cases and port interfaces. It may depend on its
   domain, but never on adapters or `src/app`.
5. `adapters/driving` translates UI/HTTP/events into use-case calls.
6. `adapters/driven` implements outbound ports for Google, storage, AI, and
   other infrastructure. SDK types must not cross a port boundary.
7. `src/app` is a Next.js delivery adapter and composition entry point. It must
   not contain business rules.
8. Write operations require an explicit confirmation value and must produce an
   audit entry. AI output is never sufficient authorization for a write.
9. Secrets, OAuth tokens, student imports, and generated reports never enter
   Git. Use environment variables or ignored local storage.
10. New architecture exceptions require an ADR in `docs/decisions/` and a
    matching update to the automated rules.
11. File names use the role suffixes and singular vocabulary from
    `docs/naming.md`. Database code and database SDK imports belong only to
    repository ports and `adapters/driven/repo` implementations.

Before finishing any change, run `npm run check`. Do not bypass failing rules
with disable comments, `any`, dynamic imports, re-export tricks, or relaxed
configuration.
