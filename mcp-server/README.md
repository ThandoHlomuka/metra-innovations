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

### Remote (Streamable HTTP) — for connectors / GPTs / hosted agents

```bash
node dist/index.js --http --port 3388
```

The endpoint is `http://localhost:3388/mcp`, guarded to localhost
(DNS-rebinding + cross-origin protection).

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

Run the server in HTTP mode and point the GPT "Actions" / connector at:

```
https://your-host/mcp        (or http://localhost:3388/mcp locally)
```

The endpoint implements the MCP **Streamable HTTP** transport (POST, `application/json`;
SSE responses). Be sure to expose it over a URL the GPT runtime can reach, and add
host/origin allow-listing for that host in `src/index.ts` if you serve remotely.

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
mcp-server/
├── src/
│   ├── index.ts    # MCP server (tools + resources + stdio/http transports)
│   ├── data.ts     # Company profile, services, portfolio, budget ranges
│   └── store.ts    # Contact-query persistence (JSON file)
├── data/           # Recorded contact queries (gitignored file)
├── dist/           # Compiled output (gitignored)
├── package.json
├── tsconfig.json
└── LICENSE
```

© 2026 Thando Hlomuka. All rights reserved.
