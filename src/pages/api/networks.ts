import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

const NETWORKS_DIR = path.resolve('./src/content/networks');

function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { originalSlug, ...networkData } = data;
    const slug = networkData.slug;

    if (!slug || !networkData.name) {
      return new Response(JSON.stringify({ error: 'Slug and name are required' }), { status: 400 });
    }

    if (!isValidSlug(slug) || (originalSlug && !isValidSlug(originalSlug))) {
      return new Response(JSON.stringify({ error: 'Invalid slug format' }), { status: 400 });
    }

    // If slug changed, delete old file
    if (originalSlug && originalSlug !== slug) {
      const oldPath = path.join(NETWORKS_DIR, `${originalSlug}.json`);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Remove undefined fields
    const clean = Object.fromEntries(
      Object.entries(networkData).filter(([, v]) => v !== undefined && v !== '')
    );

    const filePath = path.join(NETWORKS_DIR, `${slug}.json`);
    fs.writeFileSync(filePath, JSON.stringify(clean, null, 2) + '\n');

    return new Response(JSON.stringify({ success: true, slug }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ url }) => {
  try {
    const slug = url.searchParams.get('slug');
    if (!slug) {
      return new Response(JSON.stringify({ error: 'Slug is required' }), { status: 400 });
    }
    if (!isValidSlug(slug)) {
      return new Response(JSON.stringify({ error: 'Invalid slug format' }), { status: 400 });
    }

    const filePath = path.join(NETWORKS_DIR, `${slug}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
};
