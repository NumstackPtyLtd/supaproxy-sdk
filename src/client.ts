/**
 * SupaProxy API client: typed SDK for all API interactions.
 *
 * @alpha This SDK is in early development. No retry, rate limiting, or
 * error recovery. API surface may change without notice.
 *
 * Usage:
 *   const client = new SupaProxyClient('http://localhost:3001');
 *   const workspaces = await client.workspaces.list();
 *   const conv = await client.conversations.get(wsId, convId);
 */

import type {
  HealthResponse, SessionResponse, SignupRequest, SignupResponse,
  OrgResponse, OrgSettingsResponse, OrgUsersResponse, ModelsResponse,
  WorkspaceListResponse, WorkspaceSummaryResponse, WorkspaceDetailResponse,
  ConnectionsResponse, McpTestResponse, SaveConnectionResponse,
  ConsumersResponse, KnowledgeResponse, CreateKnowledgeSourceRequest, CreateKnowledgeSourceResponse, ComplianceResponse, WorkspaceGuardrailsResponse, ActivityResponse,
  ConversationListResponse, ConversationDetailResponse, CloseConversationResponse,
  DashboardResponse, QueryRequest, QueryResponse, QueuesResponse,
  ApiKeyListResponse, CreateApiKeyResponse,
  StatusResponse, ErrorResponse,
  ProviderTypesResponse, ConsumerTypesResponse,
  PromptListResponse, PromptVersionsResponse, SavePromptRequest, SavePromptResponse, ActivatePromptResponse,
  RouteRequest, RouteResponse,
  GuardrailPolicyListResponse, PolicyComplianceResponse, SecurityOverviewResponse,
  InstalledGuardrailListResponse, InstallGuardrailResponse,
  MarketplaceListResponse, MarketplacePlugin,
  IntegrationListResponse, EntryPointListResponse,
  ProviderTestResponse, ProviderModelsResponse,
  KnowledgeSourcesResponse, KnowledgeBrowseResponse, KnowledgeSyncConfigResponse, KnowledgeSyncStatusResponse,
  AvailableKnowledgeResponse, EnableKnowledgeSourceResponse,
  SyncHistoryResponse, KnowledgeHealthResponse,
  AdminPluginListResponse, AdminPluginUploadResponse,
  DemoRequestData, ContactRequestData,
} from './api.js';
import type { PromptType, PromptScope, PolicyEnforcement } from './entities.js';

export interface ClientOptions {
  baseUrl: string;
  credentials?: RequestCredentials;
  headers?: Record<string, string>;
}

export interface RequestOptions {
  signal?: AbortSignal;
}

export class SupaProxyError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'SupaProxyError';
  }
}

export class SupaProxyClient {
  private readonly _baseUrl: string;
  private credentials: RequestCredentials;
  private headers: Record<string, string>;

  get baseUrl(): string { return this._baseUrl; }

  public auth: AuthAPI;
  public org: OrgAPI;
  public workspaces: WorkspacesAPI;
  public connections: ConnectionsAPI;
  public conversations: ConversationsAPI;
  public connectors: ConnectorsAPI;
  public queues: QueuesAPI;
  public providers: ProvidersAPI;
  public consumerTypes: ConsumerTypesAPI;
  public prompts: PromptsAPI;
  public policies: PoliciesAPI;
  public integrations: IntegrationsAPI;
  public marketplace: MarketplaceAPI;
  public knowledge: KnowledgeAPI;
  public oauth: OAuthAPI;
  public route: RouteAPI;
  public admin: AdminAPI;
  public cloud: CloudAPI;

  constructor(options: ClientOptions | string) {
    const opts = typeof options === 'string' ? { baseUrl: options } : options;
    this._baseUrl = opts.baseUrl.replace(/\/$/, '');
    this.credentials = opts.credentials ?? 'include';
    this.headers = opts.headers ?? {};

    this.auth = new AuthAPI(this);
    this.org = new OrgAPI(this);
    this.workspaces = new WorkspacesAPI(this);
    this.connections = new ConnectionsAPI(this);
    this.conversations = new ConversationsAPI(this);
    this.connectors = new ConnectorsAPI(this);
    this.queues = new QueuesAPI(this);
    this.providers = new ProvidersAPI(this);
    this.consumerTypes = new ConsumerTypesAPI(this);
    this.prompts = new PromptsAPI(this);
    this.policies = new PoliciesAPI(this);
    this.integrations = new IntegrationsAPI(this);
    this.marketplace = new MarketplaceAPI(this);
    this.knowledge = new KnowledgeAPI(this);
    this.oauth = new OAuthAPI(this);
    this.route = new RouteAPI(this);
    this.admin = new AdminAPI(this);
    this.cloud = new CloudAPI(this);
  }

