// Metra Innovations - stateless MCP endpoint for Vercel.
//
// This function exposes the Metra MCP server over a single, stateless HTTPS
// endpoint (https://metra-innovations.co.za/api/mcp). Each HTTP request
// carries exactly one JSON-RPC MCP message and receives one JSON-RPC response:
//   initialize           -> capabilities (tools + resources)
//   notifications/initialized -> acknowledgement (no response)
//   tools/list           -> the available tools
//   tools/call           -> invoke a tool
//   resources/list, resources/read -> resources
//   ping                 -> pong
//
// It also implements OAuth 2.1 for remote MCP connectors (Claude.ai, Claude
// Desktop, ChatGPT, Cursor...):
//   GET  /.well-known/oauth-protected-resource   RFC 9728 discovery
//   GET  /.well-known/oauth-authorization-server RFC 8414 discovery
//   POST /oauth/register                         Dynamic client registration
//   GET/POST /oauth/authorize                    Browser consent flow
//   POST /oauth/token                            PKCE S256 code -> token exchange
//
// Authorization is STATELESS: codes and tokens are HMAC-SHA256 signed JWTs
// stored nowhere, so they survive Vercel function cold starts. Set the
// METRA_OAUTH_SECRET env var (vercel env add METRA_OAUTH_SECRET) for a real
// shared secret; otherwise a host-derived fallback is used (fine for this
// low-sensitivity read-only server, but not a production secret).
//
// Deliberately dependency-free: it imports only the compiled, shared
// data/store modules (plain JS with Node built-ins) so it runs on this
// static Vercel project (framework: null, no npm install / build step).
import crypto from 'node:crypto';
import { COMPANY, SERVICES, BUDGET_RANGES, PORTFOLIO, KEYWORDS } from '../mcp-server/dist/data.js';
import { addQuery, listQueries } from '../mcp-server/dist/store.js';

// Vercel serverless filesystems are non-persistent, so point recorded queries
// at /tmp (kept per warm instance). The store falls back to in-memory if the
// write fails, so submit_contact_query never crashes the endpoint.
process.env.METRA_QUERY_FILE = process.env.METRA_QUERY_FILE || '/tmp/metra-contact-queries.json';

const SERVER_INFO = { name: 'metra-innovations', version: '1.0.0' };
const PROTOCOL_VERSION = '2024-11-05';
const CAPABILITIES = { tools: {}, resources: {} };

const text = (s) => ({ type: 'text', text: s });

// ---------------------------------------------------------------------------
// OAuth 2.1 (PKCE S256) — stateless, HMAC-signed codes/tokens
// ---------------------------------------------------------------------------
const REDIRECT_URI = 'https://claude.ai/api/mcp/auth_callback';
const CODE_TTL_SECONDS = 600;
const ACCESS_TTL_SECONDS = 3600;
const REFRESH_TTL_SECONDS = 30 * 24 * 3600;
const SCOPE = 'mcp.tools';

const b64u = (input) => Buffer.from(input).toString('base64url');
const b64uDecode = (encoded) => {
  try {
    return Buffer.from(encoded, 'base64url').toString('utf8');
  } catch {
    return null;
  }
};
const sha256b64u = (input) => crypto.createHash('sha256').update(input).digest('base64url');
const sign = (payload, secret) => crypto.createHmac('sha256', secret).update(payload).digest('base64url');

function makeToken(payload, secret) {
  const body = b64u(JSON.stringify(payload));
  return body + '.' + sign(body, secret);
}

function parseToken(token, secret) {
  if (!token || typeof token !== 'string') return null;
  const dot = token.lastIndexOf('.');
  if (dot < 1) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(body, secret);
  let a = expected;
  let b = sig;
  if (a.length !== b.length) return null;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  if (diff !== 0) return null;
  const payload = JSON.parse(b64uDecode(body) || 'null');
  if (!payload || !payload.exp) return null;
  if (payload.exp * 1000 < Date.now()) return null;
  return payload;
}

function secretFor(origin) {
  return process.env.METRA_OAUTH_SECRET || 'metra-mcp-oauth-v1|' + origin.toLowerCase();
}

function requestOrigin(request) {
  try {
    return new URL(request.url).origin;
  } catch {
    return 'https://metra-innovations.vercel.app';
  }
}

function mcpUrl(origin) {
  return origin + '/api/mcp';
}

