# ADR 0001: Ports and Adapters

- Status: Accepted
- Date: 2026-09-05
- Owners: Student Workspace Manager maintainers
- Scope: Entire application

## Context

The product starts as a roster reconciliation tool and is expected to grow to
support Google Chat, Google Classroom, Mentor imports, persistence, and an AI
assistant. Each integration has different authorization rules and can change
independently.

If use cases import Google SDKs, Next.js APIs, database clients, or AI SDKs
directly, business policy becomes coupled to delivery and infrastructure. That
would make authorization rules difficult to test, provider replacement costly,
and AI-initiated writes unsafe.

We need an architecture that:

- keeps roster and membership rules independent from frameworks;
- makes external systems replaceable and testable;
- keeps reads, proposed writes, confirmed writes, and audit logging explicit;
- supports both a web UI and a Google Chat bot without duplicating workflows;
- can be enforced automatically rather than relying only on conventions.

## Decision

Use Ports and Adapters (hexagonal architecture), organized by business
capability.

Each capability lives under `src/modules/<capability>` and contains:

```text
domain/                 Business concepts and invariants
application/ports/      Inbound and outbound contracts
application/use-cases/  Workflow orchestration
adapters/driving/       Web, HTTP, CLI, and Chat bot entry points
adapters/driven/        Google, database, file, and AI implementations
public/                 Intentional cross-module API
```

The application layer owns port interfaces. Driven adapters implement those
ports. Driving adapters call application use cases. SDK-specific request and
response types are mapped at adapter boundaries and never cross into the
application core.

`src/app` is a Next.js delivery and composition boundary. It may wire concrete
adapters to use cases, but it must not contain business rules.

Dependency direction is always inward:

```text
driving adapter -> application -> domain
driven adapter  -> application ports
composition root -> concrete adapters + use cases
```

External writes are modeled separately from previews. Every write requires an
explicit human confirmation and creates an audit record. An AI component may
recommend or prepare a command, but it cannot provide human confirmation.

## Alternatives considered

### Next.js feature folders with direct SDK calls

Rejected. It is initially concise but couples business rules to HTTP, React,
Google SDKs, and authentication details. The same logic would be duplicated for
the future Chat bot.

### Traditional controller-service-repository layers

Rejected as the primary model. It separates technical layers, but often lets a
generic service layer depend directly on provider-specific repositories and
does not make driving versus driven boundaries explicit.

### Microservices

Rejected for the current stage. The operational cost is not justified. The
capability boundaries can be extracted later if independent deployment becomes
necessary.

### Google Apps Script only

Rejected as the core architecture. It offers quick Workspace automation but
would tightly bind the product to one runtime and make the web application,
testing, and future AI integration harder to evolve.

## Consequences

### Positive

- Google Chat, Classroom, storage, and AI providers can be replaced without
  rewriting use cases.
- The web UI, API routes, CLI, and Chat bot can share the same use cases.
- Domain and application tests run without network access or provider mocks.
- OAuth scope separation and write confirmation become testable policies.
- Provider failures are translated into application-owned results.

### Negative

- More interfaces, files, and explicit mapping are required.
- Dependency injection must be maintained at composition boundaries.
- Small features have more initial ceremony than direct SDK calls.
- Developers must decide which layer owns every new type and behavior.

### Risks

- Ports can become provider-shaped abstractions instead of business-oriented
  contracts.
- `src/app` can become a hidden service layer if orchestration is placed there.
- Re-export files or dynamic imports could be used to bypass boundaries.

These risks are addressed through focused ports, code review, `AGENTS.md`, and
automated fitness functions.

## Compliance

The decision is enforced by:

- `.dependency-cruiser.cjs`: dependency direction and cycle rules;
- strict TypeScript checks;
- unit tests for business and security invariants;
- `npm run check`: the mandatory local and CI quality gate;
- `AGENTS.md`: implementation rules for humans and AI agents.

Architecture violations must be fixed. Suppression is allowed only after a new
ADR documents the exception and the automated rules are updated deliberately.

## Review triggers

Review this ADR if any of the following becomes true:

- a capability requires independent deployment or scaling;
- cross-module calls become predominantly asynchronous;
- the application core must support a non-TypeScript runtime;
- dependency rules create repeated, justified exceptions;
- compliance requirements mandate stronger process or data isolation.

Supersede this ADR with a new one instead of rewriting its historical decision.