  async request<T>(method: string, path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const url = `${this._baseUrl}${path}`;
    const init: RequestInit = {
      method,
      credentials: this.credentials,
      headers: {
        ...this.headers,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(options?.signal ? { signal: options.signal } : {}),
    };

    if (body) {
      init.body = JSON.stringify(body);
    }

    const res = await fetch(url, init);

    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      try {
        const err = await res.json() as ErrorResponse;
        message = err.error || message;
      } catch {}
      throw new SupaProxyError(res.status, message);
    }

    if (res.status === 204) return {} as T;
    return res.json() as Promise<T>;
  }

  async requestFormData<T>(method: string, path: string, body: FormData, options?: RequestOptions): Promise<T> {
    const url = `${this._baseUrl}${path}`;
    const res = await fetch(url, {
      method,
      credentials: this.credentials,
      body,
      ...(options?.signal ? { signal: options.signal } : {}),
    });
    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      try { const err = await res.json() as ErrorResponse; message = err.error || message; } catch {}
      throw new SupaProxyError(res.status, message);
    }
    return res.json() as Promise<T>;
  }

  get<T>(path: string, options?: RequestOptions): Promise<T> { return this.request<T>('GET', path, undefined, options); }
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> { return this.request<T>('POST', path, body, options); }
  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> { return this.request<T>('PUT', path, body, options); }
  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> { return this.request<T>('PATCH', path, body, options); }
  delete<T>(path: string, options?: RequestOptions): Promise<T> { return this.request<T>('DELETE', path, undefined, options); }

  async health(options?: RequestOptions): Promise<HealthResponse> {
    return this.get<HealthResponse>('/health', options);
  }
}

// ── Auth ──

class AuthAPI {
  constructor(private client: SupaProxyClient) {}

  login(data: { email: string; password: string }): Promise<SessionResponse> {
    return this.client.post('/api/auth/login', data);
  }

  session(): Promise<SessionResponse> {
    return this.client.get('/api/auth/session');
  }

  signup(data: SignupRequest): Promise<SignupResponse> {
    return this.client.post('/api/signup', data);
  }

  logoutUrl(): string {
    return `${this.client.baseUrl}/api/auth/logout`;
  }
}

// ── Organisation ──

class OrgAPI {
  constructor(private client: SupaProxyClient) {}

  get(options?: RequestOptions): Promise<OrgResponse> {
    return this.client.get('/api/org', options);
  }

  update(name: string): Promise<StatusResponse> {
    return this.client.put('/api/org', { name });
  }

  settings(options?: RequestOptions): Promise<OrgSettingsResponse> {
    return this.client.get('/api/org/settings', options);
  }

  updateSetting(key: string, value: string): Promise<StatusResponse> {
    return this.client.put(`/api/org/settings/${key}`, { value });
  }

  testSlack(botToken: string): Promise<{ bot_name: string; team: string } | ErrorResponse> {
    return this.client.post('/api/org/integrations/slack/test', { bot_token: botToken });
  }

  testIntegration(type: string, credentials: Record<string, string>): Promise<Record<string, string> & { error?: string }> {
    return this.client.post('/api/org/integrations/test', { type, credentials });
  }

  users(params?: { search?: string; limit?: number; page?: number }, options?: RequestOptions): Promise<OrgUsersResponse> {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.page != null) qs.set('page', String(params.page));
    const q = qs.toString();
    return this.client.get(`/api/org/users${q ? `?${q}` : ''}`, options);
  }

  models(options?: RequestOptions): Promise<ModelsResponse> {
    return this.client.get('/api/models', options);
  }

  testProvider(data: { type: string; api_key: string }): Promise<ProviderTestResponse> {
    return this.client.post('/api/org/providers/test', data);
  }

  listProviderModels(data: { type: string; api_key: string }): Promise<ProviderModelsResponse> {
    return this.client.post('/api/org/providers/models', data);
  }
}

// ── Workspaces ──

class WorkspacesAPI {
  constructor(private client: SupaProxyClient) {}

  list(): Promise<WorkspaceListResponse> {
    return this.client.get('/api/workspaces');
  }

