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

export interface ContactQuery {
  id: string;
  name: string;
  email: string;
  phone?: string;
  service: string;
  budget?: string;
  message: string;
  source: string;
  createdAt: string;
}

function resolveFile(): string {
  if (process.env.METRA_QUERY_FILE) return process.env.METRA_QUERY_FILE;
  // When running from dist/, the project root is one level up.
  return path.join(__dirname, '..', 'data', 'contact-queries.json');
}

async function readAll(): Promise<ContactQuery[]> {
  try {
    const raw = await fs.readFile(resolveFile(), 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e: any) {
    if (e && e.code === 'ENOENT') return [];
    throw e;
  }
}

export async function listQueries(): Promise<ContactQuery[]> {
  return readAll();
}

export async function addQuery(input: Omit<ContactQuery, 'id' | 'createdAt'>): Promise<ContactQuery> {
  const all = await readAll();
  const record: ContactQuery = {
    id:
      'q_' +
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
    ...input
  };
  all.push(record);
  const file = resolveFile();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(all, null, 2), 'utf-8');
  return record;
}
