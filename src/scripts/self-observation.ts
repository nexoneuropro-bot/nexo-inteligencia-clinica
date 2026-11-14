/** Educational navigation only: no answers, health information or scores. */
document.querySelectorAll<HTMLElement>('[data-self-observation]').forEach((region) => {
  const steps = Array.from(region.querySelectorAll<HTMLButtonElement>('[data-so-step]'));
  const panels = Array.from(region.querySelectorAll<HTMLElement>('[data-so-panel]'));
  const previous = region.querySelector<HTMLButtonElement>('[data-so-previous]');
  const next = region.querySelector<HTMLButtonElement>('[data-so-next]');
  const progress = region.querySelector<HTMLElement>('[data-so-progress]');
  if (!steps.length || steps.length !== panels.length) return;
  const lifecycle = new AbortController();
  const { signal } = lifecycle;
  let selected = 0;

  function select(index: number, focusReading = false) {
    if (!Number.isInteger(index) || index < 0 || index >= panels.length) return;
    selected = index;
    region.dataset.observationStep = String(index);
    steps.forEach((button, position) => button.setAttribute('aria-pressed', String(position === index)));
    panels.forEach((panel, position) => { panel.hidden = position !== index; });
    if (previous) previous.disabled = index === 0;
    if (next) next.disabled = index === panels.length - 1;
    if (progress) progress.textContent = `Pergunta ${index + 1} de ${panels.length}`;
    if (focusReading) {
      const heading = panels[index].querySelector<HTMLElement>('h3');
      heading?.focus({ preventScroll: true });
      heading?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }
  }

  region.dataset.soEnhanced = 'true';
  steps.forEach((button, index) => button.addEventListener('click', () => select(index, matchMedia('(max-width:760px)').matches), { signal }));
  previous?.addEventListener('click', () => select(selected - 1, true), { signal });
  next?.addEventListener('click', () => select(selected + 1, true), { signal });
  region.querySelectorAll<HTMLButtonElement>('[data-so-example-toggle]').forEach((button) => {
    const example = region.querySelector<HTMLElement>(`[data-so-example="${button.dataset.soExampleToggle}"]`);
    if (!example) return;
    example.hidden = true;
    button.hidden = false;
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      example.hidden = expanded;
      button.innerHTML = expanded
        ? 'Ver um exemplo do cotidiano <span aria-hidden="true">+</span>'
        : 'Recolher o exemplo <span aria-hidden="true">−</span>';
    }, { signal });
  });
  select(0);
  window.addEventListener('pagehide', (event) => { if (!event.persisted) lifecycle.abort(); });
});

export {};
