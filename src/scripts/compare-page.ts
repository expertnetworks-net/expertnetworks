import { buildCompareRender, type CompareDataset } from '../lib/compare-v2';

function arraysEqual(left: string[], right: string[]): boolean {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false;
  return left.every((item, index) => item === right[index]);
}

export function bootComparePage(dataset: CompareDataset) {
  /* ---------- DOM references ---------- */
  const providerChips = document.getElementById('providerChips');
  const addNetworkBtn = document.getElementById('addNetworkBtn');
  const addNetworkModal = document.getElementById('addNetworkModal');
  const closeModalButton = document.getElementById('closeModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const networkSearch = document.getElementById('networkSearch') as HTMLInputElement | null;
  const networkPickerList = document.getElementById('networkPickerList');
  const diffToggle = document.getElementById('diffToggle') as HTMLInputElement | null;
  const notesToggle = document.getElementById('notesToggle') as HTMLInputElement | null;

  const criticalPrimaryTable = document.getElementById('criticalPrimaryTable');
  const criticalExpandedTable = document.getElementById('criticalExpandedTable');
  const criticalExpandedWrapper = document.getElementById('criticalExpandedWrapper');
  const showMoreBtn = document.getElementById('showMoreBtn');
  const aiTabContent = document.getElementById('aiTabContent');
  const commercialTabContent = document.getElementById('commercialTabContent');
  const complianceTabContent = document.getElementById('complianceTabContent');
  const matrixSummary = document.getElementById('matrixSummary');
  const matrixContent = document.getElementById('matrixContent');

  const selectionReviewedBadge = document.getElementById('selectionReviewedBadge');
  const heroDirectoryBtn = document.getElementById('heroDirectoryBtn') as HTMLAnchorElement | null;
  const browseDirectoryBtn = document.getElementById('browseDirectoryBtn') as HTMLAnchorElement | null;

  /* ---------- State ---------- */

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

  function getInitialGoal(): string {
    const preset = getInitialPreset();
    if (!preset) return '';
    const goalButtons = document.querySelectorAll<HTMLElement>('.goal-pill');
    for (const button of goalButtons) {
      if (button.dataset.preset === preset) return button.dataset.goal || '';
    }
    return '';
  }

  let activeSlugs = getInitialSlugs();
  let activePreset = getInitialPreset();
  let activeGoal = getInitialGoal();
  let diffMode = Boolean(diffToggle?.checked);
  let showEvidenceNotes = Boolean(notesToggle?.checked);
  let expandedVisible = false;
  let railObserver: IntersectionObserver | null = null;

  /* ---------- URL sync ---------- */

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

  /* ---------- Goal selector ---------- */

  function renderGoalStates() {
    document.querySelectorAll<HTMLElement>('.goal-pill').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.goal === activeGoal);
    });
  }

  /* ---------- Modal ---------- */

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

  /* ---------- Chip events ---------- */

  function bindChipEvents() {
    providerChips?.querySelectorAll<HTMLElement>('.remove-provider').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const slug = button.dataset.slug;
        if (!slug || activeSlugs.length <= 2) return;
        activeSlugs = activeSlugs.filter((candidate) => candidate !== slug);
        activePreset = '';
        activeGoal = '';
        render();
      });
    });
  }

  /* ---------- Render ---------- */

  function render() {
    const view = buildCompareRender(activeSlugs, dataset, {
      diffMode,
      highConfidenceOnly: false,
      showEvidenceNotes,
    });

    /* Control bar */
    if (providerChips) providerChips.innerHTML = view.chipsHtml;
    bindChipEvents();

    /* Metadata */
    if (selectionReviewedBadge) selectionReviewedBadge.textContent = `Selection reviewed: ${view.latestReviewedLabel}`;
    if (heroDirectoryBtn) heroDirectoryBtn.href = view.directoryHref;
    if (browseDirectoryBtn) browseDirectoryBtn.href = view.directoryHref;

    /* Critical differences */
    if (criticalPrimaryTable) criticalPrimaryTable.innerHTML = view.criticalPrimaryHtml;
    if (criticalExpandedTable) criticalExpandedTable.innerHTML = view.criticalExpandedHtml;

    /* Section tables */
    if (aiTabContent) aiTabContent.innerHTML = view.aiTabHtml;
    if (commercialTabContent) commercialTabContent.innerHTML = view.commercialTabHtml;
    if (complianceTabContent) complianceTabContent.innerHTML = view.complianceTabHtml;
    if (matrixSummary) matrixSummary.innerHTML = view.fullMatrixSummaryHtml;
    if (matrixContent) matrixContent.innerHTML = view.fullMatrixContentHtml;

    /* Goal states */
    renderGoalStates();

    syncUrl();
    if (!addNetworkModal?.classList.contains('hidden')) {
      filterPicker(networkSearch?.value || '');
    }
  }

  /* ---------- Rail nav observer ---------- */

  function updateRailNav() {
    const railLinks = Array.from(document.querySelectorAll<HTMLElement>('.rail-link'));
    if (!railLinks.length) return;

    if (railObserver) {
      railObserver.disconnect();
      railObserver = null;
    }

    railObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        railLinks.forEach((link) => link.classList.toggle('is-active', link.dataset.rail === entry.target.id));
      });
    }, { rootMargin: '-140px 0px -60% 0px' });

    ['criticalDiff', 'aiWorkflow', 'commercial', 'compliance', 'fullMatrix', 'methodology'].forEach((id) => {
      const element = document.getElementById(id);
      if (element) railObserver?.observe(element);
    });
  }

  /* ---------- Event bindings ---------- */

  /* Modal */
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
      activeGoal = '';
      closeModal();
      render();
    });
  });

  /* Goal selector */
  document.querySelectorAll<HTMLElement>('.goal-pill').forEach((button) => {
    button.addEventListener('click', () => {
      const goalId = button.dataset.goal;
      const preset = button.dataset.preset;
      if (!preset || !dataset.presets[preset]) return;

      if (activeGoal === goalId) {
        /* Deselect: revert to defaults */
        activeGoal = '';
        activePreset = '';
        activeSlugs = [...dataset.defaultSlugs];
      } else {
        activeGoal = goalId || '';
        activePreset = preset;
        activeSlugs = [...dataset.presets[preset]];
      }
      render();
    });
  });

  /* Toggles */
  diffToggle?.addEventListener('change', () => {
    diffMode = Boolean(diffToggle.checked);
    render();
  });

  notesToggle?.addEventListener('change', () => {
    showEvidenceNotes = Boolean(notesToggle.checked);
    render();
  });

  /* Show more / fewer critical differences */
  showMoreBtn?.addEventListener('click', () => {
    expandedVisible = !expandedVisible;
    criticalExpandedWrapper?.classList.toggle('hidden', !expandedVisible);
    if (showMoreBtn) {
      showMoreBtn.innerHTML = expandedVisible
        ? '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 15-6-6-6 6"/></svg> Show fewer factors'
        : '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg> Show more buying factors';
    }
  });

  /* Column highlighting — track current slug to avoid flicker */
  let highlightedSlug: string | null = null;

  document.addEventListener('mouseover', (event) => {
    const cell = (event.target as HTMLElement).closest<HTMLElement>('.provider-col');
    const slug = cell?.dataset.slug || null;
    if (slug === highlightedSlug) return;
    if (highlightedSlug) {
      document.querySelectorAll<HTMLElement>(`.provider-col[data-slug="${CSS.escape(highlightedSlug)}"]`).forEach((el) => el.classList.remove('highlight'));
    }
    highlightedSlug = slug;
    if (slug) {
      document.querySelectorAll<HTMLElement>(`.provider-col[data-slug="${CSS.escape(slug)}"]`).forEach((el) => el.classList.add('highlight'));
    }
  });

  /* ---------- Init ---------- */
  const needsClientRender = !arraysEqual(activeSlugs, dataset.defaultSlugs) || diffMode || showEvidenceNotes;
  if (needsClientRender) {
    render();
  } else {
    bindChipEvents();
    renderGoalStates();
    syncUrl();
  }
  updateRailNav();
}