function bearerToken(request) {
  const header = request.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

function issueCode({ clientId, challenge, resource, redirectUri, state }, origin) {
  const payload = {
    type: 'code',
    cid: clientId,
    ch: challenge,
    res: resource,
    red: redirectUri,
    st: state,
    exp: Math.floor(Date.now() / 1000) + CODE_TTL_SECONDS,
    nonce: crypto.randomBytes(8).toString('hex')
  };
  return makeToken(payload, secretFor(origin));
}

function issueTokens({ clientId, resource, origin }) {
  const now = Math.floor(Date.now() / 1000);
  return {
    access_token: makeToken(
      { type: 'access', cid: clientId, aud: resource || mcpUrl(origin), scope: SCOPE, exp: now + ACCESS_TTL_SECONDS },
      secretFor(origin)
    ),
    refresh_token: makeToken(
      { type: 'refresh', cid: clientId, aud: resource || mcpUrl(origin), scope: SCOPE, exp: now + REFRESH_TTL_SECONDS },
      secretFor(origin)
    ),
    token_type: 'Bearer',
    expires_in: ACCESS_TTL_SECONDS,
    scope: SCOPE
  };
}

function validBearer(request, origin) {
  const token = parseToken(bearerToken(request), secretFor(origin));
  if (!token || token.type !== 'access') return false;
  return token.aud === mcpUrl(origin);
}

function authMetadata(origin) {
  return {
    resource: mcpUrl(origin),
    authorization_servers: [origin],
    bearer_methods_supported: ['header'],
    scopes_supported: [SCOPE]
  };
}

function serverMetadata(origin) {
  return {
    issuer: origin,
    authorization_endpoint: origin + '/oauth/authorize',
    token_endpoint: origin + '/oauth/token',
    registration_endpoint: origin + '/oauth/register',
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
    scopes_supported: [SCOPE],
    subject_types_supported: ['public']
  };
}

function jsonResponse(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
      ...extra
    }
  });
}

export function renderConsentPage({ clientId, redirectUri, codeChallenge, codeChallengeMethod, state, resource, scope, actionUrl }) {
  const input = (name, value) =>
    `<input type="hidden" name="${name}" value="${value === undefined || value === null ? '' : String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}">`;
  return new Response(
    `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Authorize Metra Innovations MCP</title>
<style>
  body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#050806;color:#e8f5ea;display:flex;align-items:center;justify-content:center;min-height:100vh}
  .card{background:#0b1a10;border:1px solid #1e4226;border-radius:16px;padding:40px;max-width:420px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.5)}
  h1{font-size:20px;margin:0 0 8px;color:#7de29b}
  p{color:#b9d6bf;font-size:14px;line-height:1.5;margin:8px 0}
  .mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:#8fd3a3;word-break:break-all}
  .buttons{display:flex;gap:12px;margin-top:24px}
  button{flex:1;padding:12px 16px;border-radius:10px;border:0;font-size:14px;font-weight:600;cursor:pointer}
  button.allow{background:#3ddc6f;color:#03230c}
  button.deny{background:#2a1718;color:#f08a8a;border:1px solid #5c2024}
  .footer{margin-top:24px;font-size:11px;color:#5f7d66}
</style></head>
<body>
<div class="card">
  <h1>Metra Innovations &mdash; Connect MCP</h1>
  <p>A client is requesting access to the Metra Innovations MCP server:</p>
  <p class="mono">${resource || mcpUrl(new URL(actionUrl).origin)}</p>
  <p>Approving grants it read access to company info, services, portfolio and
  contact details, plus the ability to submit a contact query on your behalf.</p>
  <form method="post" action="${actionUrl}">
    ${input('client_id', clientId)}
    ${input('redirect_uri', redirectUri)}
    ${input('code_challenge', codeChallenge)}
    ${input('code_challenge_method', codeChallengeMethod)}
    ${input('state', state)}
    ${input('resource', resource)}
    ${input('scope', scope)}
    ${input('decision', 'allow')}
    <div class="buttons">
      <button class="deny" type="submit" name="decision" value="deny">Deny</button>
      <button class="allow" type="submit" name="decision" value="allow">Allow</button>
    </div>
  </form>
  <div class="footer">Stateless OAuth &middot; PKCE S256 &middot; replies are HMAC-signed</div>
</div>
</body></html>`,
    {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
        'cross-origin-opener-policy': 'unsafe-none',
        'cross-origin-embedder-policy': 'unsafe-none',
        'cross-origin-resource-policy': 'cross-origin'
      }
    }
  );
}

