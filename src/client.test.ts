import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SupaProxyClient, SupaProxyError } from './client.js'

// ── Mock fetch ──

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function jsonResponse(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as Response
}

beforeEach(() => {
  mockFetch.mockReset()
})

// ── Client construction ──

describe('SupaProxyClient construction', () => {
  it('accepts a string URL', () => {
    const client = new SupaProxyClient('http://localhost:3001')
    expect(client).toBeInstanceOf(SupaProxyClient)
  })

  it('accepts an options object', () => {
    const client = new SupaProxyClient({
      baseUrl: 'http://localhost:3001',
      credentials: 'same-origin',
      headers: { 'X-Custom': 'value' },
    })
    expect(client).toBeInstanceOf(SupaProxyClient)
  })

  it('strips trailing slash from baseUrl', async () => {
    const client = new SupaProxyClient('http://localhost:3001/')
    mockFetch.mockResolvedValueOnce(jsonResponse({ status: 'ok' }))
    await client.health()
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/health',
      expect.any(Object),
    )
  })

  it('initialises all API namespaces', () => {
    const client = new SupaProxyClient('http://localhost:3001')
    expect(client.auth).toBeDefined()
    expect(client.org).toBeDefined()
    expect(client.workspaces).toBeDefined()
    expect(client.connections).toBeDefined()
    expect(client.conversations).toBeDefined()
    expect(client.connectors).toBeDefined()
    expect(client.queues).toBeDefined()
    expect(client.providers).toBeDefined()
    expect(client.consumerTypes).toBeDefined()
  })
})

// ── Request method ──

describe('SupaProxyClient.request', () => {
  it('makes GET requests without body', async () => {
    const client = new SupaProxyClient('http://localhost:3001')
    mockFetch.mockResolvedValueOnce(jsonResponse({ status: 'ok' }))
    await client.get('/api/test')
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('http://localhost:3001/api/test')
    expect(init.method).toBe('GET')
    expect(init.body).toBeUndefined()
  })

  it('makes POST requests with JSON body', async () => {
    const client = new SupaProxyClient('http://localhost:3001')
    mockFetch.mockResolvedValueOnce(jsonResponse({ status: 'ok' }))
    await client.post('/api/test', { key: 'value' })
    const [, init] = mockFetch.mock.calls[0]
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify({ key: 'value' }))
    expect(init.headers['Content-Type']).toBe('application/json')
  })

  it('makes PUT requests', async () => {
    const client = new SupaProxyClient('http://localhost:3001')
    mockFetch.mockResolvedValueOnce(jsonResponse({ status: 'ok' }))
    await client.put('/api/test', { name: 'updated' })
    const [, init] = mockFetch.mock.calls[0]
    expect(init.method).toBe('PUT')
  })

  it('makes DELETE requests', async () => {
    const client = new SupaProxyClient('http://localhost:3001')
    mockFetch.mockResolvedValueOnce(jsonResponse({ status: 'ok' }))
    await client.delete('/api/test')
    const [, init] = mockFetch.mock.calls[0]
    expect(init.method).toBe('DELETE')
  })

  it('includes credentials by default', async () => {
    const client = new SupaProxyClient('http://localhost:3001')
    mockFetch.mockResolvedValueOnce(jsonResponse({}))
    await client.get('/api/test')
    const [, init] = mockFetch.mock.calls[0]
    expect(init.credentials).toBe('include')
  })

  it('uses custom credentials when provided', async () => {
    const client = new SupaProxyClient({ baseUrl: 'http://localhost:3001', credentials: 'omit' })
    mockFetch.mockResolvedValueOnce(jsonResponse({}))
    await client.get('/api/test')
    const [, init] = mockFetch.mock.calls[0]
    expect(init.credentials).toBe('omit')
  })

  it('includes custom headers', async () => {
    const client = new SupaProxyClient({ baseUrl: 'http://localhost:3001', headers: { 'Authorization': 'Bearer tok' } })
    mockFetch.mockResolvedValueOnce(jsonResponse({}))
    await client.get('/api/test')
    const [, init] = mockFetch.mock.calls[0]
    expect(init.headers['Authorization']).toBe('Bearer tok')
  })

  it('returns empty object for 204 responses', async () => {
    const client = new SupaProxyClient('http://localhost:3001')
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204, json: async () => null } as Response)
    const result = await client.get('/api/test')
    expect(result).toEqual({})
  })

  it('passes AbortSignal when provided', async () => {
    const client = new SupaProxyClient('http://localhost:3001')
    const controller = new AbortController()
    mockFetch.mockResolvedValueOnce(jsonResponse({}))
    await client.get('/api/test', { signal: controller.signal })
    const [, init] = mockFetch.mock.calls[0]
    expect(init.signal).toBe(controller.signal)
  })
})

