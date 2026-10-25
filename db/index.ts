/**
 * Cloudflare D1 client via REST API & Native Binding.
 *
 * D1 normally requires a Worker binding, but Cloudflare exposes a REST API:
 * POST /accounts/{account_id}/d1/database/{db_id}/query
 *
 * We wrap it with Drizzle's sqlite-proxy driver so all our typed queries work
 * seamlessly on Vercel or inside a Cloudflare Worker.
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
    error?: string;
    meta?: Record<string, unknown>;
  }>;
  success: boolean;
  errors: Array<{ code?: number; message: string }>;
  messages?: Array<string>;
}

/**
 * Execute raw SQL query directly against Cloudflare D1 (Worker binding or REST API).
 */
export async function executeD1Query(sql: string, params: any[] = []): Promise<any[]> {
  // 1. Try native Worker binding
  try {
    const ctx = getCloudflareContext();
    const d1Binding = (ctx as any)?.env?.DB;
    if (d1Binding) {
      const stmt = d1Binding.prepare(sql).bind(...params);
      const res = await stmt.all();
      return res.results || [];
    }
  } catch {
    // Fall back to REST API
  }

  // 2. REST API
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || DEFAULT_ACCOUNT_ID;
  const dbId      = process.env.CLOUDFLARE_D1_DATABASE_ID || DEFAULT_DB_ID;
  const apiToken  = getLocalApiToken();

  if (!apiToken) {
    throw new Error('Cloudflare D1 connection error: CLOUDFLARE_API_TOKEN is not set in environment variables.');
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql, params }),
  });

  if (!res.ok) {
    let detail = '';
    try {
      const errJson = await res.json();
      detail = errJson?.errors?.[0]?.message || JSON.stringify(errJson);
    } catch {}
    if (res.status === 401) {
      throw new Error('Cloudflare D1 connection error: 401 Unauthorized. The CLOUDFLARE_API_TOKEN in Vercel is invalid or expired.');
    }
    throw new Error(`D1 REST API error (${res.status}): ${detail || res.statusText}`);
  }

  const data = (await res.json()) as D1RestResponse;
  if (!data.success) {
    const msg = data.errors?.[0]?.message ?? 'D1 query failed';
    throw new Error(`D1 query failed: ${msg}`);
  }

  const queryResult = data.result?.[0];
  if (queryResult && !queryResult.success) {
    const innerErr = queryResult.error || data.errors?.[0]?.message || 'D1 inner query failed';
    throw new Error(`D1 SQL execution error: ${innerErr}`);
  }

  return queryResult?.results ?? [];
}

let schemaMigrationPromise: Promise<{ status: string; added: string[]; existing: string[] }> | null = null;

/**
 * Ensures that the Cloudflare D1 database has all the columns defined in schema.ts.
 * Checks existing columns with PRAGMA table_info, runs ALTER TABLE for any missing columns,
 * and backfills legacy profiles so they remain visible.
 */
