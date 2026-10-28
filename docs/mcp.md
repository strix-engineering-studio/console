# Remote MCP Access

Strix Lead exposes a stateless Streamable HTTP MCP (Model Context Protocol) endpoint at `/api/mcp`. It accepts MCP Streamable HTTP `GET`, `POST`, and `DELETE` requests.

> [!WARNING]
> **Security Impact: Publicly Accessible Endpoint**
>
> All authentication mechanisms—including OAuth 2.1 PKCE flows, bearer access/refresh tokens, scope enforcement (`strix:read`, `strix:write`), and `X-MCP-API-Key` validation—have been completely removed from this integration.
>
> Consequently, **the `/api/mcp` endpoint is open and publicly accessible** to any network client capable of reaching host routing. Any connecting client can inspect CRM records, create or update entities, and trigger email sending tools without providing credentials.
>
> **Recommended Mitigations in Production:**
> - Deploy behind a private network, VPN, or tailnet (e.g. Tailscale / WireGuard).
> - Restrict access via reverse proxy authentication (mTLS, HTTP Basic/OIDC gateway, or Cloudflare Access).
> - Enforce strict IP allowlisting or Web Application Firewall (WAF) ingress rules.

---

## Architecture & Transport

The MCP server is mounted directly at:
```
/api/mcp
```
Requests are processed using `@modelcontextprotocol/sdk` via the `WebStandardStreamableHTTPServerTransport` with JSON response streaming enabled. No authorization headers or API keys are required.

### Client Connection Configuration

Configure your MCP host client (such as Claude Desktop, Cursor, or custom agents) using the direct endpoint URL:

```json
{
  "mcpServers": {
    "strix-lead": {
      "url": "http://localhost:3000/api/mcp"
    }
  }
}
```

---

## Preserved Capabilities

### 1. Rate Limiting
Global request rate limiting is enforced per source IP using the `x-forwarded-for` header (default: 120 requests per minute per IP). Exceeding this rate returns an HTTP `429 Too Many Requests` response with a `Retry-After: 60` header.

### 2. Idempotency Support
For mutation tools that support it (`create_lead`, `create_organization`, `create_person`, `send_email`), clients may pass an optional `idempotencyKey` string.
- The request payload is hashed (SHA-256) and tracked in MongoDB via the `McpIdempotency` model.
- Retries with the same `idempotencyKey` return the cached execution result rather than re-creating duplicate entities.
- Concurrent requests with identical keys are guarded against race conditions.

### 3. Audit Logging
Every state-changing operation executed through MCP writes an audit entry to the central Strix Lead activity timeline (`Activity` table with type `NOTE`).
- The activity log records the tool name, action type, affected entity, entity ID, and timestamp.
- The identity tag indicates unauthenticated MCP execution: `authenticationType=none`.

---

## Registered MCP Tools

### Leads
- `list_leads`: List or search leads. Accepts optional `id` (to retrieve a single record), `query` (search term), and `limit` (max 50, default 20).
- `create_lead`: Create a lead matching the Zod lead schema. Supports optional `idempotencyKey`.
- `update_lead`: Update an existing lead by `id`.

### Organizations
- `list_organizations`: List or search organizations. Accepts optional `id`, `query`, and `limit`.
- `create_organization`: Create an organization record. Supports optional `idempotencyKey`.
- `update_organization`: Update an organization by `id`.

### People
- `list_people`: List or search people. Accepts optional `id`, `query`, and `limit`.
- `create_person`: Create a person record. Supports optional `idempotencyKey`.
- `update_person`: Update a person record by `id`.

### Mail
- `send_email`: Send an email through the configured SMTP server. Accepts `to`, `cc`, `bcc`, `replyTo`, `subject`, `text`, `html`, `attachments`, `headers`, and optional `idempotencyKey`.
