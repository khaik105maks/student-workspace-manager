# Architecture Decision Records

ADRs record significant decisions that constrain the structure, security, or
operation of Student Workspace Manager.

## Statuses

- Proposed: under discussion and not binding.
- Accepted: active and binding.
- Deprecated: still present but discouraged.
- Superseded: replaced by a newer ADR.
- Rejected: considered and intentionally not chosen.

## Workflow

1. Copy `template.md` to the next zero-padded number.
2. Describe the problem and constraints before the chosen solution.
3. Record realistic alternatives and their rejection reasons.
4. Define consequences and automated compliance checks.
5. Open the ADR as Proposed; change it to Accepted with the implementation.
6. Never silently rewrite an accepted decision. Supersede it with a new ADR.

## Index

| ADR | Status | Decision |
| --- | --- | --- |
| [0001](0001-ports-and-adapters.md) | Accepted | Use Ports and Adapters organized by capability |
| [0002](0002-executable-clean-code-standard.md) | Accepted | Enforce naming, small functions, and functional core |
| [0003](0003-role-suffix-file-naming.md) | Accepted | Use short singular concepts and architectural role suffixes |
