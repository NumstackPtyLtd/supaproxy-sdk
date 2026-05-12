# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.2.0] - 2026-05-12

### Added
- `client.prompts.list()` — lists all active prompts for the current organisation
- `client.prompts.versions(type, { scope?, scope_id? })` — gets version history for a prompt type
- `client.prompts.save(type, { content, scope, scope_id?, is_draft? })` — saves a new prompt version
- `client.prompts.activate(type, id, { scope?, scope_id? })` — activates a specific prompt version
- `PromptTemplate` entity type with `PromptType` and `PromptScope` unions
- `PromptListResponse`, `PromptVersionsResponse`, `SavePromptRequest`, `SavePromptResponse`, `ActivatePromptResponse` API types
- `ApiKey` entity type
- `ApiKeyListResponse` and `CreateApiKeyResponse` types
- `client.workspaces.apiKeys.list(workspaceId)` — lists active API keys
- `client.workspaces.apiKeys.create(workspaceId, { label, test? })` — creates a key
- `client.workspaces.apiKeys.revoke(workspaceId, keyId)` — revokes a key

## [0.1.1] - 2026-04-25

### Fixed
- Slack connector methods added: `addSlackChannel()` and `connectSlack()`

## [0.1.0] - 2026-04-25

### Added
- Initial SDK release
- `SupaProxyClient` with `auth`, `org`, `workspaces`, `connections`, `conversations`, `connectors`, `queues` API groups
- Full TypeScript types for all API responses and entities
- `SupaProxyError` with HTTP status code
