// Generates /llms.txt: a plain-text site summary for LLM agents.
// All lists come from the content collections, so the file cannot go stale.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SITE = 'https://expertnetworks.net';

export const GET: APIRoute = async () => {
  const networks = (await getCollection('networks'))
    .filter((n) => n.data.published)
    .sort((a, b) => a.data.priority - b.data.priority || a.data.name.localeCompare(b.data.name));
  const news = (await getCollection('news'))
    .filter((n) => n.data.published)
    .sort((a, b) => b.data.date.localeCompare(a.data.date));

  const oneLine = (text: string) => text.replace(/\s+/g, ' ').trim();
  const clip = (text: string, max = 180) => {
    const t = oneLine(text);
    return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
  };

  const lines = [
    '# ExpertNetworks.net',
    '',
    '> Independent public-source research on expert network providers: structured profiles, side-by-side comparison, pricing models, and dated industry news. No affiliations, no paid placements, no sign-up.',
    '',
    'Facts come from public sources. Provider profiles label each field as verified, company positioning, inference, or partially unverifiable. Check the source link on a news item before you cite a number.',
    '',
    '## Core pages',
    '',
    `- [Provider directory](${SITE}/networks/): all ${networks.length} tracked providers with filters`,
    `- [Compare providers](${SITE}/compare/): side-by-side comparison; select providers with ?networks=slug,slug`,
    `- [Industry news](${SITE}/news/): ${news.length} dated, sourced market signals`,
    `- [What is an expert network?](${SITE}/what-is-an-expert-network/): category explainer`,
    `- [Expert network pricing](${SITE}/expert-network-pricing/): how pricing models differ`,
    `- [Best expert networks](${SITE}/best-expert-networks/): overview by category and strength`,
    `- [Sources and methodology](${SITE}/sources/): how the research is done`,
    `- [Verification](${SITE}/verification/): what the confidence labels mean`,
    '',
    '## Provider profiles',
    '',
    ...networks.map(
      (n) => `- [${n.data.name}](${SITE}/networks/${n.data.slug}/): ${clip(n.data.description)} (updated ${n.data.lastUpdated})`,
    ),
    '',
    '## Latest news',
    '',
    ...news.slice(0, 30).map((n) => {
      const source = n.data.sourceUrl ? ` Source: ${n.data.sourceUrl}` : '';
      return `- ${n.data.date}: ${oneLine(n.data.title)} (${n.data.source}).${source}`;
    }),
    '',
    '## Optional',
    '',
    `- [About](${SITE}/about/)`,
    `- [Privacy](${SITE}/privacy/)`,
    `- [Disclaimer](${SITE}/disclaimer/)`,
    `- [Sitemap](${SITE}/sitemap-index.xml)`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
