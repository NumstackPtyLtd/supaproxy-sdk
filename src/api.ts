/**
 * API response types: typed contracts between server and clients.
 * Every endpoint has a corresponding response type here.
 */

import type {
  Conversation, ConversationWithStats, ConversationStats, Message, AuditLog,
  Workspace, Connection, ConnectionTool, Consumer, KnowledgeSourceEntity, Guardrail,
  Organisation, User, ComplianceViolation, KnowledgeGap, FraudIndicator,
} from './entities';

// ── Health ──

export interface HealthResponse {
  status: 'ok';
  edition: 'core' | 'cloud';
  setup_complete: boolean;
  workspaces: number;
  ai_configured: boolean;
  connections: number;
}

// ── Auth ──

export interface SessionResponse {
  user: { id: string; email: string; name: string; role: string } | null;
}

export interface SignupRequest {
  org_name: string;
  admin_name: string;
  admin_email: string;
  admin_password: string;
  workspace_name: string;
  team_name: string;
  system_prompt?: string;
}

export interface SignupResponse {
  status: 'ok';
  org_id: string;
  user_id: string;
  workspace_id: string;
}

// ── Organisation ──

export interface OrgResponse {
  org: Organisation;
}

export interface OrgSettingsResponse {
  settings: Record<string, string>;
  configured: Record<string, boolean>;
}

export interface OrgUsersResponse {
  users: User[];
  total: number;
}

// ── Models ──

export interface ModelOption {
  id: string;
  label: string;
  default?: boolean;
}

export interface ModelsResponse {
  models: ModelOption[];
}

// ── Workspaces ──

export interface WorkspaceListItem extends Workspace {
  connection_count: number;
  tool_count: number;
  knowledge_count: number;
  queries_today: number;
  cost_mtd: number;
}

export interface WorkspaceListResponse {
  workspaces: WorkspaceListItem[];
}

export interface WorkspaceSummaryResponse {
  workspace: Workspace & { team: string };
}

export interface WorkspaceDetailResponse {
  workspace: Workspace;
  connections: Connection[];
  tools: ConnectionTool[];
  knowledge: KnowledgeSourceEntity[];
  guardrails: Guardrail[];
  consumers: Consumer[];
  permissions: Array<{ role: string; tool_patterns: string }>;
  stats: {
    today: number;
    week: number;
    month: number;
    avg_ms: number;
    cost_mtd: number;
    error_rate: number;
  };
}

// ── Connections ──

export interface ConnectionsResponse {
  connections: Connection[];
  tools: ConnectionTool[];
}

export interface McpTestResponse {
  ok: boolean;
  tools?: number;
  server?: string;
  toolNames?: string[];
  error?: string;
}

export interface SaveConnectionResponse {
  status: 'saved';
  message: string;
  tools?: number;
}

// ── Consumers ──

export interface ConsumersResponse {
  consumers: Consumer[];
}

// ── Knowledge ──

export interface KnowledgeResponse {
  knowledge: KnowledgeSourceEntity[];
  gaps: Array<KnowledgeGap & { conversation_id: string; user_name: string; timestamp: string }>;
}

export interface CreateKnowledgeSourceRequest {
  name: string;
  type: string;
  content: string;
}

export interface CreateKnowledgeSourceResponse {
  id: string;
  chunksIndexed: number;
}

// ── Compliance ──

export type DisplayFormat = 'text' | 'code' | 'pre' | 'danger' | 'warning' | 'badge';

export interface DisplayField {
  source: 'context' | 'outcome';
  key: string;
  label: string;
  format: DisplayFormat;
}

export type EventActionType = 'flag' | 'dismiss' | 'block_connection';

export interface EventAction {
  type: EventActionType;
  label: string;
}

export type EventStatus = 'open' | 'flagged' | 'dismissed';

export interface GuardrailEvent {
  id: string;
  workspace_id: string;
  conversation_id: string | null;
  event_type: 'execution_blocked' | 'retrieval_stripped';
  plugin_id: string;
  context: Record<string, unknown>;
  outcome: Record<string, unknown>;
  display: DisplayField[];
  actions: EventAction[];
  status: EventStatus;
  created_at?: string;
}

export interface ComplianceResponse {
  guardrails: Guardrail[];
  violations: Array<ComplianceViolation & { conversation_id: string; user_name: string; timestamp: string }>;
  guardrailEvents: GuardrailEvent[];
  guardrailEventTotal: number;
}

// ── Conversations ──

export interface ConversationFilters {
  status: string[];
  consumer: string[];
  category: string[];
  resolution: string[];
}

export interface ConversationListResponse {
  conversations: ConversationWithStats[];
  total: number;
  filters: ConversationFilters;
}