  summary(id: string, options?: RequestOptions): Promise<WorkspaceSummaryResponse> {
    return this.client.get(`/api/workspaces/${id}/summary`, options);
  }

  detail(id: string, options?: RequestOptions): Promise<WorkspaceDetailResponse> {
    return this.client.get(`/api/workspaces/${id}`, options);
  }

  create(data: { name: string; model: string; team_id?: string; team_name?: string; system_prompt?: string }): Promise<{ id: string; name: string }> {
    return this.client.post('/api/workspaces', data);
  }

  update(id: string, data: { name?: string; model?: string; provider_type?: string | null; system_prompt?: string; cold_timeout_minutes?: number; close_timeout_minutes?: number }): Promise<StatusResponse> {
    return this.client.put(`/api/workspaces/${id}`, data);
  }

  dashboard(id: string, options?: RequestOptions): Promise<DashboardResponse> {
    return this.client.get(`/api/workspaces/${id}/dashboard`, options);
  }

  connections(id: string, options?: RequestOptions): Promise<ConnectionsResponse> {
    return this.client.get(`/api/workspaces/${id}/connections`, options);
  }

  consumers(id: string, options?: RequestOptions): Promise<ConsumersResponse> {
    return this.client.get(`/api/workspaces/${id}/consumers`, options);
  }

  knowledge(id: string, options?: RequestOptions): Promise<KnowledgeResponse> {
    return this.client.get(`/api/workspaces/${id}/knowledge`, options);
  }

  createKnowledgeSource(id: string, data: CreateKnowledgeSourceRequest): Promise<CreateKnowledgeSourceResponse> {
    return this.client.post(`/api/workspaces/${id}/knowledge`, data);
  }

  deleteKnowledgeSource(workspaceId: string, sourceId: string): Promise<{ deleted: boolean }> {
    return this.client.delete(`/api/workspaces/${workspaceId}/knowledge/${sourceId}`);
  }

  availableKnowledge(workspaceId: string, options?: RequestOptions): Promise<AvailableKnowledgeResponse> {
    return this.client.get(`/api/workspaces/${workspaceId}/knowledge/available`, options);
  }

  enableKnowledgeSource(workspaceId: string, pluginId: string): Promise<EnableKnowledgeSourceResponse> {
    return this.client.post(`/api/workspaces/${workspaceId}/knowledge/${pluginId}/enable`);
  }

  disableKnowledgeSource(workspaceId: string, pluginId: string): Promise<StatusResponse> {
    return this.client.post(`/api/workspaces/${workspaceId}/knowledge/${pluginId}/disable`);
  }

  delete(id: string): Promise<StatusResponse> {
    return this.client.delete(`/api/workspaces/${id}`);
  }

  publish(id: string): Promise<StatusResponse> {
    return this.client.post(`/api/workspaces/${id}/publish`);
  }

  unpublish(id: string): Promise<StatusResponse> {
    return this.client.post(`/api/workspaces/${id}/unpublish`);
  }

  guardrails(id: string, options?: RequestOptions): Promise<WorkspaceGuardrailsResponse> {
    return this.client.get(`/api/workspaces/${id}/guardrails`, options);
  }

  enableGuardrail(workspaceId: string, guardrailId: string): Promise<StatusResponse> {
    return this.client.post(`/api/workspaces/${workspaceId}/guardrails/${guardrailId}/enable`);
  }

  disableGuardrail(workspaceId: string, guardrailId: string): Promise<StatusResponse> {
    return this.client.post(`/api/workspaces/${workspaceId}/guardrails/${guardrailId}/disable`);
  }

  updateGuardrailEventStatus(workspaceId: string, eventId: string, status: string): Promise<StatusResponse> {
    return this.client.patch(`/api/workspaces/${workspaceId}/guardrail-events/${eventId}/status`, { status });
  }

  activity(id: string, params?: { limit?: number; offset?: number }, options?: RequestOptions): Promise<ActivityResponse> {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.offset) qs.set('offset', String(params.offset));
    const q = qs.toString();
    return this.client.get(`/api/workspaces/${id}/activity${q ? `?${q}` : ''}`, options);
  }

  compliance(id: string, options?: RequestOptions): Promise<ComplianceResponse> {
    return this.client.get(`/api/workspaces/${id}/compliance`, options);
  }

  query(id: string, data: QueryRequest): Promise<QueryResponse> {
    return this.client.post(`/api/workspaces/${id}/query`, data);
  }

  apiKeys = {
    list: (workspaceId: string, options?: RequestOptions): Promise<ApiKeyListResponse> =>
      this.client.get(`/api/workspaces/${workspaceId}/api-keys`, options),

    create: (workspaceId: string, data: { label: string; test?: boolean }): Promise<CreateApiKeyResponse> =>
      this.client.post(`/api/workspaces/${workspaceId}/api-keys`, data),

    revoke: (workspaceId: string, keyId: string): Promise<StatusResponse> =>
      this.client.delete(`/api/workspaces/${workspaceId}/api-keys/${keyId}`),
  };
}

