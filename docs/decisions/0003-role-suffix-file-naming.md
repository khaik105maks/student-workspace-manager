# ADR 0003: Role-Suffix File Naming

- Status: Accepted
- Date: 2026-09-06
- Owners: Student Workspace Manager maintainers
- Scope: TypeScript module files and persistence code

## Context

As Google Chat, Classroom, persistence, and AI integrations are added, broad
names such as `manager`, `helper`, and `utils` hide responsibility. A file name
must reveal both its domain concept and architectural role without becoming a
sentence.

Database concerns also need a visible boundary. Calling every external client a
repository weakens the Repository pattern and makes persistence dependencies
spread across adapters and use cases.

## Decision

Use `<short-singular-concept>.<role>.ts`. Approved roles are `case`, `service`,
`resolver`, `factory`, `policy`, `facade`, `repo`, `entity`, and `value`, with
locations defined in `docs/naming.md`.

Use singular concepts by default. Preserve plural names for real collections.
Reserve `repo` for persistence ports and implementations. Concrete database
code lives under `adapters/driven/repo`.

## Alternatives considered

### Layer suffixes only

Rejected because names such as `membership.application.ts` describe placement,
not responsibility.

### No suffixes

Rejected because short names such as `member.ts` do not distinguish a use case,
value, port, or persistence adapter.

### Repository for every external API

Rejected because Repository represents collection-like persistence. External
capabilities use service, resolver, or facade ports instead.

## Consequences

Names become short and predictable, and directory listings communicate design.
Renames are more common when responsibility changes; this is desirable design
feedback. Some framework-owned files (`page.tsx`, `layout.tsx`) remain exempt.

## Compliance

- `eslint-plugin-check-file` validates role suffixes by architectural folder.
- ESLint blocks generic file names.
- Dependency Cruiser blocks database SDKs outside driven repo adapters.
- Symbol naming remains enforced by typescript-eslint.

## Review triggers

Review when a recurring legitimate role has no suffix, or a supported database
library is missing from the dependency rule.
