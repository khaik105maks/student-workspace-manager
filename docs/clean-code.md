# Clean Code Standard

This standard is executable through ESLint and `npm run check`.

## Naming

- Classes, interfaces, types, and React components use `PascalCase`.
- Functions, methods, parameters, and local values use `camelCase`.
- Constants may use `UPPER_CASE` when they are true module-level constants.
- Boolean names communicate a predicate: `is`, `has`, `can`, `should`, or
  `did`, for example `isHumanConfirmed`.
- Names express business intent. Generic identifiers such as `result`, `data`,
  `item`, `items`, `obj`, `temp`, `tmp`, `foo`, `bar`, and `baz` are statically
  forbidden. Name the represented business concept instead.
- `manager`, `helper`, `utils`, `common`, and `misc` are forbidden code roles;
  choose the specific responsibility.
- Port names describe one capability (`MembershipService`, `AuditRepo`), not a
  technology (`GoogleService`). Adapter names identify the technology and role
  (`GoogleChatMembershipService`).
- Use-case classes and files use a singular imperative business action, such as
  `CheckMemberCase` and `check-member.case.ts`.
- Use `@/` for imports crossing two or more parent directories. Relative imports
  are reserved for nearby files within the same feature area.

## Function design

- Every function and method is at most 25 non-blank, non-comment lines.
- Cyclomatic complexity is at most 5.
- A function has at most 10 statements and 3 parameters.
- Nested `if` statements and nested ternaries are forbidden.
- Prefer guard clauses, extraction, lookup tables, and polymorphism over
  branching.
- A function operates at one level of abstraction.
- Keep runtime schemas, type-only contracts, and executable behavior in
  separate files when each represents an independently named responsibility.

## Declarative and functional core

- Classes are allowed for use cases, ports, adapters, and dependency injection.
- Method bodies prefer expressions and transformations over mutation.
- Domain and application values are readonly and immutable; array types use
  `ReadonlyArray<T>`, never `T[]`.
- Prefer `map`, `filter`, `flatMap`, `reduce`, and `Set` over mutable loops.
- Keep pure decisions in named functions; isolate I/O in adapters.
- Avoid `let`; derive a new value instead of changing an existing one.
- Type assertions (`as Type`, `<Type>value`) and non-null assertions (`value!`)
  are forbidden. Parse or construct a valid value instead of overriding the
  compiler. Use `satisfies` when only a compile-time compatibility check is
  needed.
- Errors represent violated invariants or failed boundaries, not ordinary
  branching.
- Time, randomness, IDs, network calls, and persistence enter use cases through
  ports; application code does not call their global implementations directly.

## Exceptions

Generated files and framework configuration are outside these rules. A
production-code exception requires an ADR. Inline ESLint disable comments are
not an accepted exception mechanism.
