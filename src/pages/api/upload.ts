import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

const UPLOAD_DIR = path.resolve('./public/images/networks');

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
    }

    // Ensure upload dir exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const ext = path.extname(file.name) || '.png';
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase();
    const filePath = path.join(UPLOAD_DIR, safeName);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    return new Response(JSON.stringify({
      success: true,
      path: `/images/networks/${safeName}`,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
};
