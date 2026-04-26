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

## Usage

```typescript
import { SupaProxyClient } from '@supaproxy/sdk';

const client = new SupaProxyClient('http://localhost:3001');

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
