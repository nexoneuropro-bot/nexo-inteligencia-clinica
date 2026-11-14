/** Presentation state only. No assessment, candidate information or preferences are stored. */
let stopBusinessServices: (() => void) | undefined;

function startBusinessServices(): (() => void) | undefined {
  const roots = Array.from(document.querySelectorAll<HTMLElement>('[data-bs-root]'));
  if (!roots.length) return;
  const lifecycle = new AbortController();
  const { signal } = lifecycle;
  const quiet = matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = matchMedia('(max-width: 820px)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const pause = document.getElementById('experience-pause');
  let frame = 0;
  let pending: { map: HTMLElement; x: number; y: number } | undefined;

  const clearDepth = () => {
    pending = undefined;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    roots.forEach(root => {
      const map = root.querySelector<HTMLElement>('[data-bs-map]');
      map?.style.setProperty('--bs-depth-x', '0px');
      map?.style.setProperty('--bs-depth-y', '0px');
      map?.style.setProperty('--bs-tilt-x', '0deg');
      map?.style.setProperty('--bs-tilt-y', '0deg');
    });
  };
  const depthAllowed = () => !quiet.matches && !narrow.matches && pointer.matches && pause?.getAttribute('aria-pressed') !== 'true';
  const drawDepth = () => {
    frame = 0;
    if (!pending || !depthAllowed()) return;
    const { map, x, y } = pending;
    pending = undefined;
    map.style.setProperty('--bs-depth-x', `${(x * 7).toFixed(2)}px`);
    map.style.setProperty('--bs-depth-y', `${(y * 5).toFixed(2)}px`);
    map.style.setProperty('--bs-tilt-x', `${(-y * 2).toFixed(2)}deg`);
    map.style.setProperty('--bs-tilt-y', `${(x * 3).toFixed(2)}deg`);
  };

  roots.forEach(root => {
    const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-bs-select]'));
    const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-bs-panel]'));
    const status = root.querySelector<HTMLElement>('[data-bs-status]');
    const map = root.querySelector<HTMLElement>('[data-bs-map]');
    if (!buttons.length || buttons.length !== panels.length) return;

    const select = (id: string, userInitiated: boolean) => {
      const selected = panels.find(panel => panel.dataset.bsPanel === id);
      const button = buttons.find(item => item.dataset.bsSelect === id);
      if (!selected || !button) return;
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      panels.forEach(panel => { panel.hidden = panel !== selected; });
      root.dataset.bsActive = id;
      if (userInitiated && status) status.textContent = `Frente selecionada: ${button.querySelector('span:nth-child(2)')?.textContent || ''}.`;
      if (userInitiated && narrow.matches) {
        const heading = selected.querySelector<HTMLElement>('h3');
        heading?.focus({ preventScroll: true });
        heading?.scrollIntoView({ block: 'start', behavior: quiet.matches ? 'instant' : 'smooth' });
      }
    };

    root.dataset.bsEnhanced = 'true';
    const hashPanel = panels.find(panel => `#${panel.id}` === window.location.hash);
    select(hashPanel?.dataset.bsPanel || buttons[0].dataset.bsSelect || '', false);
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => select(button.dataset.bsSelect || '', true), { signal });
      button.addEventListener('keydown', event => {
        let next = index;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % buttons.length;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + buttons.length) % buttons.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = buttons.length - 1;
        else return;
        event.preventDefault();
        buttons[next].focus();
        select(buttons[next].dataset.bsSelect || '', false);
        if (status) status.textContent = `Frente selecionada: ${buttons[next].querySelector('span:nth-child(2)')?.textContent || ''}.`;
      }, { signal });
    });
    window.addEventListener('hashchange', () => {
      const target = panels.find(panel => `#${panel.id}` === window.location.hash);
      if (target?.dataset.bsPanel) select(target.dataset.bsPanel, false);
    }, { signal });
    map?.addEventListener('pointermove', event => {
      if (!depthAllowed() || event.pointerType === 'touch') return;
      const bounds = map.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      pending = {
        map,
        x: Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - .5) * 2)),
        y: Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - .5) * 2)),
      };
      if (!frame) frame = requestAnimationFrame(drawDepth);
    }, { signal, passive: true });
    map?.addEventListener('pointerleave', clearDepth, { signal, passive: true });
  });

  [quiet, narrow, pointer].forEach(media => media.addEventListener('change', clearDepth, { signal }));
  const pauseObserver = pause ? new MutationObserver(() => { if (!depthAllowed()) clearDepth(); }) : undefined;
  if (pause) pauseObserver?.observe(pause, { attributes: true, attributeFilter: ['aria-pressed'] });
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearDepth(); }, { signal });

  return () => {
    lifecycle.abort();
    pauseObserver?.disconnect();
    clearDepth();
  };
}

function bootBusinessServices() {
  stopBusinessServices?.();
  stopBusinessServices = startBusinessServices();
}
bootBusinessServices();
document.addEventListener('astro:page-load', bootBusinessServices);
document.addEventListener('astro:before-swap', () => { stopBusinessServices?.(); stopBusinessServices = undefined; });
window.addEventListener('pagehide', () => { stopBusinessServices?.(); stopBusinessServices = undefined; });
window.addEventListener('pageshow', event => { if (event.persisted) bootBusinessServices(); });
