export type CompareDataset = {
  networkDataMap: Record<string, any>;
  defaultSlugs: string[];
  presets: Record<string, string[]>;
  sections: any[];
  enriched: Record<string, any>;
  substituteTypes: Record<string, string>;
  explainableInsights: any[];
  comparisonNote: string;
};

export type CompareRenderOptions = {
  diffMode?: boolean;
  highConfidenceOnly?: boolean;
  showEvidenceNotes?: boolean;
};

export const compareGoals = [
  { id: 'fast-calls', label: 'Fast expert calls', preset: 'fastCalls' },
  { id: 'transcript-research', label: 'Transcript-led research', preset: 'library' },
  { id: 'ai-sourcing', label: 'AI-supported sourcing', preset: 'aiMatching' },
  { id: 'ai-synthesis', label: 'AI-supported synthesis', preset: 'aiResearch' },
  { id: 'compliance', label: 'Lowest compliance risk', preset: 'leaders' },
  { id: 'consulting', label: 'Best for consulting', preset: 'consulting' },
  { id: 'pe', label: 'Best for private equity', preset: 'pe' },
  { id: 'hedge-funds', label: 'Best for hedge funds', preset: 'publicMarkets' },
  { id: 'enterprise', label: 'Best for enterprise', preset: 'enterprise' },
];

const providerTypeColors: Record<string, string> = {
  'Pure-Play Expert Network': 'bg-blue-500/10 text-blue-700 border-blue-200/60',
  'Hybrid Expert Network': 'bg-violet-500/10 text-violet-700 border-violet-200/60',
  'Research Platform': 'bg-emerald-500/10 text-emerald-700 border-emerald-200/60',
  'Technology-First Network': 'bg-cyan-500/10 text-cyan-700 border-cyan-200/60',
  'Asia Specialist Network': 'bg-rose-500/10 text-rose-700 border-rose-200/60',
  'Regional Expert Network': 'bg-amber-500/10 text-amber-700 border-amber-200/60',
  'Marketplace Platform': 'bg-orange-500/10 text-orange-700 border-orange-200/60',
  'Boutique Specialist': 'bg-slate-100 text-slate-700 border-slate-200/80',
};

const substituteColors: Record<string, string> = {
  'Direct peer': 'bg-blue-500/10 text-blue-700 border-blue-200/60',
  'Hybrid peer': 'bg-violet-500/10 text-violet-700 border-violet-200/60',
  'Partial substitute': 'bg-amber-500/12 text-amber-700 border-amber-200/60',
  'Adjacent platform': 'bg-emerald-500/12 text-emerald-700 border-emerald-200/60',
};

const complianceColors: Record<string, string> = {
  'Strong Compliance': 'bg-emerald-500/10 text-emerald-700',
  'Standard Compliance': 'bg-slate-100 text-slate-700',
  'Compliance Tools': 'bg-blue-500/10 text-blue-600',
  'Limited Public Detail': 'bg-amber-500/12 text-amber-700',
};

const deliveryColors: Record<string, string> = {
  Concierge: 'bg-blue-500/10 text-blue-700',
  Hybrid: 'bg-violet-500/10 text-violet-700',
  'Self-Serve': 'bg-emerald-500/10 text-emerald-700',
  Marketplace: 'bg-orange-500/10 text-orange-700',
  'Platform-Led': 'bg-cyan-500/10 text-cyan-700',
};

const regionColors: Record<string, string> = {
  Global: 'bg-blue-500/10 text-blue-700',
  'North America': 'bg-slate-100 text-slate-700',
  Europe: 'bg-indigo-500/10 text-indigo-700',
  'Asia-Pacific': 'bg-rose-500/10 text-rose-700',
  'Greater China': 'bg-red-500/10 text-red-700',
  India: 'bg-amber-500/10 text-amber-700',
  'Emerging Markets': 'bg-teal-500/10 text-teal-700',
};

