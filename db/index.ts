/**
 * Cloudflare D1 client via REST API.
 *
 * D1 normally requires a Worker binding, but Cloudflare exposes a REST API:
 * POST /accounts/{account_id}/d1/database/{db_id}/query
 *
 * We wrap it with Drizzle's sqlite-proxy driver so all our typed queries work
 * exactly the same as if we were inside a Worker.
 */

import { drizzle as drizzleProxy } from 'drizzle-orm/sqlite-proxy';
import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { getCloudflareContext } from '@opennextjs/cloudflare';

// Fallback IDs for Cloudflare D1
const DEFAULT_ACCOUNT_ID = '75a566f7db81d6c9e2b0dbbcff7f4ca0';
const DEFAULT_DB_ID      = '3c441669-470d-41aa-a1f7-46ec8f6db422';

function getLocalApiToken(): string {
  if (process.env.CLOUDFLARE_API_TOKEN) return process.env.CLOUDFLARE_API_TOKEN;
  try {
    // Dynamically read from local .env.local file if running in Node.js
    const fs = require('fs');
    const path = require('path');
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const m = content.match(/^CLOUDFLARE_API_TOKEN=(.*)$/m);
      if (m) return m[1].trim().replace(/^["']|["']$/g, '');
    }
  } catch {
    // Ignored in edge/worker environments
  }
  return '';
}

interface D1RestResponse {
  result: Array<{
    results: Record<string, unknown>[];
    success: boolean;
    meta: Record<string, unknown>;
  }>;
  success: boolean;
  errors: Array<{ message: string }>;
}

export function getDb(): any {
  // 1. Try native Cloudflare Worker D1 binding first (production Worker / OpenNext)
  try {
    const ctx = getCloudflareContext();
    const d1Binding = (ctx as any)?.env?.DB;
    if (d1Binding) {
      return drizzleD1(d1Binding);
    }
  } catch {
    // Outside Cloudflare Worker runtime (local dev / build / node test) -> fall back to REST API
  }

  // 2. Cloudflare D1 REST API proxy
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || DEFAULT_ACCOUNT_ID;
  const dbId      = process.env.CLOUDFLARE_D1_DATABASE_ID || DEFAULT_DB_ID;
  const apiToken  = getLocalApiToken();

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`;

  return drizzleProxy(async (sql, params, method) => {
    const res = await fetch(url, {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql, params }),
    });

    if (!res.ok) {
      throw new Error(`D1 REST API error: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as D1RestResponse;

    if (!data.success) {
      const msg = data.errors[0]?.message ?? 'D1 query failed';
      throw new Error(msg);
    }

    // Also check the individual query result (can fail even if outer success=true)
    const queryResult = data.result[0];
    if (queryResult && !queryResult.success) {
      throw new Error('D1 inner query failed — check SQL or schema');
    }

    // sqlite-proxy expects rows as value arrays, D1 returns objects → convert
    if (method === 'run') {
      return { rows: [] };
    }

    const rows = (data.result[0]?.results ?? []).map(
      (row) => Object.values(row)
    );

    return { rows };
  });
}
