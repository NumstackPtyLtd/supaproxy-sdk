# @supaproxy/sdk

TypeScript SDK for SupaProxy. Typed API client for building dashboards and integrations.

## Architecture

```
src/
├── index.ts       Public exports (classes, types, entities)
├── client.ts      SupaProxyClient class, API group classes, request/error handling
├── api.ts         API response and request type definitions
├── types.ts       Shared config types (WorkspaceConfig, permissions, guardrails)
└── entities.ts    Database entity types (Conversation, Workspace, Message, etc.)
```

### Key classes

- **SupaProxyClient** -- main entry point. Accepts a base URL or ClientOptions. Exposes API groups as properties.
- **SupaProxyError** -- typed error with HTTP status code and message.
- **API groups**: AuthAPI, OrgAPI, WorkspacesAPI, ConnectionsAPI, ConversationsAPI, ConnectorsAPI, QueuesAPI.

### How it works

The client wraps `fetch` with cookie-based auth (`credentials: 'include'`). Each API group class has methods that call `client.get()`, `client.post()`, etc. Response types are defined in `api.ts` and reference entity types from `entities.ts`.

## Related repos

| Repo | Visibility | Purpose |
|---|---|---|
| supaproxy-server | Public (MIT) | Hono API server (the API this SDK wraps) |
| supaproxy-sdk (this) | Public (MIT) | TypeScript SDK |
| supaproxy-dashboard | Private | Astro + React frontend (primary consumer of this SDK) |
| supaproxy | Private | Contributor hub, cross-repo skills |

## Start dev

```bash
pnpm install
pnpm build      # Compile to dist/
pnpm lint       # tsc --noEmit (typecheck only)
```

## Code rules

### Type safety
- No `any` types. No `as any` casts.
- All public methods must have explicit return types.
- All API response types must be fully defined in `api.ts`.
- Entity types go in `entities.ts`. Config types go in `types.ts`.

### Error handling
- All non-ok responses throw `SupaProxyError` with status and message.
- No empty catch blocks.
- `res.ok` is checked before parsing JSON.

### Exports
- All public types and classes are exported through `src/index.ts`.
- Classes are exported as values. Types and interfaces are exported with `export type`.

### Provider agnosticism
- No AI provider names in code or documentation.
- No provider-specific token formats as placeholders.

### British English
- Use British English in documentation and comments.

## Adding a method

Use the `/add-method` skill for a guided workflow, or:

1. Add the response type to `src/api.ts`.
2. Add the method to the correct API class in `src/client.ts`.
3. Add any new entity types to `src/entities.ts`.
4. Build: `pnpm build`.
5. Update README.md with a usage example.

Every server route should have a corresponding SDK method.

## Publishing

Use the `/publish-package` skill in the docs repo (supaproxy) for a guided workflow. See the [TEAM.md](https://github.com/NumstackPtyLtd/supaproxy/blob/main/TEAM.md) for the manual process.

## Skills

| Skill | Purpose |
|---|---|
| `/audit-sdk` | Type completeness, export coverage, server route alignment, build check |
| `/add-method` | Scaffold a new SDK method with types and exports |
