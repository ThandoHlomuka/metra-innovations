// Metra Innovations - stateless MCP endpoint for Vercel.
//
// This function exposes the Metra MCP server over a single, stateless HTTPS
// POST endpoint (https://metra-innovations.co.za/api/mcp). Each HTTP request
// carries exactly one JSON-RPC MCP message and receives one JSON-RPC response:
//   initialize           -> capabilities (tools + resources)
//   notifications/initialized -> acknowledgement (no response)
//   tools/list           -> the available tools
//   tools/call           -> invoke a tool
//   resources/list, resources/read -> resources
//   ping                 -> pong
//
// Deliberately dependency-free: it imports only the compiled, shared
// data/store modules (plain JS with Node built-ins) so it runs on this
// static Vercel project (framework: null, no npm install / build step).
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

export async function GET() {
  return new Response(
    'Metra Innovations - MCP server (stateless JSON-RPC over HTTPS).' +
      '\n\nAccessing this URL in a browser returns a 405 because this endpoint ' +
      'accepts POST requests only. Connect an MCP-enabled AI agent (Claude, ' +
      'ChatGPT, Cursor, etc.) to it instead.' +
      '\n\nEndpoint: POST https://metra-innovations.co.za/api/mcp (or the ' +
      '.vercel.app equivalent)' +
      '\nContent-Type: application/json' +
      '\nAccept: application/json, text/event-stream' +
      '\n\nExample:' +
      '\n  curl -s https://metra-innovations.co.za/api/mcp \\' +
      '\n    -H "Content-Type: application/json" \\' +
      '\n    -H "Accept: application/json, text/event-stream" \\' +
      '\n    -d \'{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}\'',
    {
      status: 200,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store'
      }
    }
  );
}

export async function POST(request) {
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
