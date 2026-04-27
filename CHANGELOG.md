# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- `ApiKey` entity type in `entities.ts`
- `ApiKeyListResponse` and `CreateApiKeyResponse` types in `api.ts`
- `client.workspaces.apiKeys.list(workspaceId)` — lists active API keys (prefix and metadata, no raw key)
- `client.workspaces.apiKeys.create(workspaceId, { label, test? })` — creates a key, returns full value once
- `client.workspaces.apiKeys.revoke(workspaceId, keyId)` — revokes a key immediately

## [0.1.1] - 2026-04-25

### Fixed
- Slack connector methods added: `addSlackChannel()` and `connectSlack()`

## [0.1.0] - 2026-04-25

### Added
- Initial SDK release
- `SupaProxyClient` with `auth`, `org`, `workspaces`, `connections`, `conversations`, `connectors`, `queues` API groups
- Full TypeScript types for all API responses and entities
- `SupaProxyError` with HTTP status code