const badgeColors: Record<string, string> = {
  'Global Leader': 'bg-amber-500/10 text-amber-700',
  'Major Provider': 'bg-blue-500/10 text-blue-700',
  'Fast-Growing': 'bg-emerald-500/10 text-emerald-700',
  'Asia Specialist': 'bg-rose-500/10 text-rose-700',
  'Research Platform': 'bg-violet-500/10 text-violet-700',
  'Technology-First': 'bg-cyan-500/10 text-cyan-700',
  Marketplace: 'bg-orange-500/10 text-orange-700',
  'Boutique Specialist': 'bg-slate-100 text-slate-700',
};

const aiBadgeColors: Record<string, string> = {
  'AI-Native': 'bg-violet-500/10 text-violet-700',
  'AI Research': 'bg-blue-500/10 text-blue-700',
  'AI Matching': 'bg-cyan-500/10 text-cyan-700',
  'AI Moderation': 'bg-slate-100 text-slate-700',
  'Limited AI Detail': 'bg-amber-500/12 text-amber-700',
};

const importanceOrder: Record<string, number> = { major: 0, moderate: 1, minor: 2 };

function escapeHtml(value = ''): string {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function resolve(data: any, key: string): any {
  return key.split('.').reduce((obj, segment) => obj?.[segment], data);
}

function shortName(dataset: CompareDataset, slug: string): string {
  const data = dataset.networkDataMap[slug];
  if (!data) return slug;
  return data.name.split(' (')[0].split(' / ')[0];
}

export function formatDateLabel(input?: string): string {
  if (!input) return 'Unknown';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function getProviderType(dataset: CompareDataset, slug: string): string {
  return dataset.enriched[slug]?.providerType || dataset.networkDataMap[slug]?.type || 'Provider';
}

function getSubstituteType(dataset: CompareDataset, slug: string): string {
  return dataset.substituteTypes[getProviderType(dataset, slug)] || 'Partial substitute';
}

function getSubstituteHint(dataset: CompareDataset, slug: string): string {
  const substituteType = getSubstituteType(dataset, slug);
  if (substituteType === 'Direct peer') return 'Most comparable to high-touch expert-network workflows.';
  if (substituteType === 'Hybrid peer') return 'Comparable on many workflows, but with a stronger hybrid research layer.';
  if (substituteType === 'Adjacent platform') return 'Directionally useful for content-led research, not always a one-for-one call-network substitute.';
  return 'Partly comparable, but some workflows or delivery assumptions differ materially.';
}

function getSubstituteClass(substituteType: string): string {
  return substituteColors[substituteType] || 'bg-slate-100 text-slate-700 border-slate-200/80';
}

function getConfidenceClass(level: string): string {
  if (level === 'High') return 'confidence-pill-high';
  if (level === 'Medium') return 'confidence-pill-medium';
  return 'confidence-pill-low';
}

function getImportanceClass(level: string): string {
  if (level === 'major') return 'importance-pill importance-major';
  if (level === 'moderate') return 'importance-pill importance-moderate';
  return 'importance-pill importance-minor';
}

function evidenceDotClass(evidence: string): string {
  if (evidence === 'Verified') return 'ev-verified';
  if (evidence === 'Company-Stated') return 'ev-stated';
  if (evidence === 'Estimated') return 'ev-estimated';
  return 'ev-inferred';
}

function capabilityPillClass(value: string): string {
  if (value === 'Publicly documented') return 'bg-emerald-500/12 text-emerald-700';
  if (value === 'Publicly indicated') return 'bg-blue-500/10 text-blue-700';
  if (value === 'Limited public evidence') return 'bg-amber-500/14 text-amber-700';
  return 'bg-slate-100 text-slate-600';
}

function renderIcon(dataset: CompareDataset, slug: string, size: 'small' | 'large' = 'small'): string {
  const data = dataset.networkDataMap[slug];
  if (!data) return '';
  if (size === 'large') {
    if (data.logo) return `<img src="${escapeHtml(data.logo)}" alt="" width="36" height="36" class="w-9 h-9 rounded-xl object-contain flex-shrink-0" loading="lazy" />`;
    return `<div class="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style="background:linear-gradient(135deg,${escapeHtml(data.gradientFrom)},${escapeHtml(data.gradientTo)})">${escapeHtml(data.shortName)}</div>`;
  }
  if (data.logo) return `<img src="${escapeHtml(data.logo)}" alt="" width="16" height="16" class="w-4 h-4 rounded object-contain flex-shrink-0" loading="lazy" />`;
  return `<div class="w-4 h-4 rounded flex items-center justify-center text-white text-[6px] font-bold flex-shrink-0" style="background:linear-gradient(135deg,${escapeHtml(data.gradientFrom)},${escapeHtml(data.gradientTo)})">${escapeHtml(data.shortName)}</div>`;
}

function getEvidenceCounts(dataset: CompareDataset, slug: string) {
  const counts = { Verified: 0, 'Company-Stated': 0, Inferred: 0, Estimated: 0 };
  const data = dataset.enriched[slug];
  if (!data) return counts;
  ['scaleEvidence', 'employeeEvidence'].forEach((field) => {
    const evidence = data[field];
    if (evidence && counts[evidence as keyof typeof counts] !== undefined) counts[evidence as keyof typeof counts] += 1;
  });
  Object.values(data.ai || {}).forEach((value: any) => {
    if (Array.isArray(value) && value[1] && counts[value[1] as keyof typeof counts] !== undefined) counts[value[1] as keyof typeof counts] += 1;
  });
  return counts;
}

function getConfidenceMeta(dataset: CompareDataset, slug: string) {
  const counts = getEvidenceCounts(dataset, slug);
  const supported = counts.Verified + counts['Company-Stated'];
  const soft = counts.Inferred + counts.Estimated;
  const substituteType = getSubstituteType(dataset, slug);
  let label = 'Low';
  if (supported >= 6 && soft <= 2) label = 'High';
  else if (supported >= 3) label = 'Medium';
  if (substituteType === 'Adjacent platform' && label === 'High') label = 'Medium';

  let note = 'Several compared fields depend on limited public evidence or editorial inference.';
  if (label === 'High') note = 'Most compared fields have direct public support, though pricing and AI maturity still need caution.';
  if (label === 'Medium') note = 'Core workflow fit is visible, but some commercial or AI comparisons remain partly inferential.';
  if (substituteType === 'Adjacent platform') note = 'High on platform visibility, lower on one-for-one comparability versus concierge expert networks.';
  return { label, note, counts };
}

function getPositioningLine(dataset: CompareDataset, slug: string): string {
  const data = dataset.networkDataMap[slug];
  if (!data) return 'Provider profile not found.';
  if (Array.isArray(data.keyDifferentiators) && data.keyDifferentiators.length > 0) return data.keyDifferentiators[0];
  if (Array.isArray(data.whyChoose) && data.whyChoose.length > 0) return data.whyChoose[0];
  return data.description.length > 120 ? `${data.description.slice(0, 117)}...` : data.description;
}

function getNotIdeal(dataset: CompareDataset, slug: string): string {
  const data = dataset.networkDataMap[slug];
  if (Array.isArray(data?.whenNotIdeal) && data.whenNotIdeal.length > 0) return data.whenNotIdeal[0];
  if (dataset.enriched[slug]?.weakness) return dataset.enriched[slug].weakness;
  return 'Needs closer diligence for fit.';
}

function getClosestAlternatives(dataset: CompareDataset, activeSlugs: string[], slug: string): string[] {
  const sameSubstituteType = activeSlugs.filter((candidate) => candidate !== slug && getSubstituteType(dataset, candidate) === getSubstituteType(dataset, slug));
  if (sameSubstituteType.length > 0) return sameSubstituteType.slice(0, 2);
  const sameDeliveryModel = activeSlugs.filter((candidate) => candidate !== slug && dataset.networkDataMap[candidate]?.deliveryModel === dataset.networkDataMap[slug]?.deliveryModel);
  if (sameDeliveryModel.length > 0) return sameDeliveryModel.slice(0, 2);
  return activeSlugs.filter((candidate) => candidate !== slug).slice(0, 2);
}

function getCellValue(dataset: CompareDataset, slug: string, row: any): any {
  if (row.id === 'bestFitBuyer') return dataset.networkDataMap[slug]?.bestFor?.[0] || null;
  if (row.id === 'substituteType') return getSubstituteType(dataset, slug);
  if (row.id === 'lastReviewed') return formatDateLabel(dataset.networkDataMap[slug]?.lastUpdated);
  if (row.source === 'enriched') return resolve(dataset.enriched[slug], row.key);
  return resolve(dataset.networkDataMap[slug], row.key);
}

function getComparableValue(dataset: CompareDataset, slug: string, row: any): any {
  const value = getCellValue(dataset, slug, row);
  return Array.isArray(value) ? value[0] : value;
}

function isSameRow(dataset: CompareDataset, activeSlugs: string[], row: any): boolean {
  const values = activeSlugs.map((slug) => JSON.stringify(getComparableValue(dataset, slug, row)));
  return values.every((value) => value === values[0]);
}

function renderCapabilityValue(value: any, showNotes: boolean): string {
  if (!Array.isArray(value)) return '<span class="text-tertiary/60">Not publicly clear</span>';
  const note = showNotes && value[2] ? `<div class="mt-1 text-[10px] leading-relaxed text-tertiary">${escapeHtml(value[2])}</div>` : '';
  const evidence = value[1] ? `<span class="ev-dot ${evidenceDotClass(value[1])}" title="${escapeHtml(value[1])}"></span>` : '';
  return `<div class="flex flex-col gap-1"><div class="inline-flex items-center gap-2 flex-wrap"><span class="data-pill ${capabilityPillClass(value[0])}">${escapeHtml(value[0])}</span>${evidence}</div>${note}</div>`;
}

function renderCellValue(dataset: CompareDataset, slug: string, row: any, showNotes: boolean): string {
  const value = getCellValue(dataset, slug, row);
  const type = row.type;
  if (type === 'capability') return renderCapabilityValue(value, showNotes);
  if (type === 'chip-provider') {
    if (!value) return '<span class="text-tertiary/60">-</span>';
    return `<span class="inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold ${providerTypeColors[value] || 'bg-slate-100 text-slate-700 border-slate-200/80'}">${escapeHtml(value)}</span>`;
  }
  if (type === 'substitute-type') {
    const substituteType = getSubstituteType(dataset, slug);
    return `<div class="flex flex-col gap-2"><span class="inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold ${getSubstituteClass(substituteType)}">${escapeHtml(substituteType)}</span><span class="text-[10px] leading-relaxed text-tertiary">${escapeHtml(getSubstituteHint(dataset, slug))}</span></div>`;
  }
  if (type === 'product-names') return value ? `<span class="text-[11px] italic leading-relaxed text-secondary">${escapeHtml(value)}</span>` : '<span class="text-tertiary/60">-</span>';
  if (type === 'text-evidence') {
    if (value == null || value === '') return '<span class="text-tertiary/60">-</span>';
    const evidence = dataset.enriched[slug]?.[row.evidenceField] || 'Inferred';
    return `<div class="inline-flex items-center gap-2"><span class="text-[12px] text-primary">${escapeHtml(value)}</span><span class="ev-dot ${evidenceDotClass(evidence)}" title="${escapeHtml(evidence)}"></span></div>`;
  }
  if (type === 'text-italic') return value ? `<span class="text-[11px] italic leading-relaxed text-secondary">${escapeHtml(value)}</span>` : '<span class="text-tertiary/60">-</span>';
  if (type === 'boolean') return value === true ? '<span class="text-emerald-600 font-bold">Yes</span>' : '<span class="text-tertiary/60">-</span>';
  if (type === 'boolean-or-string') {
    if (value === true) return '<span class="text-emerald-600 font-bold">Yes</span>';
    if (typeof value === 'string') return `<span class="text-[11px] font-medium text-primary">${escapeHtml(value)}</span>`;
    return '<span class="text-tertiary/60">-</span>';
  }
  if (type === 'graded') {
    if (!value) return '<span class="text-tertiary/60">-</span>';
    return `<span class="inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${complianceColors[value] || 'bg-slate-100 text-slate-700'}">${escapeHtml(value)}</span>`;
  }
  if (type === 'chip') {
    if (!value) return '<span class="text-tertiary/60">-</span>';
    const palette = row.key === 'deliveryModel' ? deliveryColors
      : row.key === 'regionStrength' ? regionColors
      : row.key === 'aiBadge' ? aiBadgeColors
      : badgeColors;
    return `<span class="inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${palette[value] || 'bg-slate-100 text-slate-700'}">${escapeHtml(value)}</span>`;
  }
  if (type === 'list') {
    if (!Array.isArray(value) || value.length === 0) return '<span class="text-tertiary/60">-</span>';
    const items = value.slice(0, 3).map((item: string) => `<span class="inline-flex rounded-full bg-[#f5f5f7] px-2 py-1 text-[10px] font-medium text-secondary">${escapeHtml(item)}</span>`).join('');
    const extra = value.length > 3 ? `<span class="text-[10px] text-tertiary">+${value.length - 3}</span>` : '';
    return `<div class="flex flex-wrap gap-1.5">${items}${extra}</div>`;
  }
  if (type === 'best-fit') return value ? `<span class="text-[12px] text-primary">${escapeHtml(value)}</span>` : '<span class="text-tertiary/60">-</span>';
  if (value != null && value !== '') return `<span class="text-[12px] text-primary">${escapeHtml(value)}</span>`;
  return '<span class="text-tertiary/60">-</span>';
}

function renderProviderHeaderCell(dataset: CompareDataset, slug: string): string {
  return `<th class="compare-head text-left min-w-[150px] provider-col" data-slug="${escapeHtml(slug)}"><div class="flex items-center gap-2">${renderIcon(dataset, slug)}<span>${escapeHtml(shortName(dataset, slug))}</span></div></th>`;
}

function renderComparisonTable(entries: any[], dataset: CompareDataset, activeSlugs: string[], options: {
  diffOnly?: boolean;
  highConfidenceOnly?: boolean;
  showSection?: boolean;
  showImportance?: boolean;
  sortByImportance?: boolean;
  showNotes?: boolean;
} = {}): string {
  const filtered = entries
    .filter((entry) => !options.highConfidenceOnly || entry.row.confidenceView === 'high')
    .filter((entry) => !options.diffOnly || !isSameRow(dataset, activeSlugs, entry.row))
    .sort((left, right) => {
      if (!options.sortByImportance) return 0;
      const importanceDelta = (importanceOrder[left.row.importance] ?? 9) - (importanceOrder[right.row.importance] ?? 9);
      if (importanceDelta !== 0) return importanceDelta;
      return left.row.label.localeCompare(right.row.label);
    });

  if (filtered.length === 0) return '<div class="empty-panel">No rows match the current filters.</div>';

  const rowsHtml = filtered.map((entry) => {
    const same = isSameRow(dataset, activeSlugs, entry.row);
    const sectionMeta = options.showSection ? `<span class="summary-pill">${escapeHtml(entry.sectionName)}</span>` : '';
    const importanceMeta = options.showImportance ? `<span class="${getImportanceClass(entry.row.importance)}">${escapeHtml(entry.row.importance)}</span>` : '';
    const sameMeta = !same ? '<span class="inline-flex h-2 w-2 rounded-full bg-accent/70"></span>' : '';
    const note = entry.row.description ? `<div class="row-note">${escapeHtml(entry.row.description)}</div>` : '';
    const cells = activeSlugs.map((slug) => `<td class="provider-col" data-slug="${escapeHtml(slug)}">${renderCellValue(dataset, slug, entry.row, Boolean(options.showNotes))}</td>`).join('');
    return `<tr><td class="sticky-col"><div class="row-label"><div class="row-name">${escapeHtml(entry.row.label)}</div><div class="row-meta">${sectionMeta}${importanceMeta}${sameMeta}</div>${note}</div></td>${cells}</tr>`;
  }).join('');

  return `<div class="table-shell"><table class="compare-table"><thead><tr><th class="compare-head sticky-col text-left">Field</th>${activeSlugs.map((slug) => renderProviderHeaderCell(dataset, slug)).join('')}</tr></thead><tbody>${rowsHtml}</tbody></table></div>`;
}

/* ---------- Rendering: provider cards ---------- */

function renderProviderCardsHtml(dataset: CompareDataset, activeSlugs: string[]): string {
  return activeSlugs.map((slug) => {
    const data = dataset.networkDataMap[slug];
    const providerType = getProviderType(dataset, slug);
    const substituteType = getSubstituteType(dataset, slug);
    const confidenceMeta = getConfidenceMeta(dataset, slug);
    const alternatives = getClosestAlternatives(dataset, activeSlugs, slug);
    const alternativesHtml = alternatives.length > 0
      ? alternatives.map((alt) => `<span class="inline-flex rounded-full bg-[#f5f5f7] px-2 py-1 text-[10px] font-medium text-primary">${escapeHtml(shortName(dataset, alt))}</span>`).join('')
      : '<span class="text-[10px] text-tertiary">No close alternative in current selection</span>';

    return `<article class="rounded-2xl border border-border/30 bg-white p-4 shadow-sm">
      <div class="flex items-start gap-3">
        <div class="flex items-center gap-2.5 min-w-0 flex-1">
          ${renderIcon(dataset, slug, 'large')}
          <div class="min-w-0">
            <div class="text-[15px] font-semibold text-primary truncate">${escapeHtml(shortName(dataset, slug))}</div>
            <div class="mt-1 flex flex-wrap gap-1.5">
              <span class="inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold ${providerTypeColors[providerType] || 'bg-slate-100 text-slate-700 border-slate-200/80'}">${escapeHtml(providerType)}</span>
              <span class="inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold ${getSubstituteClass(substituteType)}">${escapeHtml(substituteType)}</span>
            </div>
          </div>
        </div>
        <span class="confidence-chip shrink-0 ${getConfidenceClass(confidenceMeta.label)}">${escapeHtml(confidenceMeta.label)}</span>
      </div>
      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <div class="text-[10px] font-bold uppercase tracking-[0.14em] text-tertiary">Best for</div>
          <p class="mt-1 text-[12px] leading-relaxed text-primary">${escapeHtml(data.bestFor?.[0] || 'Not publicly clear')}</p>
        </div>
        <div>
          <div class="text-[10px] font-bold uppercase tracking-[0.14em] text-tertiary">Not ideal for</div>
          <p class="mt-1 text-[12px] leading-relaxed text-primary">${escapeHtml(getNotIdeal(dataset, slug))}</p>
        </div>
      </div>
      <div class="mt-3">
        <div class="text-[10px] font-bold uppercase tracking-[0.14em] text-tertiary">Closest alternatives</div>
        <div class="mt-1.5 flex flex-wrap gap-1.5">${alternativesHtml}</div>
      </div>
      <p class="mt-3 text-[12px] leading-relaxed text-secondary italic">${escapeHtml(getPositioningLine(dataset, slug))}</p>
      <a href="/networks/${escapeHtml(slug)}" class="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-accent no-underline hover:underline">
        View profile <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
      </a>
    </article>`;
  }).join('');
}

/* ---------- Export: projectCompareNetwork ---------- */

export function projectCompareNetwork(data: any) {
  return {
    slug: data.slug,
    name: data.name,
    shortName: data.shortName,
    logo: data.logo || '',
    gradientFrom: data.gradientFrom,
    gradientTo: data.gradientTo,
    type: data.type,
    description: data.description,
    pricingModel: data.pricingModel || '',
    pricingDetail: data.pricingDetail || '',
    bestFor: data.bestFor || [],
    keyDifferentiators: data.keyDifferentiators || [],
    whyChoose: data.whyChoose || [],
    whenNotIdeal: data.whenNotIdeal || [],
    regionStrength: data.regionStrength || '',
    expertCount: data.expertCount || '',
    expertCountLabel: data.expertCountLabel || '',
    employeeCount: data.employeeCount || '',
    founded: data.founded || '',
    headquarters: data.headquarters || '',
    deliveryModel: data.deliveryModel || '',
    complianceBadge: data.complianceBadge || '',
    aiBadge: data.aiBadge || '',
    categoryBadge: data.categoryBadge || '',
    comparison: data.comparison || {},
    compliance: data.compliance || {},
    lastUpdated: data.lastUpdated || '',
  };
}

/* ---------- Main export: buildCompareRender ---------- */

export function buildCompareRender(activeSlugs: string[], dataset: CompareDataset, options: CompareRenderOptions = {}) {
  const rowEntries = dataset.sections.flatMap((section) => section.rows.map((row: any) => ({
    sectionId: section.id,
    sectionName: section.name,
    row,
  })));
  const rowMap = Object.fromEntries(rowEntries.map((entry: any) => [entry.row.id, entry]));

  const diffMode = Boolean(options.diffMode);
  const highConfidenceOnly = Boolean(options.highConfidenceOnly);
  const showEvidenceNotes = Boolean(options.showEvidenceNotes);
  const tableOptions = { diffOnly: diffMode, highConfidenceOnly, showImportance: true, sortByImportance: true, showNotes: showEvidenceNotes };

  /* Critical differences: primary 6 rows */
  const criticalPrimaryEntries = [
    rowMap.providerType,
    rowMap.deliveryModel,
    { sectionId: 'fit', sectionName: 'User Fit', row: { id: 'bestFitBuyer', label: 'Best-fit buyer', type: 'best-fit', importance: 'major', confidenceView: 'mixed' } },
    rowMap.contentLibrary,
    { sectionId: 'ai', sectionName: 'AI', row: { id: 'aiPosture', label: 'AI posture', key: 'aiBadge', type: 'chip', importance: 'major', confidenceView: 'mixed' } },
    rowMap.pricingModel,
  ].filter(Boolean);

  /* Critical differences: expanded rows */
  const criticalExpandedEntries = [
    rowMap.geographyStrength,
    rowMap.compliancePosture,
    { sectionId: 'snapshot', sectionName: 'Snapshot', row: { id: 'substituteType', label: 'Directness of substitute', type: 'substitute-type', importance: 'major', confidenceView: 'high' } },
    rowMap.weakness,
    rowMap.claimedScale,
    rowMap.libraryQA,
    rowMap.sourceCitedSynthesis,
    rowMap.workflowAgents,
  ].filter(Boolean);

  /* AI tab entries */
  const aiEntries = rowEntries.filter((entry: any) => entry.sectionId === 'ai');

  /* Commercial tab entries */
  const commercialTabEntries = [
    rowMap.pricingModel,
    rowMap.pricingDetail,
    rowMap.geographyStrength,
    rowMap.claimedScale,
    rowMap.deliveryModel,
  ].filter(Boolean);

  /* Compliance tab entries */
  const complianceTabEntries = [
    rowMap.compliancePosture,
    rowMap.expertVetting,
    rowMap.auditTrail,
    rowMap.mnpiPolicy,
    rowMap.complianceAI,
    rowMap.coolingOffPeriod,
  ].filter(Boolean);

  /* Latest reviewed */
  const latestReviewed = activeSlugs
    .map((slug) => dataset.networkDataMap[slug]?.lastUpdated)
    .filter(Boolean)
    .sort()
    .at(-1);
  const directoryHref = `/networks?selected=${activeSlugs.join(',')}`;

  /* Full matrix */
  const fullMatrixEntries = dataset.sections.map((section) => {
    const entries = rowEntries.filter((entry: any) => entry.sectionId === section.id);
    const filtered = entries
      .filter((entry: any) => !highConfidenceOnly || entry.row.confidenceView === 'high')
      .filter((entry: any) => !diffMode || !isSameRow(dataset, activeSlugs, entry.row))
      .sort((left: any, right: any) => {
        if (!diffMode) return 0;
        const delta = (importanceOrder[left.row.importance] ?? 9) - (importanceOrder[right.row.importance] ?? 9);
        if (delta !== 0) return delta;
        return left.row.label.localeCompare(right.row.label);
      });
    if (filtered.length === 0) return '';
    return `<section class="mb-6">
      <div class="mb-3 flex items-center justify-between gap-3">
        <h3 class="text-[14px] font-semibold text-primary">${escapeHtml(section.name)}</h3>
        <span class="summary-pill">${filtered.length} row${filtered.length === 1 ? '' : 's'}</span>
      </div>
      ${renderComparisonTable(filtered, dataset, activeSlugs, {
        showImportance: true,
        sortByImportance: diffMode,
        showNotes: showEvidenceNotes,
      })}
    </section>`;
  }).join('');

  const hiddenSameCount = rowEntries.filter((entry: any) => isSameRow(dataset, activeSlugs, entry.row)).length;
  const highConfidenceHidden = rowEntries.filter((entry: any) => entry.row.confidenceView !== 'high').length;

  return {
    latestReviewedLabel: formatDateLabel(latestReviewed),
    directoryHref,
    chipsHtml: activeSlugs.map((slug) => {
      const data = dataset.networkDataMap[slug];
      return `<div class="provider-chip flex items-center gap-1.5 px-2.5 py-1 bg-[#f5f5f7] rounded-xl border border-border/40 whitespace-nowrap" data-slug="${escapeHtml(slug)}">
        ${renderIcon(dataset, slug)}
        <span class="text-[12px] font-medium text-primary">${escapeHtml(shortName(dataset, slug))}</span>
        <button class="remove-provider text-tertiary hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer p-0" data-slug="${escapeHtml(slug)}" aria-label="Remove ${escapeHtml(data.name)}">
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>`;
    }).join(''),
    criticalPrimaryHtml: renderComparisonTable(criticalPrimaryEntries, dataset, activeSlugs, tableOptions),
    criticalExpandedHtml: renderComparisonTable(criticalExpandedEntries, dataset, activeSlugs, tableOptions),
    providerCardsHtml: renderProviderCardsHtml(dataset, activeSlugs),
    aiTabHtml: renderComparisonTable(aiEntries, dataset, activeSlugs, tableOptions),
    commercialTabHtml: renderComparisonTable(commercialTabEntries, dataset, activeSlugs, tableOptions),
    complianceTabHtml: renderComparisonTable(complianceTabEntries, dataset, activeSlugs, tableOptions),
    fullMatrixSummaryHtml: `<div class="rounded-2xl border border-border/30 bg-[#fafafa] px-4 py-3 text-[12px] leading-relaxed text-secondary">
      ${diffMode ? 'Differences only: identical rows hidden, remaining sorted by importance.' : 'All tracked rows visible.'}
      ${highConfidenceOnly ? ' High-confidence rows only.' : ''}
      ${showEvidenceNotes ? ' Evidence notes expanded.' : ''}
      <div class="mt-1.5 text-[11px] text-tertiary">${hiddenSameCount} identical row${hiddenSameCount === 1 ? '' : 's'}. ${highConfidenceHidden} mixed/lower-confidence row${highConfidenceHidden === 1 ? '' : 's'}.</div>
    </div>`,
    fullMatrixContentHtml: fullMatrixEntries || '<div class="empty-panel">No rows match the current filters.</div>',
  };
}
