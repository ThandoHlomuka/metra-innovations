# Metra Innovations MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server that lets
**AI agents** (Claude, Claude Desktop, ChatGPT, Cursor, VS Code, etc.) interact with
**Metra Innovations** — answering questions about the company, submitting contact
queries on a visitor's behalf, and handing conversations off to **WhatsApp**.

Built by **Thando Hlomuka**. Proprietary — all rights reserved (see `LICENSE`).

---

## What the agent can do

| Tool | Purpose |
| --- | --- |
| `get_company_info` | Name, tagline, founded, location, service areas, hours |
| `get_services` | Full service catalog (web, ecommerce, mobile, software, cloud, consulting) |
| `get_portfolio` | Case-study projects (optionally by category) |
| `get_contact_details` | Phone, email, WhatsApp, address, business hours |
| `submit_contact_query` | Record a website visitor's inquiry for admin review |
| `generate_whatsapp_link` | Hand off a conversation to WhatsApp with a pre-filled message |

The agent also has read-only **resources** (`metra://company`, `metra://services`,
`metra://portfolio`, `metra://contact`, `metra://reference`, `metra://queries`) it can
browse directly.

### Typical agent flow

1. A user asks "I need a website" — the agent calls `get_services` to describe what Metra
   offers and `get_portfolio` for proof of work.
2. The user wants to proceed — the agent calls `submit_contact_query` to record the inquiry.
3. The agent then calls `generate_whatsapp_link` so the user can continue **directly in
   WhatsApp** with a pre-filled message (e.g.
   `https://wa.me/27651601948?text=Hi%20Metra%20Innovations...`).

---

## Requirements

- **Node.js 20+** (built and tested on Node 25)

---

## Install & build

```bash
cd "C:\Users\Thando Hlomuka\Desktop\Projects\Metra-Innovations\mcp-server"
npm install
npm run build
```

---

## Run

### Local (stdio) — recommended for Claude Desktop / Claude Code / Cursor

```bash
node dist/index.js
```

### Remote (Streamable HTTP) — for local connectors / GPTs on your own host

```bash
node dist/index.js --http --port 3388
```

The endpoint is `http://localhost:3388/mcp`, guarded to localhost
(DNS-rebinding + cross-origin protection).

### Live / online (recommended) — deployed on Vercel

The MCP server is also deployed **live** as a stateless HTTP function on this
website's Vercel hosting. It auto-deploys on every push to `main`:

```
https://metra-innovations.co.za/api/mcp
```

A **stateless** endpoint takes exactly one JSON-RPC message per HTTP POST and
returns one JSON-RPC response. This is the simplest, most reliable option for
remotely hosted AI agents (ChatGPT custom GPTs, hosted Claude, etc.) because it
avoids long-lived sessions and cold-start issues.

The live endpoint does **not** persist `submit_contact_query` submissions across
cold starts (Vercel function storage is ephemeral) — it records them per warm
instance and wins gracefully. For durable storage, add `https://metra-innovations.co.za/api/mcp` to a layer that forwards submissions to email/a database.

Request/response examples (JSON-RPC over HTTP POST with `Content-Type:
application/json`) are at the end of this document.

---

## Connectors — hook up AI agents

### Claude Desktop (`claude_desktop_config.json`)

Add to your `claude_desktop_config.json` (`mcpServers` block):

```json
{
  "mcpServers": {
    "metra-innovations": {
      "command": "node",
      "args": [
        "C:\\Users\\Thando Hlomuka\\Desktop\\Projects\\Metra-Innovations\\mcp-server\\dist\\index.js"
      ]
    }
  }
}
```

Then restart Claude Desktop and the `Metra` tools/resources will be available to the agent.

### Claude Code

```bash
claude mcp add metra-innovations -- node "C:\Users\Thando Hlomuka\Desktop\Projects\Metra-Innovations\mcp-server\dist\index.js"
```

### ChatGPT / custom GPT (remote connector)

Point the GPT **"Actions"** / connector at the live URL:

```
https://metra-innovations.co.za/api/mcp
```

This endpoint implements a stateless MCP JSON-RPC handler (POST, `application/json`;
JSON response). Each call is one request → one response, so it works cleanly with
hosted agents that can reach a public HTTPS URL.

For local development you can also run the HTTP server (see above) and point the
connector at `http://localhost:3388/mcp` instead.

---

## Live endpoint — JSON-RPC over HTTPS

`POST https://metra-innovations.co.za/api/mcp` with a JSON body:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": { "protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": { "name": "agent", "version": "1.0" } }
}
```

Example with `curl`:

```bash
curl -s https://metra-innovations.co.za/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

Supported methods: `initialize`, `notifications/initialized`, `ping`, `tools/list`,
`tools/call`, `resources/list`, `resources/read`. Notifications return HTTP `202`;
all other requests return a JSON-RPC response.

---

## Query data

Queries submitted via `submit_contact_query` are appended to
`mcp-server/data/contact-queries.json` (path overridable with the `METRA_QUERY_FILE`
env var). This is the file the admin can review — the mirror of the contact-form data the
website keeps in the browser.

---

## Troubleshooting

- **`streamable-http transport requires ...`** — you need the optional middleware:
  `npm i @modelcontextprotocol/node` (already a dependency; reinstall with `npm install`).
- **406 on the `/mcp` endpoint** — MCP requires the `Accept: application/json, text/event-stream`
  header; a browser hitting the URL directly returns 406, which is correct.
- **Port in use** — pass `--port <number>` to change the HTTP port.

---

## Project layout

```
metra-innovations/
├── api/
│   └── mcp.mjs        # Vercel serverless function: live, stateless HTTPS MCP endpoint
├── mcp-server/
│   ├── src/
│   │   ├── index.ts       # MCP server entry (stdio / streamable HTTP transports)
│   │   ├── server-factory.ts  # Shared tools + resources (uses lib MCP server)
│   │   ├── data.ts        # Company profile, services, portfolio, budget ranges
│   │   └── store.ts       # Contact-query persistence (JSON file, in-memory fallback)
│   ├── data/           # Recorded contact queries (gitignored file)
│   ├── dist/           # Compiled JS (committed so Vercel can import it with no build)
│   ├── package.json
│   ├── tsconfig.json
│   └── LICENSE
```

> **Why is `dist/` committed?** The website's Vercel project is a static
> (`framework: null`) deploy that does **not** run `npm install` or a build step.
> Committing `mcp-server/dist/*.js` (plain JS with Node built-ins only) lets the
> dependency-free serverless function `api/mcp.mjs` import the shared data/store
> logic at deploy time.

© 2026 Thando Hlomuka. All rights reserved.