// ── Connections ──

class ConnectionsAPI {
  constructor(private client: SupaProxyClient) {}

  delete(connectionId: string): Promise<StatusResponse> {
    return this.client.delete(`/api/connections/${connectionId}`);
  }
}

// ── Conversations ──

class ConversationsAPI {
  constructor(private client: SupaProxyClient) {}

  list(workspaceId: string, params?: { limit?: number; offset?: number; status?: string; category?: string; resolution?: string; consumer?: string }, options?: RequestOptions): Promise<ConversationListResponse> {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.offset) qs.set('offset', String(params.offset));
    if (params?.status) qs.set('status', params.status);
    if (params?.category) qs.set('category', params.category);
    if (params?.resolution) qs.set('resolution', params.resolution);
    if (params?.consumer) qs.set('consumer', params.consumer);
    const q = qs.toString();
    return this.client.get(`/api/workspaces/${workspaceId}/conversations${q ? `?${q}` : ''}`, options);
  }

  get(workspaceId: string, conversationId: string, options?: RequestOptions): Promise<ConversationDetailResponse> {
    return this.client.get(`/api/workspaces/${workspaceId}/conversations/${conversationId}`, options);
  }

  close(workspaceId: string, conversationId: string): Promise<CloseConversationResponse> {
    return this.client.post(`/api/workspaces/${workspaceId}/conversations/${conversationId}/close`);
  }
}

// ── Connectors ──

class ConnectorsAPI {
  constructor(private client: SupaProxyClient) {}

  testMcp(data: { transport: string; url?: string; command?: string; args?: string[]; headers?: Record<string, string> }): Promise<McpTestResponse> {
    return this.client.post('/api/connectors/mcp/test', data);
  }

  addMcp(data: { workspace_id: string; name: string; transport: string; url?: string; command?: string; args?: string[]; headers?: Record<string, string>; env?: Record<string, string> }): Promise<SaveConnectionResponse> {
    return this.client.post('/api/connectors/mcp', data);
  }

  addConsumerChannel(data: { workspace_id: string; consumer_type: string; config: Record<string, string> }): Promise<StatusResponse> {
    return this.client.post('/api/connectors/consumer/channel', data);
  }

  connectConsumer(data: { workspace_id: string; consumer_type: string; credentials: Record<string, string> }): Promise<StatusResponse> {
    return this.client.post('/api/connectors/consumer', data);
  }

  /** @deprecated Use addConsumerChannel instead */
  addSlackChannel(data: { workspace_id: string; channel_id: string; channel_name?: string }): Promise<StatusResponse> {
    return this.client.post('/api/connectors/slack-channel', data);
  }

  /** @deprecated Use connectConsumer instead */
  connectSlack(data: { workspace_id: string; bot_token: string; app_token: string; channel_id?: string }): Promise<StatusResponse> {
    return this.client.post('/api/connectors/slack', data);
  }
}

// ── Queues ──

class QueuesAPI {
  constructor(private client: SupaProxyClient) {}

  list(): Promise<QueuesResponse> {
    return this.client.get('/api/org/queues');
  }

  failed(name: string): Promise<{ jobs: Array<{ id: string | number; failedReason: string; attemptsMade: number; data?: { conversationId?: string } }> }> {
    return this.client.get(`/api/org/queues/${name}/failed`);
  }

  retryAll(name: string): Promise<StatusResponse & { retried?: number }> {
    return this.client.post(`/api/org/queues/${name}/retry-all`);
  }

  drain(name: string): Promise<StatusResponse> {
    return this.client.post(`/api/org/queues/${name}/drain`);
  }
}

// ── Providers ──

class ProvidersAPI {
  constructor(private client: SupaProxyClient) {}

  types(options?: RequestOptions): Promise<ProviderTypesResponse> {
    return this.client.get('/api/providers/types', options);
  }
}

// ── Consumer Types ──

