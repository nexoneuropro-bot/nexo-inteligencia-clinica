/** Home only: a silent, optional film over complete, navigable HTML. */
function initializeHomeOpening() {
  const opening = document.querySelector<HTMLElement>('[data-home-opening]');
  const video = opening?.querySelector<HTMLVideoElement>('[data-opening-video]');
  const paths = opening?.querySelector<HTMLElement>('[data-opening-paths]');
  const skip = opening?.querySelector<HTMLButtonElement>('[data-opening-skip]');
  const explore = opening?.querySelector<HTMLAnchorElement>('[data-opening-explore]');
  const replay = document.querySelector<HTMLButtonElement>('[data-opening-replay]');
  const firstChoice = opening?.querySelector<HTMLAnchorElement>('[data-opening-choice]');
  const status = opening?.querySelector<HTMLElement>('[data-opening-status]');
  if (!opening || !video || !paths || !skip || !explore || !replay || !firstChoice) return;
  if (opening.dataset.openingReady === 'true') return;
  opening.dataset.openingReady = 'true';

  const quiet = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  // A session flag remembers only that the opening was seen, never a chosen audience.
  const seenKey = 'nexo-home-opening-seen-v1';
  let seen = false;
  try { seen = sessionStorage.getItem(seenKey) === '1'; } catch { /* Optional presentation preference. */ }
  let active = false;
  let loadDeadline = 0;
  let finishDeadline = 0;
  let returnFocus: HTMLElement | null = null;
  const outside = new Map<HTMLElement, boolean>();

  function clearDeadlines() {
    window.clearTimeout(loadDeadline);
    window.clearTimeout(finishDeadline);
  }

  // Preserve existing inert states and never inert an ancestor of the opening.
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
    const focusedSkip = document.activeElement === skip;
    clearDeadlines();
    video!.pause();
    opening!.dataset.state = 'choices';
    delete opening!.dataset.videoVisible;
    paths!.hidden = false;
    skip!.hidden = true;
    seen = true;
    try { sessionStorage.setItem(seenKey, '1'); } catch { /* Navigation does not depend on storage. */ }
    if (status) status.textContent = 'Escolha por onde começar.';
    if (moveFocus || focusedSkip) firstChoice!.focus({ preventScroll: true });
  }

  function closeOpening(focusNarrative: boolean) {
    clearDeadlines();
    active = false;
    video!.pause();
    delete opening!.dataset.videoVisible;
    opening!.dataset.state = 'closed';
    opening!.hidden = true;
    document.body.classList.remove('home-opening-open');
    for (const [element, wasInert] of outside) element.inert = wasInert;
    outside.clear();
    replay!.hidden = false;
    window.dispatchEvent(new CustomEvent('nexo:opening-dismissed'));
    if (!focusNarrative) return;
    const title = document.getElementById('intro-title');
    if (title instanceof HTMLElement) {
      title.tabIndex = -1;
      document.getElementById('experience-intro')?.scrollIntoView({ behavior: 'instant', block: 'start' });
      title.focus({ preventScroll: true });
    } else returnFocus?.focus({ preventScroll: true });
  }

  function openOpening(trigger: HTMLElement | null = null, replayFilm = false) {
    returnFocus = trigger;
    active = true;
    opening!.hidden = false;
    opening!.dataset.enhanced = 'true';
    delete opening!.dataset.videoVisible;
    replay!.hidden = true;
    setOutsideInert();
    document.body.classList.add('home-opening-open');
    window.dispatchEvent(new CustomEvent('nexo:opening-opened'));
    if (status) status.textContent = '';
    video!.muted = true;
    video!.defaultMuted = true;
    video!.volume = 0;

    if (quiet.matches || connection?.saveData || (seen && !replayFilm)) {
      showChoices();
      firstChoice!.focus({ preventScroll: true });
      return;
    }

    paths!.hidden = true;
    skip!.hidden = false;
    opening!.dataset.state = 'playing';
    skip!.focus({ preventScroll: true });
    // A failed, blocked or slow film always yields to the real navigation.
    loadDeadline = window.setTimeout(() => showChoices(), 2000);
    finishDeadline = window.setTimeout(() => showChoices(), 4500);
    if (!video!.getAttribute('src')) video!.src = video!.dataset.src || '';
    try {
      video!.currentTime = 0;
      void video!.play().catch(() => showChoices());
    } catch { showChoices(); }
  }

  skip.addEventListener('click', () => showChoices(true));
  explore.addEventListener('click', event => {
    event.preventDefault();
    closeOpening(true);
  });
  replay.addEventListener('click', () => openOpening(replay, true));
  video.addEventListener('playing', () => {
    if (!active || opening.dataset.state !== 'playing') { video.pause(); return; }
    window.clearTimeout(loadDeadline);
    opening.dataset.videoVisible = 'true';
  });
  video.addEventListener('ended', () => showChoices());
  video.addEventListener('error', () => showChoices());
  opening.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !active) return;
    event.preventDefault();
    if (opening.dataset.state === 'playing') showChoices(true);
    else closeOpening(true);
  });
  quiet.addEventListener('change', () => { if (quiet.matches) showChoices(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && active && opening.dataset.state === 'playing') showChoices();
  });
  window.addEventListener('pagehide', () => video.pause());
  window.addEventListener('pageshow', event => {
    if (event.persisted && active && opening.dataset.state === 'playing') showChoices();
  });

  // Anchored home links keep their destination; service and article pages never import this component.
  if (location.hash && location.hash !== '#home-opening') closeOpening(false);
  else openOpening();
}

const bootHomeOpening = () => requestAnimationFrame(initializeHomeOpening);
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootHomeOpening, { once: true });
else bootHomeOpening();
window.addEventListener('pageshow', bootHomeOpening);
