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

See the [supaproxy repo](https://github.com/NumstackPtyLtd/supaproxy) for the full project overview, cross-repo workflow, and shared code principles.

## Start dev

```bash
pnpm install
pnpm build      # Compile to dist/
pnpm lint       # tsc --noEmit (typecheck only)
```

## Session workflow

### At the start of every session
1. Run `git fetch --all` and check recent changes.
2. Check if server routes have changed since the last SDK update: compare route files in `../supaproxy-server/src/routes/` with methods in `src/client.ts`.
3. If drift detected, flag it immediately.

### Before creating a PR (MANDATORY)
1. Run `pnpm lint && pnpm build`.
2. Run `/audit-sdk` to check type completeness and server route alignment.
3. Ensure README documents any new public exports.
4. If this changes the API surface: note semver impact in the PR description.
5. If methods, types, or error handling changed: note which pages in [supaproxy-docs](https://github.com/NumstackPtyLtd/supaproxy-docs) need updating (sdk/ section).

### After a PR merges to main
1. If this is a publishable change: run `/publish-package` for a guided release.
2. After publishing: update the dependency version in supaproxy-dashboard.
3. Create a git tag for the release.

## Code rules

For shared code principles (provider agnosticism, type safety, error handling, security, writing standards), see the [supaproxy CLAUDE.md](https://github.com/NumstackPtyLtd/supaproxy/blob/main/CLAUDE.md#code-principles-apply-everywhere).

### SDK-specific rules
- All public methods must have explicit return types.
- All API response types must be fully defined in `api.ts`.
- Entity types go in `entities.ts`. Config types go in `types.ts`.
- All non-ok responses throw `SupaProxyError` with status and message.
- All public types and classes are exported through `src/index.ts`.
- Classes are exported as values. Types and interfaces are exported with `export type`.

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

> Skills now live in the central [supaproxy governance repo](https://github.com/NumstackPtyLtd/supaproxy).