class ConsumerTypesAPI {
  constructor(private client: SupaProxyClient) {}

  list(options?: RequestOptions): Promise<ConsumerTypesResponse> {
    return this.client.get('/api/consumers/types', options);
  }
}

// ── Prompts ──

class PromptsAPI {
  constructor(private client: SupaProxyClient) {}

  list(options?: RequestOptions): Promise<PromptListResponse> {
    return this.client.get('/api/prompts', options);
  }

  versions(type: PromptType, params?: { scope?: PromptScope; scope_id?: string }, options?: RequestOptions): Promise<PromptVersionsResponse> {
    const qs = new URLSearchParams();
    if (params?.scope) qs.set('scope', params.scope);
    if (params?.scope_id) qs.set('scope_id', params.scope_id);
    const q = qs.toString();
    return this.client.get(`/api/prompts/${type}/versions${q ? `?${q}` : ''}`, options);
  }

  save(type: PromptType, data: SavePromptRequest): Promise<SavePromptResponse> {
    return this.client.put(`/api/prompts/${type}`, data);
  }

  activate(type: PromptType, id: string, params?: { scope?: PromptScope; scope_id?: string }): Promise<ActivatePromptResponse> {
    const qs = new URLSearchParams();
    if (params?.scope) qs.set('scope', params.scope);
    if (params?.scope_id) qs.set('scope_id', params.scope_id);
    const q = qs.toString();
    return this.client.post(`/api/prompts/${type}/activate/${id}${q ? `?${q}` : ''}`);
  }
}

// ── Guardrail Policies ──

class PoliciesAPI {
  constructor(private client: SupaProxyClient) {}

  list(options?: RequestOptions): Promise<GuardrailPolicyListResponse> {
    return this.client.get('/api/guardrail-policies', options);
  }

  setEnforcement(pluginId: string, enforcement: PolicyEnforcement): Promise<StatusResponse> {
    return this.client.put(`/api/guardrail-policies/${pluginId}`, { enforcement });
  }

  compliance(pluginId: string, options?: RequestOptions): Promise<PolicyComplianceResponse> {
    return this.client.get(`/api/guardrail-policies/${pluginId}/compliance`, options);
  }

  createOverride(pluginId: string, data: { workspace_id: string; justification: string }): Promise<StatusResponse> {
    return this.client.post(`/api/guardrail-policies/${pluginId}/override`, data);
  }

  securityOverview(params?: { days?: number }, options?: RequestOptions): Promise<SecurityOverviewResponse> {
    const qs = new URLSearchParams();
    if (params?.days) qs.set('days', String(params.days));
    const q = qs.toString();
    return this.client.get(`/api/security-overview${q ? `?${q}` : ''}`, options);
  }

  listInstalled(options?: RequestOptions): Promise<InstalledGuardrailListResponse> {
    return this.client.get('/api/installed-guardrails', options);
  }

  install(pluginId: string): Promise<InstallGuardrailResponse> {
    return this.client.post('/api/installed-guardrails', { plugin_id: pluginId });
  }

  uninstall(pluginId: string): Promise<StatusResponse> {
    return this.client.delete(`/api/installed-guardrails/${pluginId}`);
  }
}

// ── Integrations ──

class IntegrationsAPI {
  constructor(private client: SupaProxyClient) {}

  list(options?: RequestOptions): Promise<IntegrationListResponse> {
    return this.client.get('/api/integrations', options);
  }

  activate(type: string): Promise<StatusResponse> {
    return this.client.post(`/api/integrations/${type}/activate`);
  }

  deactivate(type: string): Promise<StatusResponse> {
    return this.client.post(`/api/integrations/${type}/deactivate`);
  }

  entryPoints(options?: RequestOptions): Promise<EntryPointListResponse> {
    return this.client.get('/api/entry-points', options);
  }

  createEntryPoint(data: { type: string; channel_id: string; channel_name?: string; direct?: boolean; direct_workspace_id?: string }): Promise<StatusResponse> {
    return this.client.post('/api/entry-points', data);
  }

  updateEntryPoint(id: string, data: { channel_name?: string; direct?: boolean; direct_workspace_id?: string | null }): Promise<StatusResponse> {
    return this.client.put(`/api/entry-points/${id}`, data);
  }

  deleteEntryPoint(id: string): Promise<StatusResponse> {
    return this.client.delete(`/api/entry-points/${id}`);
  }
}

// ── Marketplace ──

class MarketplaceAPI {
  constructor(private client: SupaProxyClient) {}

