# ADR 0002: Executable Clean Code Standard

- Status: Accepted
- Date: 2026-09-06
- Owners: Student Workspace Manager maintainers
- Scope: TypeScript production code

## Context

Ports and Adapters protects dependency direction but does not prevent unclear
names, long methods, nested branching, mutation-heavy orchestration, or high
local complexity. Written guidance alone degrades as contributors and AI agents
change.

## Decision

Adopt the rules in `docs/clean-code.md` and enforce objective parts with ESLint.
Classes remain the default shell for use cases and injected adapters. Their
method bodies use a declarative, immutable, functional style where practical.

The mandatory limits are 25 lines per function, complexity 5, 10 statements,
3 parameters, block depth 1, and no nested `if` or nested ternary expressions.
Domain and application code additionally forbids `let` and mutable data.

## Alternatives considered

### Review-only conventions

Rejected because feedback would be inconsistent and arrive too late.

### Functional programming without classes

Rejected because classes provide clear use-case identity and straightforward
constructor injection. Functional style is required inside the orchestration,
not imposed as a universal object-model ban.

### Sonar metrics only

Rejected as the sole mechanism because external dashboards are slower than
local feedback. They can supplement, but not replace, repository checks.

## Consequences

### Positive

- Naming and complexity violations fail locally and in CI.
- Small methods are easier to test and review.
- Domain decisions remain deterministic and immutable.
- AI-generated code is held to the same objective constraints.

### Negative

- UI composition sometimes requires extracting small components.
- Mapping external SDK payloads can require additional helper functions.
- A numeric limit cannot determine whether a name or abstraction is meaningful.

### Risks

- Developers might split code mechanically without improving cohesion.
- Functional chains can become less readable than a simple loop.

Review still evaluates intent, cohesion, and vocabulary. Automated metrics are
guardrails, not substitutes for design judgment.

## Compliance

- ESLint and typescript-eslint enforce naming, size, depth, complexity,
  immutable local bindings, readonly arrays, and readonly contracts without a
  vulnerable third-party FP ruleset.
- Vitest verifies behavioral invariants.
- `npm run check` is the mandatory fitness function.
- `AGENTS.md` forbids bypasses and requires this standard.

## Review triggers

Review this ADR if limits repeatedly force less readable code, framework code
cannot reasonably comply, or team evidence supports stricter thresholds.
