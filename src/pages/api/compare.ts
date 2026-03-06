import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

const COMPARE_CONFIG = path.resolve('./src/content/compare.json');

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    fs.writeFileSync(COMPARE_CONFIG, JSON.stringify(data, null, 2) + '\n');

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
};
