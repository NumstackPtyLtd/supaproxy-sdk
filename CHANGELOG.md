# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.5.0] - 2026-05-14

### Added
- `client.policies.list()`:lists all guardrail policies for the org
- `client.policies.setEnforcement(pluginId, enforcement)`:sets enforcement level (mandatory, recommended, off)
- `client.policies.compliance(pluginId)`:gets per-workspace compliance for a policy
- `client.policies.createOverride(pluginId, { workspace_id, justification })`:workspace admin justifies disabling a recommended policy
- `client.policies.securityOverview({ days? })`:org-wide security pulse (events, compliance score, top workspaces)
- `GuardrailPolicy`, `GuardrailPolicyOverride`, `PolicyEnforcement` entity types
- `GuardrailPolicyListResponse`, `PolicyComplianceResponse`, `SecurityOverviewResponse` API response types

## [0.4.0] - 2026-05-14

### Added
- `DisplayField`, `DisplayFormat` types for plugin-driven event sidebar rendering
- `EventAction`, `EventActionType` types for platform actions (flag, dismiss, block_connection)
- `EventStatus` type (open, flagged, dismissed)
- `ComplianceResponse.guardrailEventTotal` for server-side pagination

### Breaking
- `GuardrailEvent` type changed: flat fields (`tool_name`, `reason`, `stripped_content`, etc.) replaced with `context`, `outcome` (JSON bags), `display` (DisplayField[]), `actions` (EventAction[]), `status` (EventStatus)

## [0.3.0] - 2026-05-13

### Added
- `client.route.send({ query })`:sends a query through the routing layer (`POST /api/route`); returns `answer`, `conversation_id`, `workspace_id`, `routed`, and `routed_to`
- `RouteRequest` and `RouteResponse` API types

## [0.2.0] - 2026-05-12

### Added
- `client.prompts.list()`:lists all active prompts for the current organisation
- `client.prompts.versions(type, { scope?, scope_id? })`:gets version history for a prompt type
- `client.prompts.save(type, { content, scope, scope_id?, is_draft? })`:saves a new prompt version
- `client.prompts.activate(type, id, { scope?, scope_id? })`:activates a specific prompt version
- `PromptTemplate` entity type with `PromptType` and `PromptScope` unions
- `PromptListResponse`, `PromptVersionsResponse`, `SavePromptRequest`, `SavePromptResponse`, `ActivatePromptResponse` API types
- `ApiKey` entity type
- `ApiKeyListResponse` and `CreateApiKeyResponse` types
- `client.workspaces.apiKeys.list(workspaceId)`:lists active API keys
- `client.workspaces.apiKeys.create(workspaceId, { label, test? })`:creates a key
- `client.workspaces.apiKeys.revoke(workspaceId, keyId)`:revokes a key

## [0.1.1] - 2026-04-25

### Fixed
- Slack connector methods added: `addSlackChannel()` and `connectSlack()`

## [0.1.0] - 2026-04-25

### Added
- Initial SDK release
- `SupaProxyClient` with `auth`, `org`, `workspaces`, `connections`, `conversations`, `connectors`, `queues` API groups
- Full TypeScript types for all API responses and entities
- `SupaProxyError` with HTTP status code
