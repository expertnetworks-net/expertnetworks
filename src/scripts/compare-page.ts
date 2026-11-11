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
  const criticalPrimaryTable = document.getElementById('criticalPrimaryTable');
  const criticalExpandedTable = document.getElementById('criticalExpandedTable');
  const criticalExpandedWrapper = document.getElementById('criticalExpandedWrapper');
  const showMoreBtn = document.getElementById('showMoreBtn');
  const aiTabContent = document.getElementById('aiTabContent');
  const commercialTabContent = document.getElementById('commercialTabContent');
  const complianceTabContent = document.getElementById('complianceTabContent');
  const matrixSummary = document.getElementById('matrixSummary');
  const matrixContent = document.getElementById('matrixContent');

  const providerCount = document.getElementById('providerCount');
  const browseDirectoryBtn = document.getElementById('browseDirectoryBtn') as HTMLAnchorElement | null;
  const controlBar = document.getElementById('controlBar');
  const diffToggle = document.getElementById('diffToggle') as HTMLInputElement | null;
  const confidenceToggle = document.getElementById('confidenceToggle') as HTMLInputElement | null;
  const notesToggle = document.getElementById('notesToggle') as HTMLInputElement | null;
  const resetViewBtn = document.getElementById('resetViewBtn');
  const pickerEmpty = document.getElementById('pickerEmpty');
  const pickerHint = document.getElementById('pickerHint');
  const compareStatus = document.getElementById('compareStatus');

  /* ---------- Toast ---------- */

  function showToast(message: string) {
    const existing = document.getElementById('compareToast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'compareToast';
    toast.textContent = message;
    Object.assign(toast.style, {
      position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
      background: '#1d1d1f', color: '#fff', padding: '10px 20px', borderRadius: '12px',
      fontSize: '13px', fontWeight: '500', zIndex: '9999', opacity: '0',
      transition: 'opacity 0.2s ease', pointerEvents: 'none', whiteSpace: 'nowrap',
    });
    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity = '1'; });
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 200);
    }, 2500);
  }

  /* ---------- State ---------- */

  function validSlugs(slugs: string[]): string[] {
    return slugs.filter((slug) => dataset.networkDataMap[slug]);
  }

  /* Default shortlist plus one requested provider. The defaults already fill all 5 slots, so a provider
     outside them leads the list and the last default drops off (appending would silently discard it). */
  function withProvider(slug: string): string[] {
    const base = validSlugs([...dataset.defaultSlugs]);
    if (base.includes(slug)) return base.slice(0, 5);
    return [slug, ...base].slice(0, 5);
  }

  function getInitialSlugs(): string[] {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('networks');
    if (fromUrl) {
      const slugs = [...new Set(fromUrl.split(','))].filter((slug) => dataset.networkDataMap[slug]);
      if (slugs.length === 1) {
        return withProvider(slugs[0]);
      }
      if (slugs.length >= 2) return slugs.slice(0, 5);
    }
    const presetParam = params.get('preset');
    if (presetParam && dataset.presets[presetParam]) {
      const presetSlugs = validSlugs([...dataset.presets[presetParam]]);
      if (presetSlugs.length >= 2) return presetSlugs.slice(0, 5);
    }
    const addParam = params.get('add');
    if (addParam && dataset.networkDataMap[addParam]) {
      return withProvider(addParam);
    }
    return validSlugs([...dataset.defaultSlugs]);
  }

  function getInitialPreset(): string {
    const params = new URLSearchParams(window.location.search);
    const preset = params.get('preset');
    if (!preset || !dataset.presets[preset]) return '';
    /* An explicit provider list wins; the preset only stays active while the list still matches it. */
    const fromUrl = params.get('networks');
    if (fromUrl && !arraysEqual(getInitialSlugs(), validSlugs([...dataset.presets[preset]]).slice(0, 5))) return '';
    return preset;
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
  const initialParams = new URLSearchParams(window.location.search);
  let diffMode = initialParams.get('diff') === '1';
  let highConfidenceOnly = initialParams.get('confidence') === 'high';
  let showEvidenceNotes = initialParams.get('notes') === '1';
  let expandedVisible = false;

  /* ---------- URL sync ---------- */

  function syncUrl() {
    const url = new URL(window.location.href);
    url.searchParams.set('networks', activeSlugs.join(','));
    if (activePreset && dataset.presets[activePreset] && arraysEqual(activeSlugs, validSlugs([...dataset.presets[activePreset]]).slice(0, 5))) {
      url.searchParams.set('preset', activePreset);
    } else {
      url.searchParams.delete('preset');
    }
    url.searchParams.delete('add');
    if (diffMode) url.searchParams.set('diff', '1'); else url.searchParams.delete('diff');
    if (highConfidenceOnly) url.searchParams.set('confidence', 'high'); else url.searchParams.delete('confidence');
    if (showEvidenceNotes) url.searchParams.set('notes', '1'); else url.searchParams.delete('notes');
    window.history.replaceState({}, '', url.toString());
  }

  /* ---------- Goal selector ---------- */

  function renderGoalStates() {
    document.querySelectorAll<HTMLElement>('.goal-pill').forEach((button) => {
      const active = button.dataset.goal === activeGoal;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  /* ---------- Modal ---------- */

  function filterPicker(query: string) {
    const search = query.toLowerCase().trim();
    let shown = 0;
    networkPickerList?.querySelectorAll<HTMLElement>('.network-pick-btn').forEach((button) => {
      const name = button.dataset.name || '';
      const slug = button.dataset.slug || '';
      const visible = (!search || name.includes(search)) && !activeSlugs.includes(slug);
      button.style.display = visible ? '' : 'none';
      if (visible) shown += 1;
    });
    pickerEmpty?.classList.toggle('hidden', shown > 0);
    if (pickerHint) {
      pickerHint.textContent = activeSlugs.length >= 5
        ? 'You are comparing the maximum of 5. Adding one replaces the first provider in the list.'
        : `Comparing ${activeSlugs.length} of 5. Pick a provider to add it.`;
    }
  }

  /* ---------- Focus trap ---------- */

  function trapFocus(event: KeyboardEvent) {
    if (event.key !== 'Tab' || !addNetworkModal) return;
    const focusable = addNetworkModal.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const visibleFocusable = Array.from(focusable).filter((element) => element.offsetParent !== null);
    if (!visibleFocusable.length) return;
    const first = visibleFocusable[0];
    const last = visibleFocusable[visibleFocusable.length - 1];
    if (event.shiftKey) {
      if (document.activeElement === first) { event.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }

  let modalSavedScrollY = 0;
  function openModal() {
    modalSavedScrollY = window.scrollY;
    addNetworkModal?.classList.remove('hidden');
    addNetworkModal?.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overlay-open');
    document.body.style.top = `-${modalSavedScrollY}px`;
    if (networkSearch) networkSearch.value = '';
    filterPicker('');
    document.addEventListener('keydown', trapFocus);
    /* Delay focus to prevent iOS keyboard shifting layout during animation */
    setTimeout(() => networkSearch?.focus(), 100);
  }

  function closeModal() {
    addNetworkModal?.classList.add('hidden');
    addNetworkModal?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('overlay-open');
    document.body.style.top = '';
    document.removeEventListener('keydown', trapFocus);
    window.scrollTo(0, modalSavedScrollY);
    addNetworkBtn?.focus();
  }

  /* ---------- Chip events ---------- */

  function bindChipEvents() {
    const atMinimum = activeSlugs.length <= 2;
    providerChips?.querySelectorAll<HTMLElement>('.remove-provider').forEach((button) => {
      button.style.display = atMinimum ? 'none' : '';
    });
  }

  providerChips?.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLElement>('.remove-provider');
    if (!button) return;
    const slug = button.dataset.slug;
    if (!slug || activeSlugs.length <= 2) return;
    activeSlugs = activeSlugs.filter((candidate) => candidate !== slug);
    activePreset = '';
    activeGoal = '';
    render();
    addNetworkBtn?.focus();
  });

  /* ---------- View toggles ---------- */

  function syncToggleUi() {
    if (diffToggle) diffToggle.checked = diffMode;
    if (confidenceToggle) confidenceToggle.checked = highConfidenceOnly;
    if (notesToggle) notesToggle.checked = showEvidenceNotes;
    resetViewBtn?.classList.toggle('hidden', !(diffMode || highConfidenceOnly || showEvidenceNotes));
  }

  function announce() {
    if (!compareStatus) return;
    const names = activeSlugs.map((slug) => dataset.networkDataMap[slug]?.name.split(' (')[0] || slug).join(', ');
    const modes = [diffMode ? 'differences only' : '', highConfidenceOnly ? 'high-confidence rows' : '', showEvidenceNotes ? 'evidence notes shown' : ''].filter(Boolean).join(', ');
    compareStatus.textContent = `Comparing ${names}${modes ? ` (${modes})` : ''}.`;
  }

  /* ---------- Render ---------- */

  function render() {
    let view;
    try {
      view = buildCompareRender(activeSlugs, dataset, {
        diffMode,
        highConfidenceOnly,
        showEvidenceNotes,
      });
    } catch (err) {
      console.error('[compare] render failed:', err);
      return;
    }

    /* Brief fade on content cards */
    const cards = document.querySelectorAll<HTMLElement>('.compare-main .compare-card');
    cards.forEach((card) => card.classList.add('is-updating'));
    setTimeout(() => {
      cards.forEach((card) => card.classList.remove('is-updating'));
    }, 60);

    /* Control bar */
    if (providerChips) providerChips.innerHTML = view.chipsHtml;
    bindChipEvents();

    /* Metadata */
    if (providerCount) providerCount.textContent = `${activeSlugs.length}/5`;
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
    syncToggleUi();
    announce();

    syncUrl();
    bindTableScrollFade();
    if (!addNetworkModal?.classList.contains('hidden')) {
      filterPicker(networkSearch?.value || '');
    }
  }

  /* ---------- Rail nav scroll-spy ---------- */

  const railIds = ['criticalDiff', 'aiWorkflow', 'commercial', 'compliance', 'fullMatrix', 'methodology'];

  function stickyOffset(): number {
    return 52 + (controlBar?.offsetHeight || 0);
  }

  function updateRailActive() {
    const railLinks = document.querySelectorAll<HTMLElement>('.rail-link');
    if (!railLinks.length) return;
    const line = stickyOffset() + 24;
    let current = railIds[0];
    for (const id of railIds) {
      const element = document.getElementById(id);
      if (element && element.getBoundingClientRect().top <= line) current = id;
    }
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      const last = railIds[railIds.length - 1];
      const lastEl = document.getElementById(last);
      if (lastEl && lastEl.getBoundingClientRect().top < window.innerHeight) current = last;
    }
    railLinks.forEach((link) => {
      const active = link.dataset.rail === current;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
    });
  }

  function updateRailNav() {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { ticking = false; updateRailActive(); });
    }, { passive: true });
    updateRailActive();

    /* Auto-open collapsed <details> when clicking a rail link */
    document.querySelectorAll<HTMLAnchorElement>('.rail-link').forEach((link) => {
      link.addEventListener('click', () => {
        const targetId = link.dataset.rail;
        if (!targetId) return;
        const section = document.getElementById(targetId);
        const details = section?.querySelector('details');
        if (details && !details.open) details.open = true;
      });
    });
  }

  /* ---------- Sticky offsets ---------- */

  function updateStickyOffset() {
    document.documentElement.style.setProperty('--cmp-sticky-top', `${stickyOffset()}px`);
  }
  if (controlBar && 'ResizeObserver' in window) {
    new ResizeObserver(updateStickyOffset).observe(controlBar);
  }
  window.addEventListener('resize', updateStickyOffset, { passive: true });
  updateStickyOffset();

  /* ---------- Event bindings ---------- */

  /* Modal */
  addNetworkBtn?.addEventListener('click', openModal);
  closeModalButton?.addEventListener('click', closeModal);
  modalBackdrop?.addEventListener('click', closeModal);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !addNetworkModal?.classList.contains('hidden')) closeModal();
  });

  networkSearch?.addEventListener('input', (event) => {
    filterPicker((event.target as HTMLInputElement).value);
  });

  networkPickerList?.querySelectorAll<HTMLElement>('.network-pick-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const slug = button.dataset.slug;
      if (!slug || activeSlugs.includes(slug)) return;
      if (activeSlugs.length >= 5) {
        const removedSlug = activeSlugs.shift()!;
        const removedName = dataset.networkDataMap[removedSlug]?.name || removedSlug;
        showToast(`Removed ${removedName} to stay within 5-provider limit`);
      }
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
        activeSlugs = validSlugs([...dataset.presets[preset]]).slice(0, 5);
      }
      render();
    });
  });

  /* View toggles */
  diffToggle?.addEventListener('change', () => { diffMode = diffToggle.checked; render(); });
  confidenceToggle?.addEventListener('change', () => { highConfidenceOnly = confidenceToggle.checked; render(); });
  notesToggle?.addEventListener('change', () => { showEvidenceNotes = notesToggle.checked; render(); });
  resetViewBtn?.addEventListener('click', () => {
    diffMode = false;
    highConfidenceOnly = false;
    showEvidenceNotes = false;
    render();
  });

  /* Show more / fewer critical differences */
  showMoreBtn?.addEventListener('click', () => {
    expandedVisible = !expandedVisible;
    criticalExpandedWrapper?.classList.toggle('hidden', !expandedVisible);
    if (showMoreBtn) {
      showMoreBtn.setAttribute('aria-expanded', String(expandedVisible));
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

  /* ---------- Table scroll affordance ---------- */

  function bindTableScrollFade() {
    document.querySelectorAll<HTMLElement>('.table-shell').forEach((shell) => {
      const wrap = shell.closest<HTMLElement>('.table-wrap');
      const check = () => {
        const scrollable = shell.scrollWidth > shell.clientWidth + 4;
        const atEnd = shell.scrollLeft + shell.clientWidth >= shell.scrollWidth - 4;
        shell.classList.toggle('scrolled-end', atEnd);
        wrap?.classList.toggle('is-scrollable', scrollable);
        wrap?.classList.toggle('at-end', atEnd);
        wrap?.classList.toggle('is-scrolled', shell.scrollLeft > 4);
      };
      if (!shell.dataset.scrollBound) {
        shell.dataset.scrollBound = '1';
        shell.addEventListener('scroll', check, { passive: true });
      }
      check();
    });
  }
  window.addEventListener('resize', bindTableScrollFade, { passive: true });
  document.querySelectorAll('details').forEach((details) => details.addEventListener('toggle', bindTableScrollFade));

  /* ---------- Init ---------- */
  const needsClientRender = !arraysEqual(activeSlugs, dataset.defaultSlugs) || diffMode || highConfidenceOnly || showEvidenceNotes;
  if (needsClientRender) {
    render();
  } else {
    bindChipEvents();
    renderGoalStates();
    syncToggleUi();
    syncUrl();
    bindTableScrollFade();
  }
  updateRailNav();
}
