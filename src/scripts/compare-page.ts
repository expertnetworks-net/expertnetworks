import { buildCompareRender, type CompareDataset } from '../lib/compare-v2';

function arraysEqual(left: string[], right: string[]): boolean {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false;
  return left.every((item, index) => item === right[index]);
}

export function bootComparePage(dataset: CompareDataset) {
  const providerChips = document.getElementById('providerChips');
  const addNetworkBtn = document.getElementById('addNetworkBtn');
  const addNetworkModal = document.getElementById('addNetworkModal');
  const closeModalButton = document.getElementById('closeModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const networkSearch = document.getElementById('networkSearch') as HTMLInputElement | null;
  const networkPickerList = document.getElementById('networkPickerList');
  const diffToggle = document.getElementById('diffToggle') as HTMLInputElement | null;
  const highConfidenceToggle = document.getElementById('highConfidenceToggle') as HTMLInputElement | null;
  const notesToggle = document.getElementById('notesToggle') as HTMLInputElement | null;
  const decisionSummaryCards = document.getElementById('decisionSummaryCards');
  const decisionSummaryCaution = document.getElementById('decisionSummaryCaution');
  const explainableInsights = document.getElementById('explainableInsights');
  const providerSnapshotCards = document.getElementById('providerSnapshotCards');
  const snapshotTable = document.getElementById('snapshotTable');
  const pinnedDifferences = document.getElementById('pinnedDifferences');
  const criticalDifferencesTable = document.getElementById('criticalDifferencesTable');
  const aiTaxonomyGrid = document.getElementById('aiTaxonomyGrid');
  const commercialTable = document.getElementById('commercialTable');
  const complianceTable = document.getElementById('complianceTable');
  const matrixHiddenSummary = document.getElementById('matrixHiddenSummary');
  const fullMatrixContent = document.getElementById('fullMatrixContent');
  const selectionReviewedBadge = document.getElementById('selectionReviewedBadge');
  const heroDirectoryBtn = document.getElementById('heroDirectoryBtn') as HTMLAnchorElement | null;
  const browseDirectoryBtn = document.getElementById('browseDirectoryBtn') as HTMLAnchorElement | null;

  function getInitialSlugs(): string[] {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('networks');
    if (fromUrl) {
      const slugs = fromUrl.split(',').filter((slug) => dataset.networkDataMap[slug]);
      if (slugs.length === 1) {
        const base = [...dataset.defaultSlugs];
        if (!base.includes(slugs[0])) base.push(slugs[0]);
        return base.slice(0, 6);
      }
      if (slugs.length >= 2) return slugs.slice(0, 6);
    }
    const presetParam = params.get('preset');
    if (presetParam && dataset.presets[presetParam]) return [...dataset.presets[presetParam]];
    const addParam = params.get('add');
    if (addParam && dataset.networkDataMap[addParam]) {
      const base = [...dataset.defaultSlugs];
      if (!base.includes(addParam)) base.push(addParam);
      return base.slice(0, 6);
    }
    return [...dataset.defaultSlugs];
  }

  function getInitialPreset(): string {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('networks');
    if (fromUrl) return '';
    const preset = params.get('preset');
    return preset && dataset.presets[preset] ? preset : '';
  }

  let activeSlugs = getInitialSlugs();
  let activePreset = getInitialPreset();
  let diffMode = Boolean(diffToggle?.checked);
  let highConfidenceOnly = Boolean(highConfidenceToggle?.checked);
  let showEvidenceNotes = Boolean(notesToggle?.checked);
  let sectionObserver: IntersectionObserver | null = null;

  function syncUrl() {
    const url = new URL(window.location.href);
    url.searchParams.set('networks', activeSlugs.join(','));
    if (activePreset && dataset.presets[activePreset] && arraysEqual(activeSlugs, dataset.presets[activePreset])) {
      url.searchParams.set('preset', activePreset);
    } else {
      url.searchParams.delete('preset');
    }
    url.searchParams.delete('add');
    window.history.replaceState({}, '', url.toString());
  }

  function renderPathwayStates() {
    document.querySelectorAll<HTMLElement>('.pathway-card').forEach((button) => {
      const isActive = Boolean(activePreset) && button.dataset.preset === activePreset;
      button.classList.toggle('is-active', isActive);
    });
  }

  function filterPicker(query: string) {
    const search = query.toLowerCase();
    networkPickerList?.querySelectorAll<HTMLElement>('.network-pick-btn').forEach((button) => {
      const name = button.dataset.name || '';
      const slug = button.dataset.slug || '';
      button.style.display = (!query || name.includes(search)) && !activeSlugs.includes(slug) ? '' : 'none';
    });
  }

  function openModal() {
    addNetworkModal?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (networkSearch) networkSearch.value = '';
    filterPicker('');
    networkSearch?.focus();
  }

  function closeModal() {
    addNetworkModal?.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function bindChipEvents() {
    providerChips?.querySelectorAll<HTMLElement>('.remove-provider').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const slug = button.dataset.slug;
        if (!slug || activeSlugs.length <= 2) return;
        activeSlugs = activeSlugs.filter((candidate) => candidate !== slug);
        activePreset = '';
        render();
      });
    });
  }

  function render() {
    const view = buildCompareRender(activeSlugs, dataset, {
      diffMode,
      highConfidenceOnly,
      showEvidenceNotes,
    });

    if (providerChips) providerChips.innerHTML = view.chipsHtml;
    bindChipEvents();

    if (selectionReviewedBadge) selectionReviewedBadge.textContent = `Selection reviewed: ${view.latestReviewedLabel}`;
    if (heroDirectoryBtn) heroDirectoryBtn.href = view.directoryHref;
    if (browseDirectoryBtn) browseDirectoryBtn.href = view.directoryHref;

    if (decisionSummaryCards) decisionSummaryCards.innerHTML = view.decisionSummaryHtml;
    if (decisionSummaryCaution) decisionSummaryCaution.innerHTML = view.decisionSummaryCautionHtml;
    if (explainableInsights) explainableInsights.innerHTML = view.explainableInsightsHtml;
    if (providerSnapshotCards) providerSnapshotCards.innerHTML = view.providerCardsHtml;
    if (snapshotTable) snapshotTable.innerHTML = view.snapshotTableHtml;
    if (pinnedDifferences) pinnedDifferences.innerHTML = view.pinnedDifferencesHtml;
    if (criticalDifferencesTable) criticalDifferencesTable.innerHTML = view.criticalDifferencesHtml;
    if (aiTaxonomyGrid) aiTaxonomyGrid.innerHTML = view.aiTaxonomyHtml;
    if (commercialTable) commercialTable.innerHTML = view.commercialTableHtml;
    if (complianceTable) complianceTable.innerHTML = view.complianceTableHtml;
    if (matrixHiddenSummary) matrixHiddenSummary.innerHTML = view.fullMatrixSummaryHtml;
    if (fullMatrixContent) fullMatrixContent.innerHTML = view.fullMatrixContentHtml;

    renderPathwayStates();
    syncUrl();
    filterPicker(networkSearch?.value || '');
  }

  function updateSectionNav() {
    const links = Array.from(document.querySelectorAll<HTMLElement>('.section-anchor-link'));
    if (sectionObserver) {
      sectionObserver.disconnect();
      sectionObserver = null;
    }
    sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => link.classList.toggle('is-active', link.dataset.section === entry.target.id));
      });
    }, { rootMargin: '-180px 0px -62% 0px' });

    [
      'buyerPathways',
      'recommendationSummarySection',
      'providerSnapshot',
      'criticalDifferences',
      'aiIntelligence',
      'commercialCompliance',
      'fullMatrix',
      'methodology',
    ].forEach((id) => {
      const element = document.getElementById(id);
      if (element) sectionObserver?.observe(element);
    });
  }

  addNetworkBtn?.addEventListener('click', openModal);
  closeModalButton?.addEventListener('click', closeModal);
  modalBackdrop?.addEventListener('click', closeModal);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });

  networkSearch?.addEventListener('input', (event) => {
    filterPicker((event.target as HTMLInputElement).value);
  });

  networkPickerList?.querySelectorAll<HTMLElement>('.network-pick-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const slug = button.dataset.slug;
      if (!slug || activeSlugs.includes(slug)) return;
      if (activeSlugs.length >= 6) activeSlugs.shift();
      activeSlugs.push(slug);
      activePreset = '';
      closeModal();
      render();
    });
  });

  document.querySelectorAll<HTMLElement>('.pathway-card').forEach((button) => {
    button.addEventListener('click', () => {
      const preset = button.dataset.preset;
      if (!preset || !dataset.presets[preset]) return;
      if (activePreset === preset) {
        activePreset = '';
        activeSlugs = [...dataset.defaultSlugs];
      } else {
        activePreset = preset;
        activeSlugs = [...dataset.presets[preset]];
      }
      render();
    });
  });

  diffToggle?.addEventListener('change', () => {
    diffMode = Boolean(diffToggle.checked);
    render();
  });

  highConfidenceToggle?.addEventListener('change', () => {
    highConfidenceOnly = Boolean(highConfidenceToggle.checked);
    render();
  });

  notesToggle?.addEventListener('change', () => {
    showEvidenceNotes = Boolean(notesToggle.checked);
    render();
  });

  document.addEventListener('mouseover', (event) => {
    const cell = (event.target as HTMLElement).closest<HTMLElement>('.provider-col');
    const slug = cell?.dataset.slug;
    if (!slug) return;
    document.querySelectorAll<HTMLElement>(`.provider-col[data-slug="${slug}"]`).forEach((element) => {
      element.classList.add('highlight');
    });
  });

  document.addEventListener('mouseout', (event) => {
    const cell = (event.target as HTMLElement).closest<HTMLElement>('.provider-col');
    const slug = cell?.dataset.slug;
    if (!slug) return;
    document.querySelectorAll<HTMLElement>(`.provider-col[data-slug="${slug}"]`).forEach((element) => {
      element.classList.remove('highlight');
    });
  });

  render();
  updateSectionNav();
}
