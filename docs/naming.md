# Naming Contract

Names are short, singular, role-specific, and expressed in domain language.

## File formula

```text
<short-singular-concept>.<role>.ts
<short-singular-concept>.<role>.test.ts
```

Words inside a concept use kebab-case. Prefer one word; use two only when one is
ambiguous. Examples: `add-member.case.ts`, `member-email.value.ts`, `audit.repo.ts`.

Use singular concept names by default. Use plural names only when the concept is
intrinsically a collection or protocol. Variables that actually hold multiple
values remain plural (`emails`, `members`).

Group adapters by external technology once the group contains multiple files.
The directory supplies context, so do not repeat it in every filename:

```text
adapters/driven/google/
├── auth.factory.ts
├── account.schema.ts
├── account.type.ts
├── token.service.ts
└── token.type.ts
```

## Approved roles

| Suffix | Meaning | Allowed location |
| --- | --- | --- |
| `.case.ts` | One application action | `application/use-cases` |
| `.service.ts` | Stateless capability or external port | domain, ports, adapters |
| `.resolver.ts` | Resolves one representation or identity to another | ports, adapters |
| `.factory.ts` | Constructs a valid complex value | domain, ports, adapters |
| `.policy.ts` | Pure business decision | domain, ports, adapters |
| `.facade.ts` | Small stable API over multiple capabilities | ports, adapters |
| `.repo.ts` | Persistence collection and database boundary | ports or `adapters/driven/repo` |
| `.entity.ts` | Domain object with identity and lifecycle | domain |
| `.value.ts` | Immutable value without identity | domain |
| `.schema.ts` | Runtime validation and transport parsing | adapters or domain boundary |
| `.type.ts` | Type-only contract with no runtime behavior | any owning layer |

`repo` is reserved for persistence. HTTP, Google Chat, Classroom, files, and AI
clients are not repositories unless they persist and retrieve domain objects as
a collection.

## Symbol alignment

The primary exported symbol mirrors the file concept and role:

```text
add-member.case.ts       -> AddMemberCase
membership.service.ts    -> MembershipService
audit.repo.ts            -> AuditRepo
member-email.value.ts    -> MemberEmail / memberEmail
member-status.value.ts   -> MemberStatus
membership.value.ts      -> Membership
```

Avoid `Manager`, `Handler`, `Processor`, `Util`, `Helper`, `Common`, and `Misc`.
Choose the actual responsibility instead. The product name may still contain
`Manager`; this restriction applies to code roles.

## Database boundary

- Repository interfaces live in `application/ports/*.repo.ts`.
- Implementations live in `adapters/driven/repo/*.repo.ts`.
- Schema mapping, queries, transactions, migrations, and database SDK imports
  belong to the repo boundary.
- Domain and use cases never import database types.

ESLint checks file patterns and blocks generic file names. Dependency Cruiser
forbids known database libraries outside driven repo adapters.