export interface ConversationDetailResponse {
  conversation: Conversation;
  messages: Array<Message & {
    tools_called: string | null;
    connections_hit: string | null;
    tokens_input: number | null;
    tokens_output: number | null;
    cost_usd: number | null;
    duration_ms: number | null;
    query_error: string | null;
  }>;
  stats: ConversationStats | null;
}

export interface CloseConversationResponse {
  status: 'closed';
  message: string;
}

// ── Dashboard ──

export interface DashboardResponse {
  tickets: { open: number; cold: number; closed_today: number; closed_week: number };
  sentiment: { average: number; distribution: Record<string, number> };
  compliance: { total_violations: number; recent: ComplianceViolation[]; by_rule: Record<string, number> };
  knowledge_gaps: { topics: Array<{ topic: string; count: number; last_seen: string }> };
  resolution: Record<string, number>;
  cost: { today: number; this_week: number; this_month: number };
  usage: { queries_today: number; queries_this_week: number; queries_this_month: number };
  recent_conversations: ConversationWithStats[];
  categories: Record<string, number>;
  channels: Record<string, number>;
}

// ── Query ──

export interface QueryRequest {
  query: string;
  session_id?: string;
  consumer_type?: string;
  consumer_context?: Record<string, string>;
}

export interface QueryResponse {
  answer: string;
  tools_called: string[];
  connections_hit: string[];
  tokens: { input: number; output: number };
  cost_usd: number;
  duration_ms: number;
  error: string | null;
  conversation_id: string;
  session_id: string;
}

// ── Queues ──

