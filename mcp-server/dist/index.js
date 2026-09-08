// Metra Innovations MCP server - entry point for local use.
//
// Transports:
//   - stdio (default): for local integrations like Claude Desktop / Claude Code
//   - streamable HTTP (--http / --port): for remote use on an always-on host,
//     or for local testing. For a Vercel serverless deployment see /api/mcp.ts.
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { createMetraServer } from './server-factory.js';
const useHttp = process.argv.includes('--http') || process.argv.includes('--streamable-http');
if (!useHttp) {
    serveStdio(() => createMetraServer());
}
else {
    // Remote/Connector mode using the @modelcontextprotocol/node middleware.
    try {
        const { NodeStreamableHTTPServerTransport, localhostHostValidation, localhostOriginValidation } = await import('@modelcontextprotocol/node');
        const { createServer } = await import('node:http');
        const portIndex = process.argv.indexOf('--port');
        const port = portIndex >= 0 ? Number(process.argv[portIndex + 1]) || 3388 : 3388;
        const transport = new NodeStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
        await createMetraServer().connect(transport);
        const validateHost = localhostHostValidation();
        const validateOrigin = localhostOriginValidation();
        const httpServer = createServer((req, res) => {
            if (!validateHost(req, res))
                return;
            if (!validateOrigin(req, res))
                return;
            void transport.handleRequest(req, res);
        });
        httpServer.listen(port, '0.0.0.0', () => {
            console.error(`Metra MCP listening on http://localhost:${port}/mcp`);
        });
    }
    catch (e) {
        console.error('streamable-http transport requires the @modelcontextprotocol/node middleware.\n' +
            'Run: npm i @modelcontextprotocol/node\n' +
            'Falling back to stdio.');
        serveStdio(() => createMetraServer());
    }
}
//# sourceMappingURL=index.js.map