  browse(search?: string, options?: RequestOptions): Promise<MarketplaceListResponse> {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.client.get(`/api/marketplace${qs}`, options);
  }

  get(pluginId: string, options?: RequestOptions): Promise<MarketplacePlugin> {
    return this.client.get(`/api/marketplace/${pluginId}`, options);
  }

  install(pluginId: string): Promise<InstallGuardrailResponse> {
    return this.client.post('/api/installed-guardrails', { plugin_id: pluginId });
  }

  uninstall(pluginId: string): Promise<StatusResponse> {
    return this.client.delete(`/api/installed-guardrails/${pluginId}`);
  }

  listInstalled(options?: RequestOptions): Promise<InstalledGuardrailListResponse> {
    return this.client.get('/api/installed-guardrails', options);
  }

  upgrade(pluginId: string): Promise<StatusResponse> {
    return this.client.post(`/api/installed-guardrails/${pluginId}/upgrade`);
  }
}

// ── Knowledge sync ──

class KnowledgeAPI {
  constructor(private client: SupaProxyClient) {}

  listSources(options?: RequestOptions): Promise<KnowledgeSourcesResponse> {
    return this.client.get('/api/knowledge/sources', options);
  }

  browse(pluginId: string, options?: RequestOptions): Promise<KnowledgeBrowseResponse> {
    return this.client.get(`/api/knowledge/sources/${pluginId}/browse`, options);
  }

  saveSyncConfig(pluginId: string, data: { selectedUnits: string[]; frequency: string; policy?: { syncRoot: string; exceptFor: string[] } }): Promise<KnowledgeSyncConfigResponse> {
    return this.client.put(`/api/knowledge/sources/${pluginId}/sync-config`, data);
  }

  syncStatus(pluginId: string, options?: RequestOptions): Promise<KnowledgeSyncStatusResponse> {
    return this.client.get(`/api/knowledge/sources/${pluginId}/sync-status`, options);
  }

  triggerSync(pluginId: string): Promise<StatusResponse> {
    return this.client.post(`/api/knowledge/sources/${pluginId}/sync`);
  }

  syncHistory(pluginId: string, page?: number, options?: RequestOptions): Promise<SyncHistoryResponse> {
    const qs = page ? `?page=${page}` : '';
    return this.client.get(`/api/knowledge/sources/${pluginId}/history${qs}`, options);
  }

  health(options?: RequestOptions): Promise<KnowledgeHealthResponse> {
    return this.client.get('/api/knowledge/health', options);
  }
}

// ── Route ──

class OAuthAPI {
  constructor(private client: SupaProxyClient) {}

  disconnect(pluginId: string): Promise<{ disconnected: boolean }> {
    return this.client.delete(`/api/oauth/${pluginId}`);
  }

  status(pluginId: string, options?: RequestOptions): Promise<{ connected: boolean; site: string | null }> {
    return this.client.get(`/api/oauth/${pluginId}/status`, options);
  }

  refresh(pluginId: string): Promise<{ refreshed: boolean }> {
    return this.client.post(`/api/oauth/${pluginId}/refresh`);
  }
}

class RouteAPI {
  constructor(private client: SupaProxyClient) {}

  send(data: RouteRequest, options?: RequestOptions): Promise<RouteResponse> {
    return this.client.post('/api/route', data, options);
  }
}

// ── Admin (cloud-only) ──

class AdminAPI {
  constructor(private client: SupaProxyClient) {}

  listPlugins(options?: RequestOptions): Promise<AdminPluginListResponse> {
    return this.client.get('/api/admin/plugins', options);
  }

  uploadPlugin(formData: FormData): Promise<AdminPluginUploadResponse> {
    return this.client.requestFormData('POST', '/api/admin/plugins', formData);
  }

  deprecatePlugin(pluginId: string): Promise<StatusResponse> {
    return this.client.post(`/api/admin/plugins/${pluginId}/deprecate`);
  }

  rejectPlugin(pluginId: string): Promise<StatusResponse> {
    return this.client.post(`/api/admin/plugins/${pluginId}/reject`);
  }
}

// ── Cloud public ──

class CloudAPI {
  constructor(private client: SupaProxyClient) {}

  demoRequest(data: DemoRequestData): Promise<StatusResponse> {
    return this.client.post('/api/demo-request', data);
  }

  contact(data: ContactRequestData): Promise<StatusResponse> {
    return this.client.post('/api/contact', data);
  }
}