const TOOLS = [
  {
    name: 'get_company_info',
    description:
      'Get general company information about Metra Innovations: name, tagline, founding year, ' +
      'location, service areas, phone, email, WhatsApp, business hours and a short description.'
  },
  {
    name: 'get_services',
    description:
      'Get the full list of services offered by Metra Innovations. Optionally filter by service id.',
    inputSchema: {
      type: 'object',
      properties: {
        serviceId: { type: 'string', description: 'Optional service id, e.g. "web", "ecommerce".' }
      }
    }
  },
  {
    name: 'get_portfolio',
    description:
      'Get portfolio / case-study projects built by Metra Innovations, optionally filtered by ' +
      'category (e-commerce, software, web development).',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Optional filter: "E-commerce", "Software", "Web Development", or "all".' }
      }
    }
  },
  {
    name: 'get_contact_details',
    description:
      'Get contact details for Metra Innovations including phone, email, WhatsApp link, physical ' +
      'address and business hours.'
  },
  {
    name: 'submit_contact_query',
    description:
      'Submit a contact query / inquiry to Metra Innovations on behalf of a website visitor. ' +
      'Call this when a user asks to contact the company or send an inquiry.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Full name of the person making the inquiry.' },
        email: { type: 'string', format: 'email', description: 'Email address to be contacted back on.' },
        phone: { type: 'string', description: 'Optional phone/WhatsApp number.' },
        service: { type: 'string', description: 'Service requested: web, ecommerce, mobile, software, cloud, consulting, custom-solutions, other.' },
        budget: { type: 'string', description: 'Optional budget range: 5k-10k, 10k-25k, 25k-50k, 50k-100k, 100k+.' },
        message: { type: 'string', description: 'The inquiry / project description message.' },
        source: { type: 'string', description: 'Where the query originated (default: ai-agent).' }
      },
      required: ['name', 'email', 'service', 'message']
    }
  },
  {
    name: 'generate_whatsapp_link',
    description:
      'Generate a WhatsApp deep link to contact Metra Innovations from a pre-filled message, so an ' +
      'AI agent can hand the conversation off to WhatsApp.',
    inputSchema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'The message to pre-fill in the WhatsApp chat.' },
        name: { type: 'string', description: 'Optional name to include in the greeting.' }
      },
      required: ['message']
    }
  }
];

const RESOURCES = [
  { uri: 'metra://company', name: 'Metra Innovations - Company Overview', description: 'Company profile: name, location, contact, hours and description.', mimeType: 'application/json' },
  { uri: 'metra://services', name: 'Metra Innovations - Services', description: 'All services offered by Metra Innovations.', mimeType: 'application/json' },
  { uri: 'metra://portfolio', name: 'Metra Innovations - Portfolio', description: 'Case studies / projects built by Metra Innovations.', mimeType: 'application/json' },
  { uri: 'metra://contact', name: 'Metra Innovations - Contact & WhatsApp', description: 'Contact details and WhatsApp deep link for Metra Innovations.', mimeType: 'application/json' },
  { uri: 'metra://reference', name: 'Metra Innovations - Reference Data', description: 'Valid service ids, budget ranges and SEO keywords.', mimeType: 'application/json' },
  { uri: 'metra://queries', name: 'Metra Innovations - Recorded Queries (read-only)', description: 'List of contact queries recorded via submit_contact_query.', mimeType: 'application/json' }
];

async function readResource(uri) {
  switch (uri) {
    case 'metra://company':
      return JSON.stringify(
        { ...COMPANY, services: SERVICES.map((s) => s.label), portfolioCount: PORTFOLIO.length },
        null,
        2
      );
    case 'metra://services':
      return JSON.stringify(SERVICES, null, 2);
    case 'metra://portfolio':
      return JSON.stringify(
        PORTFOLIO.map((p) => ({
          id: p.id,
          title: p.title,
          category: p.category,
          description: p.description,
          technologies: p.technologies,
          year: p.year
        })),
        null,
        2
      );
    case 'metra://contact':
      return JSON.stringify(
        { ...COMPANY.contact, address: COMPANY.address, businessHours: COMPANY.businessHours },
        null,
        2
      );
    case 'metra://reference':
      return JSON.stringify(
        { services: SERVICES, budgetRanges: BUDGET_RANGES, keywords: KEYWORDS },
        null,
        2
      );
    case 'metra://queries':
      return JSON.stringify(await listQueries(), null, 2);
    default:
      return null;
  }
}

