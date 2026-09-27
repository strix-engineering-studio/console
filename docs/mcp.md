# Remote MCP access

Strix Lead exposes a stateless Streamable HTTP MCP endpoint at `https://<your-host>/api/mcp`. It accepts MCP Streamable HTTP `GET`, `POST`, and `DELETE` requests. Use HTTPS for remote connections. Set `MCP_PUBLIC_URL` to the canonical public MCP URL in production so OAuth metadata and issuer checks use the same origin as the deployed server.

## ChatGPT OAuth

ChatGPT connections use OAuth 2.1 authorization code with PKCE (`S256`). Register the MCP endpoint in ChatGPT Developer Mode; the protected-resource metadata points to the Strix Lead authorization server. After signing in to Strix Lead as an administrator, approve the requested access. Strix Lead issues short-lived bearer access tokens and rotating refresh tokens. OAuth permissions are `strix:read` and `strix:write`; read access covers searches and lookups, while write access covers create, update, and delete tools. The current app has one administrator identity and a shared CRM dataset, so an approved connection operates on that shared dataset as the administrator.

The OAuth endpoints are `/oauth/authorize`, `/oauth/token`, `/oauth/register`, and `/oauth/revoke`. Discovery is published at `/.well-known/oauth-authorization-server` and `/.well-known/oauth-protected-resource/api/mcp`. Dynamic client registration accepts HTTPS ChatGPT callback URLs and loopback callback URLs for development. OAuth and API-key authentication are both accepted by `/api/mcp` as separate methods: OAuth uses `Authorization: Bearer <access-token>`; API keys use `X-MCP-API-Key: <api-key>`.

For local development, `MCP_PUBLIC_URL` may be omitted and the app derives the current host at `/api/mcp` (normally `http://localhost:3000/api/mcp`). For an HTTPS development tunnel, set `MCP_PUBLIC_URL` to the tunnel URL. Production requires this setting. ChatGPT cannot reach localhost; use an HTTPS development tunnel or a deployed HTTPS host to connect from ChatGPT.

## API keys

While signed in as an administrator, create a key in Settings → MCP API keys or call `POST /api/mcp/keys` with JSON such as `{ "name": "Claude Production", "scopes": ["strix:read"], "expiresAt": "2027-01-01T00:00:00Z" }`. Supported scopes are `strix:read` and `strix:write`; at least one is required. Expiration is optional. New keys use the `strix_mcp_live_` prefix. The raw key is returned once; only its SHA-256 hash, display prefix, scopes, and metadata are stored. `GET /api/mcp/keys` lists key metadata without secrets, last-used time, and calculated status. Keys created before scopes were added remain read-only until replaced. Revoke a key with `DELETE /api/mcp/keys/<id>`; revoked records remain for audit history. These management routes require an administrator session. Send MCP API keys in the `X-MCP-API-Key` header; management routes are not exposed as MCP tools.

## Tools

- Leads: `search_leads`, `get_lead`, `create_lead`, `update_lead`, `delete_lead`
- Organizations: `search_organizations`, `get_organization`, `create_organization`, `update_organization`, `delete_organization`
- People: `search_people`, `get_person`, `create_person`, `update_person`, `delete_person`
- Research runs: `search_research`, `get_research`, `create_research`, `update_research`, `delete_research`
- Activity: `list_activities`, `get_activity`

Search tools accept an optional `q`; get, update, and delete tools accept `id`. Create and update inputs follow the corresponding feature Zod schemas. Create tools also accept optional `idempotencyKey` for safe retries. MCP mutations write an activity record identifying the authentication type, API key ID and integration name (or OAuth client ID), tool, action, entity, entity ID, and timestamp. Rate limiting is 120 requests per minute per source IP and 300 requests per minute per authenticated integration, tracked per running application instance. Multi-instance deployments need a shared limiter to enforce those limits across instances.

## Connection example

```json
{
  "mcpServers": {
    "strix-lead-api-key": {
      "url": "https://<your-host>/api/mcp",
      "headers": { "X-MCP-API-Key": "<API_KEY>" }
    }
  }
}
```

This static header example is for MCP clients that support API keys. ChatGPT uses the OAuth connection flow above and does not accept a custom API key in its plugin connection. API-key requests do not require OAuth configuration. After adding the Prisma models, run `npm run prisma:generate` and deploy the MongoDB schema with `npm run prisma:push` before using OAuth or creating API keys.