// ── Error handling ──

describe('SupaProxyError', () => {
  it('throws SupaProxyError on non-ok response', async () => {
    const client = new SupaProxyClient('http://localhost:3001')
    mockFetch.mockResolvedValueOnce(jsonResponse({ error: 'Unauthorized' }, 401))
    await expect(client.get('/api/test')).rejects.toThrow(SupaProxyError)
  })

  it('includes status code', async () => {
    const client = new SupaProxyClient('http://localhost:3001')
    mockFetch.mockResolvedValueOnce(jsonResponse({ error: 'Not Found' }, 404))
    try {
      await client.get('/api/test')
    } catch (err) {
      expect(err).toBeInstanceOf(SupaProxyError)
      expect((err as SupaProxyError).status).toBe(404)
      expect((err as SupaProxyError).message).toBe('Not Found')
    }
  })

  it('falls back to HTTP status when error body is not parseable', async () => {
    const client = new SupaProxyClient('http://localhost:3001')
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => { throw new Error('bad json') },
    } as unknown as Response)
    try {
      await client.get('/api/test')
    } catch (err) {
      expect((err as SupaProxyError).message).toBe('HTTP 500')
    }
  })

  it('SupaProxyError extends Error', () => {
    const err = new SupaProxyError(400, 'Bad Request')
    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe('SupaProxyError')
    expect(err.status).toBe(400)
    expect(err.message).toBe('Bad Request')
  })
})

// ── API method signatures ──

describe('Auth API', () => {
  const client = new SupaProxyClient('http://localhost:3001')

  it('login calls POST /api/auth/login', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ user: null }))
    await client.auth.login({ email: 'a@b.com', password: 'pass' })
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/auth/login', expect.objectContaining({ method: 'POST' }))
  })

  it('session calls GET /api/auth/session', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ user: null }))
    await client.auth.session()
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/auth/session', expect.objectContaining({ method: 'GET' }))
  })

  it('signup calls POST /api/signup', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ status: 'ok' }))
    await client.auth.signup({ org_name: 'Test', admin_name: 'Admin', admin_email: 'a@b.com', admin_password: 'pass', workspace_name: 'ws', team_name: 'team' })
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/signup', expect.objectContaining({ method: 'POST' }))
  })

  it('logoutUrl returns the correct URL string', () => {
    expect(client.auth.logoutUrl()).toBe('http://localhost:3001/api/auth/logout')
  })
})

describe('Org API', () => {
  const client = new SupaProxyClient('http://localhost:3001')

  it('get calls GET /api/org', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ org: {} }))
    await client.org.get()
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/org', expect.objectContaining({ method: 'GET' }))
  })

  it('update calls PUT /api/org', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ status: 'ok' }))
    await client.org.update('New Name')
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/org', expect.objectContaining({ method: 'PUT' }))
  })

  it('settings calls GET /api/org/settings', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ settings: {} }))
    await client.org.settings()
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/org/settings', expect.objectContaining({ method: 'GET' }))
  })

  it('updateSetting calls PUT /api/org/settings/:key', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ status: 'ok' }))
    await client.org.updateSetting('api_key', 'value')
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/org/settings/api_key', expect.objectContaining({ method: 'PUT' }))
  })

  it('users calls GET /api/org/users', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ users: [] }))
    await client.org.users()
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/org/users', expect.objectContaining({ method: 'GET' }))
  })

  it('models calls GET /api/models', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ models: [] }))
    await client.org.models()
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/models', expect.objectContaining({ method: 'GET' }))
  })
})