export async function ensureD1Schema(force = false): Promise<{ status: string; added: string[]; existing: string[] }> {
  if (schemaMigrationPromise && !force) {
    return schemaMigrationPromise;
  }

  schemaMigrationPromise = (async () => {
    try {
      const tableInfo = await executeD1Query('PRAGMA table_info("profiles");');
      const existingCols = (tableInfo || []).map((row: any) => String(row.name).toLowerCase());
      const added: string[] = [];

      if (existingCols.length === 0) {
        // Table does not exist, create it from scratch
        await executeD1Query(`
          CREATE TABLE IF NOT EXISTS "profiles" (
            "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
            "name" text NOT NULL,
            "slug" text NOT NULL UNIQUE,
            "age" integer NOT NULL,
            "location" text NOT NULL,
            "city" text NOT NULL,
            "tier" text DEFAULT 'Standard' NOT NULL,
            "is_new" integer DEFAULT 0,
            "is_verified" integer DEFAULT 0,
            "is_approved" integer DEFAULT 0,
            "is_archived" integer DEFAULT 0,
            "is_premium" integer DEFAULT 0,
            "payment_status" text DEFAULT 'pending',
            "payment_amount" integer DEFAULT 0,
            "payment_ref" text,
            "status" text DEFAULT 'recent' NOT NULL,
            "category" text DEFAULT 'Adult Hookup',
            "services" text,
            "pics_count" integer DEFAULT 0 NOT NULL,
            "vids_count" integer DEFAULT 0 NOT NULL,
            "photo_url" text,
            "gallery_urls" text,
            "video_urls" text,
            "about" text,
            "phone" text NOT NULL,
            "whatsapp" text NOT NULL,
            "created_at" text NOT NULL,
            "updated_at" text NOT NULL
          );
        `);
        await executeD1Query('CREATE UNIQUE INDEX IF NOT EXISTS "profiles_slug_unique" ON "profiles" ("slug");');
        added.push('CREATED_FULL_TABLE');
      } else {
        // Table exists, verify all columns
        const REQUIRED_COLUMNS: { name: string; ddl: string }[] = [
          { name: 'is_approved',    ddl: 'ALTER TABLE "profiles" ADD COLUMN "is_approved" integer DEFAULT 0;' },
          { name: 'is_archived',    ddl: 'ALTER TABLE "profiles" ADD COLUMN "is_archived" integer DEFAULT 0;' },
          { name: 'is_premium',     ddl: 'ALTER TABLE "profiles" ADD COLUMN "is_premium" integer DEFAULT 0;' },
          { name: 'payment_status', ddl: "ALTER TABLE \"profiles\" ADD COLUMN \"payment_status\" text DEFAULT 'pending';" },
          { name: 'payment_amount', ddl: 'ALTER TABLE "profiles" ADD COLUMN "payment_amount" integer DEFAULT 0;' },
          { name: 'payment_ref',    ddl: 'ALTER TABLE "profiles" ADD COLUMN "payment_ref" text;' },
          { name: 'category',       ddl: "ALTER TABLE \"profiles\" ADD COLUMN \"category\" text DEFAULT 'Adult Hookup';" },
          { name: 'services',       ddl: 'ALTER TABLE "profiles" ADD COLUMN "services" text;' },
          { name: 'gallery_urls',   ddl: 'ALTER TABLE "profiles" ADD COLUMN "gallery_urls" text;' },
          { name: 'video_urls',     ddl: 'ALTER TABLE "profiles" ADD COLUMN "video_urls" text;' },
          { name: 'updated_at',     ddl: 'ALTER TABLE "profiles" ADD COLUMN "updated_at" text;' },
        ];

        for (const col of REQUIRED_COLUMNS) {
          if (!existingCols.includes(col.name)) {
            try {
              await executeD1Query(col.ddl);
              added.push(col.name);
            } catch (alterErr: any) {
              console.warn(`[ensureD1Schema] Column ${col.name} warning:`, alterErr?.message || alterErr);
            }
          }
        }

        // Backfill null timestamps and legacy approval flags
        try {
          await executeD1Query('UPDATE "profiles" SET "updated_at" = "created_at" WHERE "updated_at" IS NULL;');
        } catch {}
        try {
          await executeD1Query('UPDATE "profiles" SET "is_approved" = 1 WHERE "is_approved" IS NULL;');
        } catch {}
      }

      return { status: 'success', added, existing: existingCols };
    } catch (err: any) {
      schemaMigrationPromise = null; // Reset so next request can retry
      console.error('[ensureD1Schema error]', err);
      throw err;
    }
  })();

  return schemaMigrationPromise;
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
    if (!apiToken) {
      throw new Error(
        'Cloudflare D1 connection error: CLOUDFLARE_API_TOKEN is not set in Vercel environment variables.'
      );
    }

    const res = await fetch(url, {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql, params }),
    });

    if (!res.ok) {
      let detail = '';
      try {
        const errJson = await res.json();
        detail = errJson?.errors?.[0]?.message || JSON.stringify(errJson);
      } catch {}
      if (res.status === 401) {
        throw new Error(
          'Cloudflare D1 connection error: 401 Unauthorized. The CLOUDFLARE_API_TOKEN in Vercel is invalid or expired.'
        );
      }
      throw new Error(`D1 REST API error (${res.status}): ${detail || res.statusText}`);
    }

    const data = (await res.json()) as D1RestResponse;

    if (!data.success) {
      const msg = data.errors?.[0]?.message ?? 'D1 query failed';
      throw new Error(`D1 query failed: ${msg}`);
    }

    // Also check the individual query result (can fail even if outer success=true)
    const queryResult = data.result?.[0];
    if (queryResult && !queryResult.success) {
      const innerErr = queryResult.error || data.errors?.[0]?.message || 'D1 inner query failed';
      throw new Error(`D1 SQL execution error: ${innerErr}`);
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
