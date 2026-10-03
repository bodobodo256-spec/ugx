/**
 * Cloudflare D1 client via REST API.
 *
 * D1 normally requires a Worker binding, but Cloudflare exposes a REST API:
 * POST /accounts/{account_id}/d1/database/{db_id}/query
 *
 * We wrap it with Drizzle's sqlite-proxy driver so all our typed queries work
 * exactly the same as if we were inside a Worker.
 */

import { drizzle } from 'drizzle-orm/sqlite-proxy';

interface D1RestResponse {
  result: Array<{
    results: Record<string, unknown>[];
    success: boolean;
    meta: Record<string, unknown>;
  }>;
  success: boolean;
  errors: Array<{ message: string }>;
}

export function getDb() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
  const dbId      = process.env.CLOUDFLARE_D1_DATABASE_ID!;
  const apiToken  = process.env.CLOUDFLARE_API_TOKEN!;

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`;

  return drizzle(async (sql, params, method) => {
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
      throw new Error(data.errors[0]?.message ?? 'D1 query failed');
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
