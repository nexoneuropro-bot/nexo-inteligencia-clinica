/** Local presentation state only. No responses, analytics or preferences are stored. */
let stopEditorialReading: (() => void) | undefined;

function startEditorialReading(): (() => void) | undefined {
  const depthRegions = Array.from(document.querySelectorAll<HTMLElement>('[data-ed-depth]'));
  const shell = document.querySelector<HTMLElement>('[data-ed-surface]');
  const constellation = document.querySelector<HTMLElement>('.ed-constellation');
  if (!depthRegions.length && !shell && !constellation) return;

  const lifecycle = new AbortController();
  const { signal } = lifecycle;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const pauseButton = document.getElementById('experience-pause');
  const surfaceToggle = shell?.querySelector<HTMLButtonElement>('[data-ed-surface-toggle]');
  const chapters = Array.from(shell?.querySelectorAll<HTMLElement>('[data-ed-chapter]') || []);
  const chapterLinks = Array.from(shell?.querySelectorAll<HTMLAnchorElement>('[data-ed-chapter-link]') || []);
  const progress = shell?.querySelector<HTMLElement>('[data-ed-progress]');
  const current = shell?.querySelector<HTMLElement>('[data-ed-current]');
  const toolbar = shell?.querySelector<HTMLElement>('.ed-reader-toolbar');
  const longform = shell?.querySelector<HTMLElement>('.ed-longform');
  const mapNodes = Array.from(constellation?.querySelectorAll<HTMLDetailsElement>('.ed-constellation-node') || []);
  let disposed = false;
  let updateFrame = 0;
  let depthFrame = 0;
  let needsMeasurement = true;
  let activeChapter = -1;
  let chapterStarts: number[] = [];
  let readingStart = 0;
  let readingEnd = 0;
  let readingOffset = 175;
  let pendingDepth: { region: HTMLElement; x: number; y: number } | undefined;

  function clearDepth(region: HTMLElement) {
    region.style.setProperty('--ed-pointer-x', '0px');
    region.style.setProperty('--ed-pointer-y', '0px');
    region.style.setProperty('--ed-tilt-x', '0deg');
    region.style.setProperty('--ed-tilt-y', '0deg');
  }

  function depthAllowed() {
    return !reducedMotion.matches && finePointer.matches && pauseButton?.getAttribute('aria-pressed') !== 'true';
  }

  function resetDepth() {
    pendingDepth = undefined;
    if (depthFrame) cancelAnimationFrame(depthFrame);
    depthFrame = 0;
    depthRegions.forEach(clearDepth);
  }

  function drawDepth() {
    depthFrame = 0;
    if (disposed || !pendingDepth || !depthAllowed()) return;
    const { region, x, y } = pendingDepth;
    pendingDepth = undefined;
    region.style.setProperty('--ed-pointer-x', `${(x * 8).toFixed(2)}px`);
    region.style.setProperty('--ed-pointer-y', `${(y * 5).toFixed(2)}px`);
    region.style.setProperty('--ed-tilt-x', `${(-y * 2).toFixed(2)}deg`);
    region.style.setProperty('--ed-tilt-y', `${(x * 3).toFixed(2)}deg`);
  }

  depthRegions.forEach((region) => {
    region.addEventListener('pointermove', (event) => {
      if (!depthAllowed() || event.pointerType === 'touch') return;
      const bounds = region.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - .5) * 2));
      const y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - .5) * 2));
      pendingDepth = { region, x, y };
      if (!depthFrame) depthFrame = requestAnimationFrame(drawDepth);
    }, { signal, passive: true });
    region.addEventListener('pointerleave', () => {
      if (pendingDepth?.region === region) pendingDepth = undefined;
      clearDepth(region);
    }, { signal, passive: true });
  });
  reducedMotion.addEventListener('change', resetDepth, { signal });
  finePointer.addEventListener('change', resetDepth, { signal });
  const pauseObserver = pauseButton ? new MutationObserver(() => { if (!depthAllowed()) resetDepth(); }) : undefined;
  if (pauseButton) pauseObserver?.observe(pauseButton, { attributes: true, attributeFilter: ['aria-pressed'] });

  function measureReading() {
    needsMeasurement = false;
    const scrollY = window.scrollY;
    const headerHeight = document.querySelector<HTMLElement>('.ex-header')?.getBoundingClientRect().height || 80;
    const anchorOffset = Math.max(0, ...chapters.map((chapter) => Number.parseFloat(getComputedStyle(chapter).scrollMarginTop) || 0));
    // Match native anchor placement at each breakpoint. A small tolerance
    // includes the target despite subpixel rounding at the settled position.
    readingOffset = Math.max(headerHeight + (toolbar?.getBoundingClientRect().height || 0) + 24, anchorOffset) + 8;
    chapterStarts = chapters.map((chapter) => chapter.getBoundingClientRect().top + scrollY);
    readingStart = chapterStarts[0] || 0;
    const end = shell?.querySelector<HTMLElement>('.ed-references') || chapters.at(-1) || longform;
    readingEnd = end ? end.getBoundingClientRect().bottom + scrollY : readingStart;
  }

  function updateReading() {
    updateFrame = 0;
    if (disposed || !shell || !chapters.length || shell.dataset.edMode === 'magazine') return;
    if (needsMeasurement) measureReading();
    const position = window.scrollY + readingOffset;
    const range = Math.max(1, readingEnd - readingStart - Math.max(0, innerHeight - readingOffset));
    const value = Math.max(0, Math.min(1, (position - readingStart) / range));
    progress?.style.setProperty('--ed-progress', value.toFixed(4));
    let index = 0;
    for (let i = 1; i < chapterStarts.length; i += 1) {
      if (chapterStarts[i] <= position) index = i;
      else break;
    }
    if (index !== activeChapter) {
      activeChapter = index;
      if (current) current.textContent = String(index + 1).padStart(2, '0');
      const id = chapters[index].id;
      chapterLinks.forEach((link) => {
        if (link.dataset.edChapterLink === id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      shell.dataset.edCurrentChapter = id;
    }
  }

  function scheduleReading(measure = false) {
    if (disposed) return;
    needsMeasurement ||= measure;
    if (!updateFrame) updateFrame = requestAnimationFrame(updateReading);
  }

  if (shell) {
    shell.dataset.edReaderReady = 'true';
    shell.dataset.edSurface ||= 'ivory';
    surfaceToggle?.setAttribute('aria-pressed', 'false');
    surfaceToggle?.addEventListener('click', () => {
      const night = shell.dataset.edSurface !== 'night';
      shell.dataset.edSurface = night ? 'night' : 'ivory';
      surfaceToggle.setAttribute('aria-pressed', String(night));
      surfaceToggle.textContent = 'Leitura noturna';
      scheduleReading(true);
    }, { signal });
    window.addEventListener('scroll', () => scheduleReading(), { signal, passive: true });
    window.addEventListener('resize', () => scheduleReading(true), { signal, passive: true });
    scheduleReading(true);
  }
  const readingObserver = shell ? new ResizeObserver(() => scheduleReading(true)) : undefined;
  if (shell) readingObserver?.observe(shell);
  if (longform) readingObserver?.observe(longform);
  if (toolbar) readingObserver?.observe(toolbar);
  if (document.fonts) void document.fonts.ready.then(() => { if (!disposed) scheduleReading(true); });

  // Native details stay usable without JavaScript. Enhancement keeps one map
  // description open and lets Escape return focus to its own summary.
  mapNodes.forEach((node) => node.addEventListener('toggle', () => {
    if (node.open) mapNodes.forEach((other) => { if (other !== node) other.open = false; });
  }, { signal }));
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const open = mapNodes.filter((node) => node.open);
    if (!open.length) return;
    const focused = (event.target instanceof Element ? event.target.closest<HTMLDetailsElement>('.ed-constellation-node') : null) || open.at(-1);
    open.forEach((node) => { node.open = false; });
    focused?.querySelector<HTMLElement>('summary')?.focus({ preventScroll: true });
    event.preventDefault();
  }, { signal });

  return () => {
    disposed = true;
    lifecycle.abort();
    if (updateFrame) cancelAnimationFrame(updateFrame);
    updateFrame = 0;
    resetDepth();
    readingObserver?.disconnect();
    pauseObserver?.disconnect();
  };
}

function bootEditorialReading() {
  stopEditorialReading?.();
  try{stopEditorialReading = startEditorialReading();}
  catch(error){console.warn('A leitura permanece disponível sem os efeitos opcionais.',error);}
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootEditorialReading, { once: true });
  else bootEditorialReading();
  window.addEventListener('pagehide', () => { stopEditorialReading?.(); stopEditorialReading = undefined; });
  window.addEventListener('pageshow', (event) => { if (event.persisted) bootEditorialReading(); });
}

export {};
