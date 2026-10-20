import { createSynapticOpening, SYNAPTIC_OPENING_DURATION, type SynapticOpeningController } from '../lib/synaptic-opening.mjs';

/** A silent home film; service pages and indexed HTML never depend on it. */
function initializeHomeOpening() {
  const opening = document.querySelector<HTMLElement>('[data-home-opening]');
  const canvas = opening?.querySelector<HTMLCanvasElement>('[data-opening-canvas]');
  const paths = opening?.querySelector<HTMLElement>('[data-opening-paths]');
  const skip = opening?.querySelector<HTMLButtonElement>('[data-opening-skip]');
  const pause = opening?.querySelector<HTMLButtonElement>('[data-opening-pause]');
  const explore = opening?.querySelector<HTMLAnchorElement>('[data-opening-explore]');
  const replay = document.querySelector<HTMLButtonElement>('[data-opening-replay]');
  const replayInline = opening?.querySelector<HTMLButtonElement>('[data-opening-replay-inline]');
  const firstChoice = opening?.querySelector<HTMLAnchorElement>('[data-opening-choice]');
  const status = opening?.querySelector<HTMLElement>('[data-opening-status]');
  if (!opening || !canvas || !paths || !skip || !pause || !explore || !replay || !replayInline || !firstChoice) return;
  if (opening.dataset.openingReady === 'true') return;
  opening.dataset.openingReady = 'true';

  const quiet = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  // This remembers only the presentation, never the visitor's chosen audience.
  const seenKey = 'nexo-home-opening-seen-v2';
  let seen = false;
  try { seen = sessionStorage.getItem(seenKey) === '1'; } catch { /* Presentation works without storage. */ }
  let active = false;
  let paused = false;
  let film: SynapticOpeningController | null = null;
  let loadDeadline = 0;
  let finishDeadline = 0;
  let returnFocus: HTMLElement | null = null;
  const outside = new Map<HTMLElement, boolean>();

  function clearDeadlines() {
    window.clearTimeout(loadDeadline);
    window.clearTimeout(finishDeadline);
  }
  function resetPause() {
    paused = false;
    opening!.dataset.paused = 'false';
    pause!.setAttribute('aria-pressed', 'false');
    pause!.textContent = 'Pausar';
  }
  function setReplayLabels() {
    const staticEntry = quiet.matches || connection?.saveData;
    replayInline!.textContent = staticEntry ? 'Reabrir início ↻' : 'Rever abertura ↻';
    replay!.textContent = staticEntry ? 'Reabrir início ↻' : 'Rever abertura ↻';
  }
  // Keep existing inert states, including siblings at every ancestor level.
  function setOutsideInert() {
    let branch: HTMLElement = opening!;
    while (branch.parentElement) {
      for (const sibling of branch.parentElement.children) {
        if (sibling instanceof HTMLElement && sibling !== branch && !outside.has(sibling)) {
          outside.set(sibling, sibling.inert);
          sibling.inert = true;
        }
      }
      if (branch.parentElement === document.body) break;
      branch = branch.parentElement;
    }
  }
  function showChoices(moveFocus = false) {
    if (!active) return;
    const focusedControl = document.activeElement === skip || document.activeElement === pause;
    clearDeadlines();
    resetPause();
    opening!.dataset.state = 'choices';
    opening!.style.setProperty('--opening-brand-opacity', '1');
    paths!.inert = false;
    paths!.removeAttribute('aria-hidden');
    skip!.hidden = true;
    pause!.hidden = true;
    replayInline!.hidden = false;
    film?.finish();
    seen = true;
    try { sessionStorage.setItem(seenKey, '1'); } catch { /* Optional session preference. */ }
    setReplayLabels();
    if (status) status.textContent = 'Escolha Para mim ou Para minha empresa, ou explore a NEXO.';
    if (moveFocus || focusedControl) firstChoice!.focus({ preventScroll: true });
  }
  function closeOpening(focusNarrative: boolean) {
    clearDeadlines();
    active = false;
    film?.pause();
    resetPause();
    opening!.dataset.state = 'closed';
    opening!.hidden = true;
    opening!.removeAttribute('role');
    opening!.removeAttribute('aria-modal');
    document.body.classList.remove('home-opening-open');
    for (const [element, wasInert] of outside) element.inert = wasInert;
    outside.clear();
    replayInline!.hidden = true;
    replay!.hidden = false;
    setReplayLabels();
    window.dispatchEvent(new CustomEvent('nexo:opening-dismissed'));
    if (!focusNarrative) {
      if (returnFocus) {
        const target = opening!.contains(returnFocus) ? replay : returnFocus;
        target?.focus({ preventScroll: true });
      }
      return;
    }
    const title = document.getElementById('intro-title');
    if (title instanceof HTMLElement) {
      title.tabIndex = -1;
      document.getElementById('experience-intro')?.scrollIntoView({ behavior: 'instant', block: 'start' });
      title.focus({ preventScroll: true });
    } else returnFocus?.focus({ preventScroll: true });
  }
  function armFinishDeadline() {
    window.clearTimeout(finishDeadline);
    const remaining = Math.max(0, SYNAPTIC_OPENING_DURATION - (film?.elapsed || 0));
    // A stalled frame scheduler yields to real navigation; a user pause never does.
    finishDeadline = window.setTimeout(() => {
      if (active && !paused && opening!.dataset.state === 'playing') showChoices();
    }, remaining + 1500);
  }
  function ensureFilm() {
    if (film) return film;
    film = createSynapticOpening(canvas!, {
      onFrame: ({ brandOpacity }) => {
        window.clearTimeout(loadDeadline);
        if (active && opening!.dataset.state === 'playing') {
          opening!.style.setProperty('--opening-brand-opacity', String(brandOpacity));
        }
      },
      onComplete: () => showChoices(),
      onError: () => {
        // Dispose before restoring choices: a failed renderer must not retry recursively.
        const failedFilm = film;
        film = null;
        failedFilm?.destroy();
        showChoices();
      },
    });
    return film;
  }
  function openOpening(trigger: HTMLElement | null = null, replayFilm = false) {
    returnFocus = trigger;
    clearDeadlines();
    active = true;
    resetPause();
    opening!.hidden = false;
    opening!.dataset.enhanced = 'true';
    opening!.setAttribute('role', 'dialog');
    opening!.setAttribute('aria-modal', 'true');
    replay!.hidden = true;
    replayInline!.hidden = true;
    setOutsideInert();
    document.body.classList.add('home-opening-open');
    window.dispatchEvent(new CustomEvent('nexo:opening-opened'));
    if (status) status.textContent = '';
    if (quiet.matches || connection?.saveData || (seen && !replayFilm)) {
      showChoices();
      firstChoice!.focus({ preventScroll: true });
      return;
    }
    opening!.dataset.state = 'playing';
    opening!.style.setProperty('--opening-brand-opacity', '0');
    paths!.inert = true;
    paths!.setAttribute('aria-hidden', 'true');
    skip!.hidden = false;
    pause!.hidden = false;
    skip!.focus({ preventScroll: true });
    loadDeadline = window.setTimeout(() => showChoices(), 2000);
    try {
      const currentFilm = ensureFilm();
      if (!currentFilm) { showChoices(); return; }
      currentFilm.play();
      if (opening!.dataset.state === 'playing') armFinishDeadline();
    } catch {
      film?.destroy();
      film = null;
      showChoices();
    }
  }

  skip.addEventListener('click', () => showChoices(true));
  pause.addEventListener('click', () => {
    if (!active || opening.dataset.state !== 'playing' || !film) return;
    paused = !paused;
    opening.dataset.paused = String(paused);
    pause.setAttribute('aria-pressed', String(paused));
    pause.textContent = paused ? 'Retomar' : 'Pausar';
    if (paused) {
      clearDeadlines();
      film.pause();
    } else {
      film.resume();
      armFinishDeadline();
    }
    if (status) status.textContent = paused ? 'Abertura pausada.' : 'Abertura em reprodução.';
  });
  explore.addEventListener('click', event => { event.preventDefault(); closeOpening(true); });
  replay.addEventListener('click', () => openOpening(replay, true));
  replayInline.addEventListener('click', () => openOpening(replayInline, true));
  opening.addEventListener('keydown', event => {
    if (!active) return;
    if (event.key === 'Tab' && !event.altKey && !event.ctrlKey && !event.metaKey) {
      const controls = Array.from(opening.querySelectorAll<HTMLElement>('a[href],button:not([disabled])'))
        .filter(element => !element.closest('[hidden],[inert]') && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden');
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (first && last) {
        const outsideOpening = !opening.contains(document.activeElement);
        if (event.shiftKey && (document.activeElement === first || outsideOpening)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || outsideOpening)) {
          event.preventDefault();
          first.focus();
        }
      }
      return;
    }
    if (event.key !== 'Escape') return;
    event.preventDefault();
    if (opening.dataset.state === 'playing') showChoices(true);
    else closeOpening(returnFocus === null);
  });
  opening.addEventListener('pointermove', event => {
    if (!active || paused || quiet.matches || connection?.saveData) return;
    const bounds = opening.getBoundingClientRect();
    if (bounds.width && bounds.height) film?.setPointer((event.clientX - bounds.left) / bounds.width * 2 - 1, (event.clientY - bounds.top) / bounds.height * 2 - 1);
  }, { passive: true });
  opening.addEventListener('pointerleave', () => film?.setPointer(0, 0));
  quiet.addEventListener('change', () => { if (quiet.matches) showChoices(); setReplayLabels(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && active && opening.dataset.state === 'playing') showChoices();
  });
  window.addEventListener('pagehide', () => { clearDeadlines(); film?.pause(); });
  window.addEventListener('pageshow', event => {
    if (event.persisted && active && opening.dataset.state === 'playing') showChoices();
  });
  // Deep links keep their destination. Internal pages never import this opening.
  if (location.hash && location.hash !== '#home-opening') closeOpening(false);
  else openOpening();
}

const bootHomeOpening = () => requestAnimationFrame(initializeHomeOpening);
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootHomeOpening, { once: true });
else bootHomeOpening();
window.addEventListener('pageshow', bootHomeOpening);
