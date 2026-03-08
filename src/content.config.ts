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
    employeeCountSource: z.string().optional(),
    expertCount: z.string().optional(),
    expertCountLabel: z.string().optional(),
    description: z.string(),
    services: z.array(z.string()).default([]),
    aiCapabilities: z.array(z.string()).default([]),
    industries: z.array(z.string()).default([]),
    pricingModel: z.string().optional(),
    pricingDetail: z.string().optional(),
    keyDifferentiators: z.array(z.string()).default([]),
    parentCompany: z.string().optional(),
    bestFor: z.array(z.string()).default([]),
    compliance: z.object({
      mnpiPolicy: z.string().optional(),
      expertVetting: z.string().optional(),
      coolingOffPeriod: z.string().optional(),
      auditTrail: z.boolean().default(false),
      regulatoryHistory: z.string().optional(),
    }).optional(),
    featured: z.boolean().default(false),
    priority: z.number().default(50),
    published: z.boolean().default(true),

    // V2 directory fields
    categoryBadge: z.enum(['Global Leader', 'Major Provider', 'Fast-Growing', 'Asia Specialist', 'Research Platform', 'Technology-First', 'Marketplace', 'Boutique Specialist']).optional(),
    deliveryModel: z.enum(['Concierge', 'Hybrid', 'Self-Serve', 'Marketplace', 'Platform-Led']).optional(),
    regionStrength: z.enum(['Global', 'North America', 'Europe', 'Asia-Pacific', 'Greater China', 'India', 'Emerging Markets']).optional(),
    complianceBadge: z.enum(['Strong Compliance', 'Standard Compliance', 'Compliance Tools', 'Limited Public Detail']).optional(),
    aiBadge: z.enum(['AI-Native', 'AI Research', 'AI Matching', 'AI Moderation', 'Limited AI Detail']).optional(),
    comparison: z.object({
      expertCalls: z.boolean().default(false),
      contentLibrary: z.union([z.boolean(), z.string()]).default(false),
      aiMatching: z.union([z.boolean(), z.string()]).default(false),
      surveys: z.boolean().default(false),
      complianceTools: z.boolean().default(false),
    }).optional(),
    lastUpdated: z.string(),

    // === Extended fields for rich profile pages (Phase 1) ===

    // Overview submenu
    overview: z.string().optional(),

    // History submenu
    history: z.object({
      narrative: z.string(),
      timeline: z.array(z.object({
        year: z.string(),
        event: z.string(),
      })).default([]),
    }).optional(),

    // Detailed services (accordion content)
    servicesDetailed: z.array(z.object({
      name: z.string(),
      description: z.string(),
    })).default([]),

    // AI & Platform submenu
    aiPlatform: z.object({
      narrative: z.string().optional(),
      features: z.array(z.string()).default([]),
    }).optional(),

    // Compliance extended
    complianceExtended: z.object({
      narrative: z.string().optional(),
      highlights: z.array(z.string()).default([]),
      regulatoryContext: z.string().optional(),
    }).optional(),

    // Client fit submenu
    clientFit: z.object({
      narrative: z.string().optional(),
      segments: z.array(z.string()).default([]),
    }).optional(),

    // Strengths (replaces keyDifferentiators for rich pages)
    strengths: z.array(z.string()).default([]),

    // Caveats / limitations
    caveats: z.array(z.string()).default([]),

    // Notable facts
    notableFacts: z.array(z.string()).default([]),

    // Source notes / methodology
    sourceNotes: z.array(z.string()).default([]),

    // Confidence badges per field
    confidence: z.record(z.enum(['verified', 'positioning', 'inference', 'partially-unverifiable'])).optional(),

    // Why choose / when not ideal chips
    whyChoose: z.array(z.string()).default([]),
    whenNotIdeal: z.array(z.string()).default([]),
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

    // V2 news fields
    sourceType: z.enum(['Press Release', 'Industry Report', 'News Coverage', 'Regulatory', 'Product Update']).optional(),
    significance: z.enum(['major', 'standard', 'brief']).optional(),
    featured: z.boolean().default(false),
    whyItMatters: z.string().optional(),
    impactTags: z.array(z.string()).default([]),
  }),
});

export const collections = { networks, news };
