# @supaproxy/sdk

[![npm](https://img.shields.io/npm/v/@supaproxy/sdk)](https://www.npmjs.com/package/@supaproxy/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

TypeScript SDK for [SupaProxy](https://github.com/NumstackPtyLtd/supaproxy-server). Typed API client for building dashboards and integrations.

> **Alpha** — API surface may change without notice.

## Install

```bash
pnpm add @supaproxy/sdk
# or
npm install @supaproxy/sdk
```

## Authentication

SupaProxy uses cookie-based auth (httpOnly JWT). The SDK sends `credentials: 'include'` by default so cookies are attached to every request.

```typescript
import { SupaProxyClient } from '@supaproxy/sdk';

const client = new SupaProxyClient('http://localhost:3001');

// Sign up (creates org, user, and first workspace)
await client.auth.signup({
  org_name: 'Acme Corp',
  admin_name: 'Jane',
  admin_email: 'jane@acme.com',
  admin_password: 'securepassword',
  workspace_name: 'Support',
  team_name: 'Engineering',
});

// Log in (sets session cookie)
await client.auth.login({ email: 'jane@acme.com', password: 'securepassword' });

// Check session
const { user } = await client.auth.session();
```

For server-side usage (Node.js), pass cookies manually via headers:

```typescript
const client = new SupaProxyClient({
  baseUrl: 'http://localhost:3001',
  headers: { Cookie: 'supaproxy_session=<jwt_token>' },
});
```

## Usage

```typescript
// Workspaces
const { workspaces } = await client.workspaces.list();
const detail = await client.workspaces.detail('ws-my-workspace');
const result = await client.workspaces.query('ws-my-workspace', { query: 'Hello' });

// Conversations
const convos = await client.conversations.list('ws-my-workspace');
const convo = await client.conversations.get('ws-my-workspace', 'conv-id');

// Org settings
const org = await client.org.get();
const settings = await client.org.settings();
```

## API keys

Workspace API keys allow programmatic access without a session cookie — used by the MCP server and external integrations.

```typescript
// Create a key (full key returned once — store it securely)
const { id, key, prefix, label } = await client.workspaces.apiKeys.create('ws-id', {
  label: 'My integration',
});
// key looks like: sp_live_a1b2c3d4...

// Create a test key (bypasses rate limits and billing)
const testKey = await client.workspaces.apiKeys.create('ws-id', {
  label: 'CI tests',
  test: true,
});
// key looks like: sp_test_a1b2c3d4...

// List active keys (prefix and metadata only — raw key not returned)
const { keys } = await client.workspaces.apiKeys.list('ws-id');
// keys: [{ id, prefix: 'sp_live_a1b2', label, created_at, last_used_at }]

// Revoke a key immediately
await client.workspaces.apiKeys.revoke('ws-id', keyId);
```

## Error handling

```typescript
import { SupaProxyClient, SupaProxyError } from '@supaproxy/sdk';

try {
  await client.workspaces.list();
} catch (err) {
  if (err instanceof SupaProxyError) {
    console.error(err.status, err.message); // e.g. 401, "Not authenticated"
  }
}
```

## Types

The SDK re-exports all shared types — entities, API contracts, and config types:

```typescript
import type { Workspace, Conversation, QueryResponse } from '@supaproxy/sdk';
```

## Limitations

- No automatic retry or exponential backoff
- No rate limit handling (429 responses)
- No request timeout configuration
- No response caching

## License

MIT — see [LICENSE](LICENSE). Managed by Numstack Pty Ltd.