async function callTool(name, args = {}) {
  switch (name) {
    case 'get_company_info':
      return { content: [text(JSON.stringify(COMPANY, null, 2))] };

    case 'get_services': {
      const id = (args.serviceId || '').toString().toLowerCase();
      const services = id
        ? SERVICES.filter(
            (s) => s.id.toLowerCase() === id || s.label.toLowerCase().includes(id)
          )
        : SERVICES;
      return { content: [text(JSON.stringify(services, null, 2))] };
    }

    case 'get_portfolio': {
      const cat = (args.category || '').toString().toLowerCase();
      const items = cat && cat !== 'all'
        ? PORTFOLIO.filter(
            (p) => p.category.toLowerCase() === cat || p.title.toLowerCase().includes(cat)
          )
        : PORTFOLIO;
      return { content: [text(JSON.stringify(items, null, 2))] };
    }

    case 'get_contact_details':
      return {
        content: [
          text(
            JSON.stringify(COMPANY.contact, null, 2) +
              '\n\nAddress: ' + COMPANY.address +
              '\n\nBusiness hours:\n' +
              COMPANY.businessHours.map((b) => `- ${b.days}: ${b.hours}`).join('\n')
          )
        ]
      };

    case 'submit_contact_query': {
      const { name: n, email, phone, service, budget, message, source = 'ai-agent' } = args;
      if (!n || !email || !service || !message) {
        throw new Error('name, email, service and message are required.');
      }
      const record = await addQuery({
        name: n,
        email,
        phone: phone || '',
        service,
        budget: budget || '',
        message,
        source
      });
      return {
        content: [
          text(
            'Query recorded. Reference ' + record.id + '.\n\n' +
            'The customer expects a response - you can follow up via email (' +
            COMPANY.contact.email + ') or WhatsApp (' + COMPANY.contact.phone + ').'
          )
        ]
      };
    }

    case 'generate_whatsapp_link': {
      const { message, name: nm } = args;
      if (!message) throw new Error('message is required.');
      const prefix = nm ? `Hi Metra Innovations, I'm ${nm}. ` : 'Hi Metra Innovations, ';
      const url = 'https://wa.me/27651601948?text=' + encodeURIComponent(prefix + message);
      return {
        content: [
          text(
            'Here is the WhatsApp deep link (pre-filled message):\n\n' +
              url +
              '\n\nInstructions for the user: open this link on any device with WhatsApp installed ' +
              'to continue the conversation with Metra Innovations directly.'
          )
        ]
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function handleMessage(msg) {
  const { method, params = {}, id } = msg || {};

  if (msg && msg.method && msg.method.startsWith('notifications/')) {
    // Notifications carry no id and expect no response.
    return null;
  }

  switch (method) {
    case 'initialize':
      return { protocolVersion: PROTOCOL_VERSION, capabilities: CAPABILITIES, serverInfo: SERVER_INFO };
    case 'ping':
      return {};
    case 'tools/list':
      return { tools: TOOLS };
    case 'tools/call': {
      const result = await callTool(params.name, params.arguments);
      return { content: result.content, isError: false };
    }
    case 'resources/list':
      return {
        resources: RESOURCES.map(({ uri, name, description, mimeType }) => ({
          uri,
          name,
          description,
          mimeType
        }))
      };
    case 'resources/read': {
      const uri = params.uri;
      const textVal = await readResource(uri);
      if (textVal === null) throw new Error(`Unknown resource: ${uri}`);
      return { contents: [{ uri, mimeType: 'application/json', text: textVal }] };
    }
    default:
      throw new Error(`Method not found: ${method}`);
  }
}

// ---------------------------------------------------------------------------
// OAuth route handlers
// ---------------------------------------------------------------------------
function routeOf(url) {
  const fromQuery = url.searchParams.get('mcp_route');
  if (fromQuery) return fromQuery;
  const path = url.pathname.replace(/\/+$/, '') || '/';
  if (path === '/.well-known/oauth-protected-resource') return 'oauth-protected-resource';
  if (path === '/.well-known/oauth-authorization-server') return 'oauth-authorization-server';
  if (path === '/oauth/register') return 'oauth-register';
  if (path === '/oauth/authorize') return 'oauth-authorize';
  if (path === '/oauth/token') return 'oauth-token';
  return 'mcp';
}

function handleRegister(request, url, origin) {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'invalid_request' }, 405);
  }
  const parse = async () => {
    const raw = await request.text().catch(() => '');
    try {
      return JSON.parse(raw || '{}');
    } catch {
      return {};
    }
  };
  return parse().then((body) => {
    const uris = Array.isArray(body.redirect_uris) ? body.redirect_uris : [];
    if (!uris.includes(REDIRECT_URI)) {
      return jsonResponse(
        { error: 'invalid_redirect_uri', error_description: 'redirect_uri not allowed by this server' },
        400
      );
    }
    const clientId = 'metra-mcp-' + sha256b64u(origin + '|' + REDIRECT_URI).slice(0, 20);
    return jsonResponse(
      {
        client_id: clientId,
        client_name: body.client_name || 'MCP client',
        redirect_uris: [REDIRECT_URI],
        grant_types: ['authorization_code', 'refresh_token'],
        token_endpoint_auth_method: 'none',
        scope: SCOPE
      },
      201
    );
  });
}

function handleAuthorizePage(request, p) {
  if (request.method !== 'GET') return jsonResponse({ error: 'invalid_request' }, 405);
  return renderConsentPage({
    clientId: p.get('client_id'),
    redirectUri: p.get('redirect_uri'),
    codeChallenge: p.get('code_challenge'),
    codeChallengeMethod: p.get('code_challenge_method'),
    state: p.get('state'),
    resource: p.get('resource'),
    scope: p.get('scope'),
    actionUrl: '/oauth/authorize'
  });
}

async function handleAuthorizeForm(request, url, origin) {
  if (request.method !== 'POST') {
    const p = url.searchParams;
    const target = new URL(url.href);
    target.pathname = '/oauth/authorize';
    target.search = '';
    return new Response(null, { status: 307, headers: { location: target.href } });
  }
  const raw = await request.text().catch(() => '');
  const p = new URLSearchParams(raw);
  const decision = p.get('decision');
  const redirectUri = p.get('redirect_uri');
  const state = p.get('state');
  const resource = p.get('resource');
  const challenge = p.get('code_challenge');
  const challengeMethod = p.get('code_challenge_method');

  if (decision === 'deny') {
    const target = new URL(redirectUri || REDIRECT_URI);
    target.searchParams.set('error', 'access_denied');
    target.searchParams.set('state', state || '');
    return new Response(null, { status: 302, headers: { location: target.href } });
  }

  if (challengeMethod !== 'S256' || !challenge || !redirectUri || redirectUri !== REDIRECT_URI) {
    return new Response('invalid authorization request', { status: 400 });
  }

  const clientId = p.get('client_id') || 'metra-mcp-' + sha256b64u(origin + '|' + REDIRECT_URI).slice(0, 20);
  const code = issueCode({ clientId, challenge, resource, redirectUri, state }, origin);

  const target = new URL(redirectUri);
  target.searchParams.set('code', code);
  if (state) target.searchParams.set('state', state);
  return new Response(null, { status: 302, headers: { location: target.href, 'cache-control': 'no-store' } });
}

async function handleToken(request, origin) {
  if (request.method !== 'POST') return jsonResponse({ error: 'invalid_request' }, 405);
  const raw = await request.text().catch(() => '');
  const body = new URLSearchParams(raw);
  const grantType = body.get('grant_type');
  const clientId = body.get('client_id');

  if (grantType === 'authorization_code') {
    const code = body.get('code');
    const verifier = body.get('code_verifier');
    const redirectUri = body.get('redirect_uri');
    const token = parseToken(code, secretFor(origin));
    if (!token || token.type !== 'code') {
      return jsonResponse({ error: 'invalid_grant', error_description: 'invalid authorization code' }, 400);
    }
    if (redirectUri !== token.red) {
      return jsonResponse({ error: 'invalid_grant', error_description: 'redirect_uri mismatch' }, 400);
    }
    if (token.cid && clientId && token.cid !== clientId) {
      return jsonResponse({ error: 'invalid_grant', error_description: 'client_id mismatch' }, 400);
    }
    if (token.ch && sha256b64u(verifier || '') !== token.ch) {
      return jsonResponse({ error: 'invalid_grant', error_description: 'PKCE verification failed' }, 400);
    }
    const resource = token.res || mcpUrl(origin);
    return jsonResponse(issueTokens({ clientId: token.cid || clientId || 'metra', resource, origin }), 200);
  }

  if (grantType === 'refresh_token') {
    const refresh = body.get('refresh_token');
    const token = parseToken(refresh, secretFor(origin));
    if (!token || token.type !== 'refresh') {
      return jsonResponse({ error: 'invalid_grant', error_description: 'invalid refresh token' }, 400);
    }
    if (token.cid && clientId && token.cid !== clientId) {
      return jsonResponse({ error: 'invalid_grant', error_description: 'client_id mismatch' }, 400);
    }
    const resource = token.aud === mcpUrl(origin) ? token.aud : mcpUrl(origin);
    return jsonResponse(issueTokens({ clientId: token.cid || clientId || 'metra', resource, origin }), 200);
  }

  return jsonResponse({ error: 'unsupported_grant_type' }, 400);
}

export async function GET(request) {
  const url = new URL(request.url);
  const route = routeOf(url);

  if (route === 'oauth-protected-resource') {
    const body = JSON.stringify(authMetadata(requestOrigin(request)), null, 2);
    return new Response(body, {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
        'cross-origin-resource-policy': 'cross-origin'
      }
    });
  }

  if (route === 'oauth-authorization-server') {
    const body = JSON.stringify(serverMetadata(requestOrigin(request)), null, 2);
    return new Response(body, {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
        'cross-origin-resource-policy': 'cross-origin'
      }
    });
  }

  if (route === 'oauth-authorize') {
    const p = url.searchParams;
    return handleAuthorizePage(request, p);
  }

  if (route === 'mcp') {
    const accept = request.headers.get('accept') || '';
    if (accept.includes('text/event-stream')) {
      // Streamable HTTP over GET (SSE) is intentionally not provided; this
      // endpoint is stateless JSON-RPC over POST only.
      return new Response('streaming transport not supported', {
        status: 405,
        headers: { allow: 'POST' }
      });
    }
    return new Response(
      'Metra Innovations - MCP server (stateless JSON-RPC over HTTPS, OAuth 2.1 protected).' +
        '\n\nThis URL accepts POST requests with MCP JSON-RPC messages carrying a ' +
        'Bearer token issued by the OAuth flow.' +
        '\n\nDiscovery endpoints:' +
        '\n  GET /.well-known/oauth-protected-resource' +
        '\n  GET /.well-known/oauth-authorization-server' +
        '\n  POST /oauth/register' +
        '\n  GET /oauth/authorize  (browser consent)' +
        '\n  POST /oauth/token' +
        '\n\nExample (after obtaining a token):' +
        '\n  curl -s https://metra-innovations.co.za/api/mcp \\' +
        '\n    -H "Content-Type: application/json" \\' +
        '\n    -H "Accept: application/json, text/event-stream" \\' +
        '\n    -H "Authorization: Bearer <token>" \\' +
        '\n    -d \'{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}\'',
      {
        status: 200,
        headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' }
      }
    );
  }

  return jsonResponse({ error: 'method_not_allowed' }, 405);
}