describe('Workspaces API', () => {
  const client = new SupaProxyClient('http://localhost:3001')

  it('list calls GET /api/workspaces', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ workspaces: [] }))
    await client.workspaces.list()
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/workspaces', expect.objectContaining({ method: 'GET' }))
  })

  it('detail calls GET /api/workspaces/:id', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ workspace: {} }))
    await client.workspaces.detail('ws-1')
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/workspaces/ws-1', expect.objectContaining({ method: 'GET' }))
  })

  it('create calls POST /api/workspaces', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ id: 'ws-1', name: 'New' }))
    await client.workspaces.create({ name: 'New', model: 'claude-3' })
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/workspaces', expect.objectContaining({ method: 'POST' }))
  })

  it('query calls POST /api/workspaces/:id/query', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ answer: 'response' }))
    await client.workspaces.query('ws-1', { query: 'Hello' })
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/workspaces/ws-1/query', expect.objectContaining({ method: 'POST' }))
  })
})

describe('Conversations API', () => {
  const client = new SupaProxyClient('http://localhost:3001')

  it('list builds query string from params', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ conversations: [], total: 0, filters: {} }))
    await client.conversations.list('ws-1', { limit: 10, offset: 5, status: 'open' })
    const url = mockFetch.mock.calls[0][0]
    expect(url).toContain('limit=10')
    expect(url).toContain('offset=5')
    expect(url).toContain('status=open')
  })

  it('list works without params', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ conversations: [], total: 0, filters: {} }))
    await client.conversations.list('ws-1')
    const url = mockFetch.mock.calls[0][0]
    expect(url).toBe('http://localhost:3001/api/workspaces/ws-1/conversations')
  })

  it('get calls correct URL', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ conversation: {} }))
    await client.conversations.get('ws-1', 'conv-1')
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/workspaces/ws-1/conversations/conv-1', expect.any(Object))
  })

  it('close calls POST', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ status: 'closed' }))
    await client.conversations.close('ws-1', 'conv-1')
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/workspaces/ws-1/conversations/conv-1/close',
      expect.objectContaining({ method: 'POST' }),
    )
  })
})

describe('Connectors API', () => {
  const client = new SupaProxyClient('http://localhost:3001')

  it('testMcp calls POST /api/connectors/mcp/test', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ ok: true }))
    await client.connectors.testMcp({ transport: 'http', url: 'http://test' })
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/connectors/mcp/test', expect.objectContaining({ method: 'POST' }))
  })

  it('addMcp calls POST /api/connectors/mcp', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ status: 'saved' }))
    await client.connectors.addMcp({ workspace_id: 'ws', name: 'Test', transport: 'http', url: 'http://test' })
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/connectors/mcp', expect.objectContaining({ method: 'POST' }))
  })
})

describe('Queues API', () => {
  const client = new SupaProxyClient('http://localhost:3001')

  it('list calls GET /api/org/queues', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ queues: [] }))
    await client.queues.list()
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/org/queues', expect.objectContaining({ method: 'GET' }))
  })
})

describe('Providers API', () => {
  const client = new SupaProxyClient('http://localhost:3001')

  it('types calls GET /api/providers/types', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ providers: [] }))
    await client.providers.types()
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/providers/types', expect.objectContaining({ method: 'GET' }))
  })
})

describe('ConsumerTypes API', () => {
  const client = new SupaProxyClient('http://localhost:3001')

  it('list calls GET /api/consumers/types', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ consumers: [] }))
    await client.consumerTypes.list()
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/consumers/types', expect.objectContaining({ method: 'GET' }))
  })
})

describe('Health', () => {
  it('calls GET /health', async () => {
    const client = new SupaProxyClient('http://localhost:3001')
    mockFetch.mockResolvedValueOnce(jsonResponse({ status: 'ok', setup_complete: true, workspaces: 2, ai_configured: true, connections: 3 }))
    const result = await client.health()
    expect(result.status).toBe('ok')
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/health', expect.objectContaining({ method: 'GET' }))
  })
})
