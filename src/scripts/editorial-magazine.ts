import { magazineStep, magazineVisiblePages } from '../lib/magazine-pages';

export interface MagazineState { page: number; pages: number; spread: boolean; visiblePages: number[]; open: boolean; fontScale: number }
export interface MagazineController {
  open(options?: { page?: number; focus?: boolean }): void;
  close(): void;
  goTo(page: number, options?: { focus?: boolean }): void;
  getState(): MagazineState;
  destroy(): void;
}

const controllers = new WeakMap<HTMLElement, MagazineController>();
const interactive = 'input,select,textarea,button,a,summary,[contenteditable="true"],[role="slider"],[role="textbox"],[role="radio"],[role="checkbox"],dialog,[role="dialog"],[data-editorial-quiz]';

/**
 * Integration: the article starts in continuous HTML mode. Call
 * getMagazineController(root)?.open({focus:true}) when its Revista button is used.
 * The controller only changes the magazine visibility, never the continuous
 * article. The parent owns that toggle and listens for ed:magazine-close.
 * Position and text size stay in memory, with no persistence/network requests.
 */
export function getMagazineController(root: HTMLElement): MagazineController {
  const current = controllers.get(root);
  if (current) return current;
  return createMagazineController(root);
}

function createMagazineController(root: HTMLElement): MagazineController {
  const lifecycle = new AbortController();
  const { signal } = lifecycle;
  const pages = Array.from(root.querySelectorAll<HTMLElement>('[data-mag-page]'));
  const stage = root.querySelector<HTMLElement>('[data-mag-stage]');
  const book = root.querySelector<HTMLElement>('[data-mag-book]');
  const drawer = root.querySelector<HTMLElement>('[data-mag-drawer]');
  const contentsToggle = root.querySelector<HTMLButtonElement>('[data-mag-contents]');
  const fullButton = root.querySelector<HTMLButtonElement>('[data-mag-fullscreen]');
  const sizeOutput = root.querySelector<HTMLOutputElement>('[data-mag-size]');
  const live = root.querySelector<HTMLElement>('[data-mag-live]');
  const wide = matchMedia('(min-width: 1060px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let page = 0;
  let fontScale = 1;
  let opened = !root.hidden;
  let lastTrigger: HTMLElement | null = null;
  let turnTimer: number | undefined;
  let touch: { x: number; y: number; time: number } | undefined;
  let disposed = false;

  const state = (): MagazineState => ({ page, pages: pages.length, spread: wide.matches,
    visiblePages: magazineVisiblePages(page, pages.length, wide.matches), open: opened, fontScale });

  function setDrawer(open: boolean, returnFocus = false) {
    if (!drawer || !contentsToggle) return;
    drawer.hidden = !open;
    contentsToggle.setAttribute('aria-expanded', String(open));
    if (open) drawer.querySelector<HTMLElement>('button')?.focus({ preventScroll: true });
    else if (returnFocus) contentsToggle.focus({ preventScroll: true });
  }

  function render(announce = true) {
    const visible = magazineVisiblePages(page, pages.length, wide.matches);
    root.dataset.magSpread = String(wide.matches);
    root.dataset.magPage = String(page);
    root.style.setProperty('--mag-font-scale', String(fontScale));
    book?.classList.toggle('ed-mag-book-single', visible.length === 1);
    pages.forEach((element, index) => {
      element.hidden = !visible.includes(index);
      element.classList.toggle('ed-mag-page-left', visible.length > 1 && index === visible[0]);
      element.classList.toggle('ed-mag-page-right', visible.length > 1 && index === visible[1]);
    });
    const last = visible[visible.length - 1] ?? 0;
    const label = visible.length > 1 ? `Páginas ${visible[0] + 1}–${last + 1} de ${pages.length}` : `Página ${(visible[0] ?? 0) + 1} de ${pages.length}`;
    root.querySelectorAll<HTMLElement>('[data-mag-indicator],[data-mag-bottom-indicator]').forEach(element => { element.textContent = label; });
    root.querySelectorAll<HTMLButtonElement>('[data-mag-previous]').forEach(button => { button.disabled = !visible.length || visible[0] === 0; });
    root.querySelectorAll<HTMLButtonElement>('[data-mag-next]').forEach(button => { button.disabled = last >= pages.length - 1; });
    root.querySelectorAll<HTMLButtonElement>('[data-mag-smaller]').forEach(button => { button.disabled = fontScale <= 1; });
    root.querySelectorAll<HTMLButtonElement>('[data-mag-larger]').forEach(button => { button.disabled = fontScale >= 1.6; });
    if (sizeOutput) sizeOutput.textContent = `${Math.round(fontScale * 100)}%`;
    if (live && announce && opened) live.textContent = `${label}. ${visible.map(index => pages[index]?.getAttribute('aria-label')?.replace(/^Página \d+: /u, '')).join(' / ')}`;
    root.dispatchEvent(new CustomEvent('ed:magazine-change', { bubbles: true, detail: state() }));
  }

  function goTo(nextPage: number, options: { focus?: boolean } = {}) {
    if (disposed || !pages.length) return;
    const previous = page;
    const target = Number.isFinite(nextPage) ? Math.trunc(nextPage) : 0;
    page = Math.max(0, Math.min(pages.length - 1, target));
    const focused = document.activeElement;
    const oldPage = focused instanceof Element ? focused.closest<HTMLElement>('[data-mag-page]') : null;
    render();
    if (previous !== page && !reducedMotion.matches) {
      root.dataset.magTurn = page > previous ? 'forward' : 'backward';
      if (turnTimer !== undefined) clearTimeout(turnTimer);
      turnTimer = window.setTimeout(() => { delete root.dataset.magTurn; }, 350);
    }
    // Never strand focus on a now-hidden page after a contents link or keyboard turn.
    if (options.focus || (oldPage && oldPage.hidden)) {
      const targetPage = pages[page];
      targetPage?.querySelector<HTMLElement>('[data-mag-page-scroll]')?.focus({ preventScroll: true });
    }
  }

  const controller: MagazineController = {
    open(options = {}) {
      if (disposed) return;
      if (!opened && document.activeElement instanceof HTMLElement) lastTrigger = document.activeElement;
      opened = true;
      root.hidden = false;
      if (options.page !== undefined) goTo(options.page);
      else render();
      if (options.focus !== false) root.querySelector<HTMLElement>('[data-mag-contents]')?.focus({ preventScroll: true });
    },
    close() {
      if (disposed) return;
      opened = false;
      setDrawer(false);
      root.hidden = true;
      if (document.fullscreenElement === root) void document.exitFullscreen().catch(() => undefined);
      root.dispatchEvent(new CustomEvent('ed:magazine-closed', { bubbles: true, detail: state() }));
      // The parent may reveal its continuous reader synchronously on this event.
      lastTrigger?.focus({ preventScroll: true });
    },
    goTo,
    getState: state,
    destroy() {
      disposed = true;
      lifecycle.abort();
      if (turnTimer !== undefined) clearTimeout(turnTimer);
      controllers.delete(root);
    },
  };
  controllers.set(root, controller);

  root.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest<HTMLElement>('button') : null;
    if (!target || !root.contains(target) || target.matches(':disabled')) return;
    if (target.hasAttribute('data-mag-previous')) goTo(magazineStep(page, pages.length, wide.matches, -1));
    else if (target.hasAttribute('data-mag-next')) goTo(magazineStep(page, pages.length, wide.matches, 1));
    else if (target.hasAttribute('data-mag-goto')) { goTo(Number(target.dataset.magGoto), { focus: true }); setDrawer(false); }
    else if (target.hasAttribute('data-mag-contents')) setDrawer(Boolean(drawer?.hidden));
    else if (target.hasAttribute('data-mag-smaller') || target.hasAttribute('data-mag-larger')) {
      fontScale = Math.round(Math.min(1.6, Math.max(1, fontScale + (target.hasAttribute('data-mag-larger') ? .15 : -.15))) * 100) / 100;
      render(false);
    } else if (target.hasAttribute('data-mag-fullscreen')) {
      if (document.fullscreenElement === root) void document.exitFullscreen().catch(() => undefined);
      else if (root.requestFullscreen) void root.requestFullscreen().catch(() => {
        if (live) live.textContent = 'O navegador não permitiu tela cheia. A leitura e a ampliação de texto continuam disponíveis.';
      });
    } else if (target.hasAttribute('data-mag-close')) {
      root.dispatchEvent(new CustomEvent('ed:magazine-close', { bubbles: true, detail: state() }));
      if (opened) controller.close();
    } else if (target.hasAttribute('data-mag-quiz-request')) {
      root.dispatchEvent(new CustomEvent('ed:quiz-request', { bubbles: true, detail: { source: 'magazine', page, slug: root.dataset.magazineSlug, trigger: target } }));
    }
  }, { signal });

  root.addEventListener('keydown', (event) => {
    if (!opened || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target instanceof Element && event.target.closest(interactive)) return;
    if (window.getSelection()?.toString()) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(magazineStep(page, pages.length, wide.matches, event.key === 'ArrowRight' ? 1 : -1));
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      goTo(event.key === 'Home' ? 0 : pages.length - 1);
    }
  }, { signal });
  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && drawer && !drawer.hidden) { setDrawer(false, true); event.preventDefault(); }
  }, { signal });

  // Passive listeners preserve native vertical scrolling, text selection and pinch
  // zoom. Only a short, clearly horizontal one-finger gesture changes a page.
  stage?.addEventListener('touchstart', (event) => {
    touch = undefined;
    if (event.touches.length !== 1 || (event.target instanceof Element && event.target.closest(interactive))) return;
    const point = event.touches[0];
    touch = { x: point.clientX, y: point.clientY, time: performance.now() };
  }, { signal, passive: true });
  stage?.addEventListener('touchend', (event) => {
    const start = touch;
    touch = undefined;
    if (!start || event.touches.length || event.changedTouches.length !== 1 || window.getSelection()?.toString()) return;
    const point = event.changedTouches[0];
    const dx = point.clientX - start.x;
    const dy = point.clientY - start.y;
    if (performance.now() - start.time > 650 || Math.abs(dx) < 72 || Math.abs(dx) < Math.abs(dy) * 1.8) return;
    // A table owns horizontal gestures within its scrollable contents.
    if (event.target instanceof Element && event.target.closest('.ed-mag-table')) return;
    goTo(magazineStep(page, pages.length, wide.matches, dx < 0 ? 1 : -1));
  }, { signal, passive: true });
  stage?.addEventListener('touchcancel', () => { touch = undefined; }, { signal, passive: true });

  wide.addEventListener('change', () => render(false), { signal });
  document.addEventListener('fullscreenchange', () => {
    if (fullButton) {
      const full = document.fullscreenElement === root;
      fullButton.setAttribute('aria-pressed', String(full));
      fullButton.textContent = full ? 'Sair da tela cheia' : 'Tela cheia';
    }
  }, { signal });
  if (fullButton && !document.fullscreenEnabled) fullButton.hidden = true;
  root.addEventListener('ed:magazine-open', (event) => {
    controller.open((event as CustomEvent<{ page?: number; focus?: boolean }>).detail || {});
  }, { signal });
  root.addEventListener('ed:magazine-close', () => controller.close(), { signal });
  root.dataset.magReady = 'true';
  render(false);
  return controller;
}

export function initializeEditorialMagazines(): void {
  document.querySelectorAll<HTMLElement>('[data-ed-magazine]').forEach(getMagazineController);
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeEditorialMagazines, { once: true });
  else initializeEditorialMagazines();
  document.addEventListener('astro:page-load', initializeEditorialMagazines);
}