export async function POST(request) {
  const url = new URL(request.url);
  const route = routeOf(url);
  const origin = requestOrigin(request);

  if (route === 'oauth-register') return handleRegister(request, url, origin);
  if (route === 'oauth-authorize') return handleAuthorizeForm(request, url, origin);
  if (route === 'oauth-token') return handleToken(request, origin);

  // OAuth gate for the MCP endpoint itself.
  if (!validBearer(request, origin)) {
    return new Response(null, {
      status: 401,
      headers: {
        'www-authenticate':
          'Bearer resource_metadata="' + origin + '/.well-known/oauth-protected-resource"'
      }
    });
  }

  let raw;
  try {
    raw = await request.text();
  } catch {
    return new Response('bad request', { status: 400 });
  }

  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response('invalid JSON', { status: 400 });
  }

  try {
    const result = await handleMessage(body);
    if (result === null) {
      // Notification - accepted.
      return new Response('accepted', { status: 202 });
    }
    const payload = { jsonrpc: '2.0', id: body.id ?? null, result };
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store'
      }
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[mcp] RPC error:', e);
    const message = e && e.message ? e.message : String(e);
    const payload = {
      jsonrpc: '2.0',
      id: body.id ?? null,
      error: { code: -32603, message }
    };
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store'
      }
    });
  }
}
