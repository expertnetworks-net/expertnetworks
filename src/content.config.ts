import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const networks = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/networks' }),
  schema: z.object({
    name: z.string(),
    shortName: z.string(),
    slug: z.string(),
    website: z.string().optional(),
    logo: z.string().optional(),
    gradientFrom: z.string(),
    gradientTo: z.string(),
    type: z.string(),
    founded: z.number().optional(),
    headquarters: z.string().optional(),
    employeeCount: z.string().optional(),
    expertCount: z.string().optional(),
    description: z.string(),
    services: z.array(z.string()).default([]),
    aiCapabilities: z.array(z.string()).default([]),
    industries: z.array(z.string()).default([]),
    pricingModel: z.string().optional(),
    keyDifferentiators: z.array(z.string()).default([]),
    parentCompany: z.string().optional(),
    featured: z.boolean().default(false),
    priority: z.number().default(50),
    published: z.boolean().default(true),
    comparison: z.object({
      expertCalls: z.boolean().default(false),
      contentLibrary: z.union([z.boolean(), z.string()]).default(false),
      aiMatching: z.union([z.boolean(), z.string()]).default(false),
      surveys: z.boolean().default(false),
      complianceTools: z.boolean().default(false),
    }).optional(),
    lastUpdated: z.string(),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.string(),
    source: z.string(),
    sourceUrl: z.string().optional(),
    summary: z.string(),
    category: z.string(),
    categoryColor: z.string().optional(),
    gradientFrom: z.string().optional(),
    gradientTo: z.string().optional(),
    relatedNetworks: z.array(z.string()).default([]),
    published: z.boolean().default(true),
  }),
});

export const collections = { networks, news };
