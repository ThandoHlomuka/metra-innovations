// Builds the Metra MCP server instance (tools + resources).
// Shared by:
//   - src/index.ts        (local stdio / streamable HTTP via the node middleware)
//   - api/mcp.ts          (Vercel serverless function - stateless, one request at
//                          a time, so the server + all definitions are rebuilt per
//                          invocation)
import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod';
import { COMPANY, SERVICES, BUDGET_RANGES, PORTFOLIO, KEYWORDS } from './data.js';
import { addQuery, listQueries } from './store.js';
export function createMetraServer() {
    const server = new McpServer({
        name: 'metra-innovations',
        version: '1.0.0'
    });
    const text = (s) => ({ type: 'text', text: s });
    // ---- Tools ----
    server.registerTool('get_company_info', {
        description: 'Get general company information about Metra Innovations: name, tagline, founding year, ' +
            'location, service areas, phone, email, WhatsApp, business hours and a short description.'
    }, async () => ({
        content: [text(JSON.stringify(COMPANY, null, 2))]
    }));
    server.registerTool('get_services', {
        description: 'Get the full list of services offered by Metra Innovations (web development, ecommerce, ' +
            'mobile apps, custom software, cloud, consulting). Optionally filter by service id.',
        inputSchema: z.object({
            serviceId: z
                .string()
                .optional()
                .describe('Optional service id to fetch a single service, e.g. "web", "ecommerce".')
        })
    }, async ({ serviceId }) => {
        const services = serviceId
            ? SERVICES.filter((s) => s.id.toLowerCase() === serviceId.toLowerCase() ||
                s.label.toLowerCase().includes(serviceId.toLowerCase()))
            : SERVICES;
        return { content: [text(JSON.stringify(services, null, 2))] };
    });
    server.registerTool('get_portfolio', {
        description: 'Get portfolio / case-study projects built by Metra Innovations, optionally filtered by ' +
            'category (e-commerce, software, web development).',
        inputSchema: z.object({
            category: z
                .string()
                .optional()
                .describe('Optional filter: "E-commerce", "Software", "Web Development", or "all".')
        })
    }, async ({ category }) => {
        const items = category && category !== 'all'
            ? PORTFOLIO.filter((p) => p.category.toLowerCase() === category.toLowerCase() ||
                p.title.toLowerCase().includes(category.toLowerCase()))
            : PORTFOLIO;
        return { content: [text(JSON.stringify(items, null, 2))] };
    });
    server.registerTool('get_contact_details', {
        description: 'Get contact details for Metra Innovations including phone, email, WhatsApp link, physical ' +
            'address and business hours. Useful before sending a visitor to contact the company.',
        inputSchema: z.object({})
    }, async () => ({
        content: [
            text(JSON.stringify(COMPANY.contact, null, 2) +
                '\n\nAddress: ' + COMPANY.address +
                '\n\nBusiness hours:\n' +
                COMPANY.businessHours.map((b) => `- ${b.days}: ${b.hours}`).join('\n'))
        ]
    }));
    server.registerTool('submit_contact_query', {
        description: 'Submit a contact query / inquiry to Metra Innovations on behalf of a website visitor. ' +
            'This records the inquiry for the admin to review. The AI agent should call this when a ' +
            'user asks to contact the company or send an inquiry.',
        inputSchema: z.object({
            name: z.string().describe('Full name of the person making the inquiry.'),
            email: z.string().email().describe('Email address to be contacted back on.'),
            phone: z.string().optional().describe('Optional phone/WhatsApp number.'),
            service: z
                .string()
                .describe('Service requested: web, ecommerce, mobile, software, cloud, consulting, custom-solutions, other.'),
            budget: z
                .string()
                .optional()
                .describe('Optional budget range: 5k-10k, 10k-25k, 25k-50k, 50k-100k, 100k+.'),
            message: z.string().describe('The inquiry / project description message.'),
            source: z
                .string()
                .default('ai-agent')
                .describe('Where the query originated (default: ai-agent).')
        })
    }, async ({ name, email, phone, service, budget, message, source }) => {
        if (!name || !email || !service || !message) {
            throw new Error('name, email, service and message are required.');
        }
        const record = await addQuery({
            name,
            email,
            phone: phone || '',
            service,
            budget: budget || '',
            message,
            source
        });
        return {
            content: [
                text('Query recorded. Reference ' + record.id + '.\n\n' +
                    'The customer expects a response - you can follow up via email (' +
                    COMPANY.contact.email + ') or WhatsApp (' + COMPANY.contact.phone + ').')
            ]
        };
    });
    server.registerTool('generate_whatsapp_link', {
        description: 'Generate a WhatsApp deep link to contact Metra Innovations from a pre-filled message. ' +
            'This lets an AI agent hand the conversation off to WhatsApp so the user can continue ' +
            'chatting with the company directly on their phone.',
        inputSchema: z.object({
            message: z
                .string()
                .describe('The message to pre-fill in the WhatsApp chat.'),
            name: z
                .string()
                .optional()
                .describe('Optional name to include in the greeting.')
        })
    }, async ({ message, name }) => {
        const prefix = name ? `Hi Metra Innovations, I'm ${name}. ` : 'Hi Metra Innovations, ';
        const full = prefix + message;
        const url = 'https://wa.me/27651601948?text=' + encodeURIComponent(full);
        return {
            content: [
                text('Here is the WhatsApp deep link (pre-filled message):\n\n' +
                    url +
                    '\n\nInstructions for the user: open this link on any device with WhatsApp installed ' +
                    'to continue the conversation with Metra Innovations directly.')
            ]
        };
    });
    // ---- Resources ----
    server.registerResource('company', 'metra://company', { title: 'Metra Innovations - Company Overview', description: 'Company profile: name, location, contact, hours and description.', mimeType: 'application/json' }, () => ({
        contents: [
            {
                uri: 'metra://company',
                text: JSON.stringify({ ...COMPANY, services: SERVICES.map((s) => s.label), portfolioCount: PORTFOLIO.length }, null, 2)
            }
        ]
    }));
    server.registerResource('services', 'metra://services', { title: 'Metra Innovations - Services', description: 'All services offered by Metra Innovations.', mimeType: 'application/json' }, () => ({ contents: [{ uri: 'metra://services', text: JSON.stringify(SERVICES, null, 2) }] }));
    server.registerResource('portfolio', 'metra://portfolio', { title: 'Metra Innovations - Portfolio', description: 'Case studies / projects built by Metra Innovations.', mimeType: 'application/json' }, () => ({
        contents: [
            {
                uri: 'metra://portfolio',
                text: JSON.stringify(PORTFOLIO.map((p) => ({
                    id: p.id,
                    title: p.title,
                    category: p.category,
                    description: p.description,
                    technologies: p.technologies,
                    year: p.year
                })), null, 2)
            }
        ]
    }));
    server.registerResource('contact', 'metra://contact', { title: 'Metra Innovations - Contact & WhatsApp', description: 'Contact details and WhatsApp deep link for Metra Innovations.', mimeType: 'application/json' }, () => ({
        contents: [
            {
                uri: 'metra://contact',
                text: JSON.stringify({ ...COMPANY.contact, address: COMPANY.address, businessHours: COMPANY.businessHours }, null, 2)
            }
        ]
    }));
    server.registerResource('reference', 'metra://reference', { title: 'Metra Innovations - Reference Data', description: 'Valid service ids, budget ranges and SEO keywords.', mimeType: 'application/json' }, () => ({
        contents: [
            {
                uri: 'metra://reference',
                text: JSON.stringify({ services: SERVICES, budgetRanges: BUDGET_RANGES, keywords: KEYWORDS }, null, 2)
            }
        ]
    }));
    server.registerResource('queries', 'metra://queries', { title: 'Metra Innovations - Recorded Queries (read-only)', description: 'List of contact queries recorded via submit_contact_query.', mimeType: 'application/json' }, async () => ({
        contents: [{ uri: 'metra://queries', text: JSON.stringify(await listQueries(), null, 2) }]
    }));
    return server;
}
//# sourceMappingURL=server-factory.js.map