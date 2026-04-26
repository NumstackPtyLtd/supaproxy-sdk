---
name: add-method
description: Scaffolds a new SDK method matching a server API endpoint. Adds the method, types, and exports. Run when a new server route needs SDK coverage.
---

## Steps

### 1. Gather endpoint details

Ask the user for:

- **HTTP method**: GET, POST, PUT, DELETE
- **Path**: e.g. `/api/workspaces/:id/settings`
- **Which API group**: auth, org, workspaces, connections, conversations, connectors, queues (or new group)
- **Request body** (if POST/PUT): describe the fields and types
- **Response shape**: describe the fields and types

If the server repo is available at `../supaproxy-server/`, offer to read the route file to determine these automatically.

### 2. Add response type

Open `src/api.ts` and add the response interface in the appropriate section. Follow the existing pattern:

```typescript
export interface MyNewResponse {
  // fields matching the server response
}
```

If the response uses entity types (Workspace, Conversation, etc.), import them from `./entities.js`.

If new entity types are needed, add them to `src/entities.ts` first.

### 3. Add the method

Find the correct API class in `src/client.ts` (AuthAPI, OrgAPI, WorkspacesAPI, etc.) and add the method:

```typescript
methodName(params: ...): Promise<MyNewResponse> {
  return this.client.get('/api/path', options);
}
```

Follow the existing patterns:
- GET methods accept an optional `options?: RequestOptions` parameter
- POST/PUT methods accept the request body as the first parameter
- Path parameters are template literals: `` `/api/workspaces/${id}` ``
- Query parameters use URLSearchParams (see conversations.list for reference)

### 4. Add request type (if needed)

If the method accepts a request body, add the request interface to `src/api.ts`:

```typescript
export interface MyNewRequest {
  // fields
}
```

### 5. Verify exports

Check `src/index.ts` to ensure:

- New response/request types are exported (they should be via `export type * from './api.js'`)
- Any new entity types are exported (via `export type * from './entities.js'`)
- If a new API class was created, it's instantiated in the SupaProxyClient constructor

### 6. Build and verify

```bash
pnpm build
```

Check that the build succeeds and the new types appear in `dist/`.

### 7. Remind about documentation

After adding the method, remind the user:

- [ ] Update README.md with a usage example for the new method
- [ ] If this is a new API group, add a section in README.md
- [ ] Run `/audit-sdk` to verify overall coverage
- [ ] The corresponding server route should already exist (or be in a linked PR)