export interface QueueStats {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

export interface QueuesResponse {
  queues: QueueStats[];
}

// ── API keys ──

export interface ApiKeyListResponse {
  keys: import('./entities').ApiKey[];
}

export interface CreateApiKeyResponse {
  id: string;
  key: string;
  prefix: string;
  label: string;
  created_at: string;
}

// ── Prompts ──

export interface PromptListResponse {
  prompts: import('./entities').PromptTemplate[];
}

export interface PromptVersionsResponse {
  versions: import('./entities').PromptTemplate[];
}

export interface SavePromptRequest {
  content: string;
  scope: 'org' | 'workspace';
  scope_id?: string;
  is_draft?: boolean;
}

export interface SavePromptResponse {
  id: string;
  version: number;
}

export interface ActivatePromptResponse {
  status: 'activated';
}

// ── Integrations and entry points ──

export interface IntegrationItem {
  id: string;
  org_id: string;
  type: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

export interface IntegrationListResponse {
  integrations: IntegrationItem[];
}

export interface EntryPointItem {
  id: string;
  integration_id: string;
  channel_id: string;
  channel_name: string | null;
  direct: boolean;
  direct_workspace_id: string | null;
  integration_type?: string;
  created_at?: string;
}

export interface EntryPointListResponse {
  entryPoints: EntryPointItem[];
}

// ── Installed guardrails ──

export interface InstalledGuardrailItem {
  id: string;
  org_id: string;
  plugin_id: string;
  package_name: string;
  package_version: string;
  plugin_metadata: {
    name: string;
    description: string;
    author: string;
    version: string;
    stage: string;
    configSchema: { fields: Array<{ name: string; label: string; type: string }> };
  };
  installed_by: string;
  installed_at?: string;
}

export interface InstalledGuardrailListResponse {
  installedGuardrails: InstalledGuardrailItem[];
}

export interface InstallGuardrailResponse {
  guardrail: InstalledGuardrailItem;
}

// ── Marketplace ──

export interface MarketplacePlugin {
  id: string;
  packageName: string;
  name: string;
  description: string;
  author: string;
  version: string;
  stage: string;
  verified: boolean;
  category: string;
  tags: string[];
  source: string;
  icon?: string;
  destination?: { type: string; href: string; label: string };
  configSchema?: { fields: Array<{ name: string; label: string; type: string; required?: boolean; placeholder?: string; helpText?: string }> };
  hasOAuth?: boolean;
  syncSchema?: Record<string, unknown>;
  postInstall?: import('./types').PostInstall;
  display?: 'modal' | 'slideover';
  canRemove?: boolean;
}

export interface MarketplaceListResponse {
  plugins: MarketplacePlugin[];
}

// ── Knowledge sync ──

export interface KnowledgeSourcesResponse {
  sources: import('./types').KnowledgeSourceInfo[];
}

export interface KnowledgeBrowseResponse {
  units: import('./types').KnowledgeUnit[];
}

export interface KnowledgeSyncConfigResponse {
  config: import('./types').SyncConfig;
}

export interface KnowledgeSyncStatusResponse {
  status: string;
  lastSyncedAt: string | null;
  syncChunkCount: number;
  errorMessage: string | null;
}

export interface AvailableKnowledgeSource {
  pluginId: string;
  syncConfigId: string;
  selectedUnits: string[];
  frequency: string;
  status: string;
  syncChunkCount: number;
  lastSyncedAt: string | null;
  enabled: boolean;
  sourceId: string | null;
  workspaceStatus: string | null;
  workspaceChunks: number;
}

export interface AvailableKnowledgeResponse {
  available: AvailableKnowledgeSource[];
}

export interface EnableKnowledgeSourceResponse {
  sourceId: string;
  status: string;
}

export interface SyncHistoryEntry {
  id: string;
  configId: string;
  orgId: string;
  pluginId: string;
  status: 'success' | 'error';
  chunksIndexed: number;
  durationMs: number;
  errorMessage: string | null;
  syncedAt: string;
}

export interface SyncHistoryResponse {
  entries: SyncHistoryEntry[];
  total: number;
  page: number;
  pageSize: number;
}

export interface KnowledgeHealthSource {
  pluginId: string;
  status: string;
  lastSyncedAt: string | null;
  syncChunkCount: number;
  frequency: string;
  errorMessage: string | null;
}

export interface KnowledgeHealthResponse {
  sourcesConnected: number;
  totalChunks: number;
  errorsLast24h: number;
  successLast24h: number;
  staleCount: number;
  sources: KnowledgeHealthSource[];
}

// ── Guardrail policies ──

export interface GuardrailPolicyListResponse {
  policies: import('./entities').GuardrailPolicy[];
}

export interface PolicyComplianceItem {
  workspace_id: string;
  workspace_name: string;
  enabled: boolean;
  has_override: boolean;
}

export interface PolicyComplianceResponse {
  compliance: PolicyComplianceItem[];
}

export interface SecurityOverviewResponse {
  total_events: number;
  blocked_events: number;
  stripped_events: number;
  flagged_events: number;
  events_by_day: Array<{ date: string; blocked: number; stripped: number }>;
  top_workspaces: Array<{ workspace_id: string; workspace_name: string; event_count: number }>;
  recent_flagged: Array<{
    id: string;
    workspace_id: string;
    workspace_name: string;
    event_type: string;
    plugin_id: string;
    status: string;
    created_at: string;
  }>;
  compliance_score: number;
  total_workspaces: number;
  compliant_workspaces: number;
}

// ── Workspace guardrails ──

export interface WorkspaceGuardrailsResponse {
  guardrails: Array<{
    id: string;
    name: string;
    enabled: boolean;
    plugin_id: string;
    stage: string;
    config: Record<string, unknown>;
  }>;
}

// ── Activity ──

export interface ActivityItem {
  id: string;
  workspace_id: string;
  type: string;
  description: string;
  user_id: string | null;
  user_name: string | null;
  created_at: string;
}

export interface ActivityResponse {
  activity: ActivityItem[];
}

// ── Provider testing ──

export interface ProviderTestResponse {
  ok: boolean;
  chat: boolean;
  embedding: boolean;
  models?: Array<{ id: string; name: string }>;
}

export interface ProviderModelsResponse {
  models: Array<{ id: string; name: string }>;
}

// ── Generic ──

export interface ProviderTypeInfo {
  type: string;
  name: string;
  description: string;
  configSchema: { fields: Array<{ name: string; label: string; type: string; required: boolean; placeholder?: string; helpText?: string }> };
  models: Array<{ id: string; label: string; default?: boolean }>;
}

export interface ProviderTypesResponse {
  providers: ProviderTypeInfo[];
}

export interface ConsumerTypeInfo {
  type: string;
  name: string;
  description: string;
  configSchema: { fields: Array<{ name: string; label: string; type: string; required: boolean; placeholder?: string; helpText?: string }> };
}

export interface ConsumerTypesResponse {
  consumers: ConsumerTypeInfo[];
}

export interface ErrorResponse {
  error: string;
}

export interface StatusResponse {
  status: 'ok';
  message?: string;
}

// ── Route ──

export interface RouteRequest {
  query: string;
}

export interface RouteResponse {
  answer: string;
  conversation_id: string;
  workspace_id: string;
  routed: boolean;
  routed_to: string | null;
}

// ── Admin (cloud-only) ──

export interface AdminPluginListResponse {
  plugins: MarketplacePlugin[];
}

export interface AdminPluginUploadResponse {
  plugin: MarketplacePlugin;
}

// ── Cloud public ──

export interface DemoRequestData {
  name: string;
  email: string;
  company?: string;
  message?: string;
}

export interface ContactRequestData {
  name?: string;
  email: string;
  subject?: string;
  message?: string;
}
