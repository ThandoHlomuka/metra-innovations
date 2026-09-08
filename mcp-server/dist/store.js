// Persistence layer for contact queries.
//
// The website's own front-end stores contact queries in the browser (localStorage).
// For an AI agent running server-side, we persist them to a JSON file so an admin
// can review them. The storage file location is configurable so it can live inside
// this repo (./data/contact-queries.json) or point elsewhere via METRA_QUERY_FILE.
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
function resolveFile() {
    if (process.env.METRA_QUERY_FILE)
        return process.env.METRA_QUERY_FILE;
    // When running from dist/, the project root is one level up.
    return path.join(__dirname, '..', 'data', 'contact-queries.json');
}
// In-memory fallback used when the surrounding host has a non-persistent or
// read-only filesystem (e.g. a serverless function). Queries still return
// successfully, but are not retained across cold starts until a persistent
// store is configured via METRA_QUERY_FILE.
let memoryBuffer = null;
let memoryUsed = false;
async function readAll() {
    if (memoryUsed && memoryBuffer)
        return memoryBuffer;
    try {
        const raw = await fs.readFile(resolveFile(), 'utf-8');
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    }
    catch (e) {
        if (e && e.code === 'ENOENT')
            return [];
        // Fall back to memory on any read error (read-only/permission issues).
        memoryUsed = true;
        memoryBuffer = memoryBuffer ?? [];
        return memoryBuffer;
    }
}
export async function listQueries() {
    return readAll();
}
export async function addQuery(input) {
    const all = await readAll();
    const record = {
        id: 'q_' +
            Date.now().toString(36) +
            Math.random().toString(36).slice(2, 8),
        createdAt: new Date().toISOString(),
        ...input
    };
    all.push(record);
    try {
        const file = resolveFile();
        await fs.mkdir(path.dirname(file), { recursive: true });
        await fs.writeFile(file, JSON.stringify(all, null, 2), 'utf-8');
    }
    catch (e) {
        // Read-only / non-persistent host (e.g. serverless): keep in memory and
        // continue so the call still succeeds.
        memoryUsed = true;
        memoryBuffer = all;
    }
    return record;
}
//# sourceMappingURL=store.js.map