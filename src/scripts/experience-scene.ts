/**
 * A continuous, decorative WebGL layer for the NEXO proof of concept.
 * All content, controls, navigation and the static SVG exist in HTML first.
 * Three is imported only for visitors who have not requested a quiet page.
 */
type SceneChapter = 'intro' | 'bio' | 'ideas' | 'paths' | 'approach' | 'profession' | 'reading';
type DataConnection = { saveData?: boolean };
type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

const CHAPTERS: SceneChapter[] = ['intro', 'bio', 'ideas', 'paths'];
const INTRO_KEY = 'nexo-sculpture-intro-v2';
const INTRO_MILLISECONDS = 4200;
const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };

let stopExperience: (() => void) | undefined;
const homeOpeningVisible = () => Boolean(document.querySelector<HTMLElement>('[data-home-opening]:not([hidden])'));

function startExperience(): (() => void) | undefined {
  const stageElement = document.getElementById('experience-stage');
  const canvasElement = document.getElementById('experience-canvas');
  if (!(stageElement instanceof HTMLElement) || !(canvasElement instanceof HTMLCanvasElement)) return;
  const stage: HTMLElement = stageElement;
  const canvas: HTMLCanvasElement = canvasElement;
  const entry = stage.dataset.entry === 'personal' ? 1 : stage.dataset.entry === 'business' ? 2 : stage.dataset.entry === 'approach' ? 3 : 0;
  const skip = document.getElementById('experience-skip-intro');
  const pause = document.getElementById('experience-pause');
  const quiet = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = (navigator as Navigator & { connection?: DataConnection }).connection;
  const idleWindow = window as IdleWindow;
  const chapters = CHAPTERS.map((id) => document.getElementById(`experience-${id}`));
  const eras = Array.from(document.querySelectorAll<HTMLElement>('[data-approach-era][data-era-index]'))
    .sort((a, b) => Number(a.dataset.eraIndex) - Number(b.dataset.eraIndex));
  const approachRegion = document.querySelector<HTMLElement>('[data-approach-experience]');
  const narrativeRegion = document.querySelector<HTMLElement>('.ex-narrative');
  const encounters = Array.from(document.querySelectorAll<HTMLElement>('[data-professional-encounter],[data-spatial-encounter]'));
  const readingRegion = document.querySelector<HTMLElement>('.spatial-content');
  const readingScenes = ['ideas', 'people', 'contact', 'privacy'];
  const readingSceneName = document.querySelector<HTMLElement>('[data-reading-scene]')?.dataset.readingScene || '';
  const readingScene = entry === 1 ? readingScenes.indexOf(readingSceneName) + 1 : 0;
  const quietReading = readingScene >= 3;
  const professionIds = ['neuropsychology', 'psychiatry', 'dialogue'];
  const routeProfession = professionIds.indexOf(document.querySelector<HTMLElement>('[data-profession-scene]')?.dataset.professionScene || '');
  let professionIndex = Math.max(0, routeProfession);
  let professionWeight = routeProfession >= 0 && !encounters.length ? 1 : 0;
  let workFactor = 0;
  let workStep = 0;
  let readingProgress = 0;
  let chapterStarts: number[] = [];
  let eraStarts: number[] = [];
  let eraValue = 0;
  let highlightedEra = 0;
  let chapterValue = entry === 1 ? 1 : entry === 2 ? 2 : 0;
  let lastAnnounced = '';
  let introComplete = entry !== 0;
  let paused = false;
  let disposed = false;
  let loading = false;
  let idleHandle = 0;
  let loadTimer = 0;
  let scrollFrame = 0;
  let measureFrame = 0;
  let disposeWebgl: (() => void) | undefined;
  let refreshWebgl: (() => void) | undefined;
  let drawStationary: (() => void) | undefined;
  let dimension = -1;
  let concept = 0;
  let selectedPath = entry === 1 ? -1 : entry === 2 ? 1 : 0;
  let interactionPulse = 0;
  let regionVisible = true;
  let openingCovered = homeOpeningVisible();

  stage.dataset.mode = 'static';
  stage.dataset.phase = introComplete ? 'formed' : 'fragments';
  stage.dataset.scene = entry === 1 ? 'bio' : entry === 2 ? 'ideas' : entry === 3 ? 'approach' : 'intro';
  stage.dataset.paused = 'false';
  if (readingScene) {
    stage.dataset.readingScene = readingSceneName;
    stage.dataset.readingMorph = '0.00';
    stage.dataset.readingDepth = '0.00';
  }
  if (entry === 2) {
    stage.dataset.workFactor = '0';
    stage.dataset.workStep = '0';
    stage.dataset.workMorph = '0.00';
    stage.dataset.workDepth = '0.00';
  }
  document.body.classList.remove('experience-ready');
  try { introComplete ||= sessionStorage.getItem(INTRO_KEY) === 'formed'; } catch { /* Presentation only. */ }

  function finishIntro() {
    introComplete = true;
    stage.dataset.phase = 'formed';
    if (skip instanceof HTMLButtonElement) {
      if (document.activeElement === skip) {
        const next = pause && !pause.hidden ? pause : document.querySelector<HTMLElement>('#experience-intro a');
        next?.focus({ preventScroll: true });
      }
      skip.hidden = true;
      skip.disabled = true;
    }
    try { sessionStorage.setItem(INTRO_KEY, 'formed'); } catch { /* Storage may be disabled. */ }
  }

  function updatePause() {
    stage.dataset.paused = String(paused);
    if (pause instanceof HTMLElement) {
      pause.setAttribute('aria-pressed', String(paused));
      const label = paused ? 'Retomar movimento' : 'Pausar movimento';
      pause.setAttribute('aria-label', label);
      const labelElement = pause.querySelector('[data-pause-label]');
      if (labelElement) labelElement.textContent = label;
      else pause.textContent = label;
    }
  }

  function onPause() {
    paused = !paused;
    updatePause();
    refreshWebgl?.();
    if (paused) drawStationary?.();
  }

  function onSkip() {
    finishIntro();
    drawStationary?.();
  }

  function measureChapters() {
    chapterStarts = chapters.map((element) => element ? element.getBoundingClientRect().top + window.scrollY : Infinity);
    eraStarts = eras.map((element) => element.getBoundingClientRect().top + window.scrollY);
    updateChapter();
  }

  function updateChapter() {
    scrollFrame = 0;
    if (encounters.length) {
      professionWeight = 0;
      for (const encounter of encounters) {
        const bounds = encounter.getBoundingClientRect();
        const weight = smooth((innerHeight * .9 - bounds.top) / (innerHeight * .5)) * smooth((bounds.bottom - innerHeight * .12) / (innerHeight * .45));
        if (weight > professionWeight) {
          professionWeight = weight;
          professionIndex = Number(encounter.dataset.professionIndex) || 0;
        }
      }
    }
    if (readingRegion) {
      const bounds = readingRegion.getBoundingClientRect();
      readingProgress = clamp((innerHeight * .6 - bounds.top) / Math.max(innerHeight, bounds.height));
    }
    stage.dataset.profession = professionWeight > .05 ? professionIds[professionIndex] : 'none';
    stage.dataset.professionBlend = professionWeight.toFixed(2);
    stage.dataset.readingProgress = readingProgress.toFixed(2);
    if (!entry) {
      const viewport = window.innerHeight;
      // Hold each sculpture through its chapter. Morph across the next boundary
      // rather than fading the canvas or replacing the whole WebGL scene.
      let nextValue = 0;
      for (let i = 1; i < CHAPTERS.length; i += 1) {
        nextValue += smooth((window.scrollY - (chapterStarts[i] - viewport * 0.88)) / (viewport * 1.06));
      }
      chapterValue = clamp(nextValue, 0, 3);
    }
    if (entry === 3) {
      eraValue = 0;
      // Camera position follows actual article spacing, including wrapped text
      // on small screens. There is no artificial wheel interception or delay.
      for (let index = 1; index < eraStarts.length; index += 1) {
        const start = eraStarts[index - 1];
        const end = eraStarts[index];
        eraValue += clamp((window.scrollY - start) / Math.max(1, end - start));
      }
      eraValue = clamp(eraValue, 0, 6);
      stage.dataset.era = String(Math.round(eraValue));
      stage.dataset.depth = (eraValue * 9).toFixed(2);
      stage.style.setProperty('--approach-progress', String(eraValue / 6));
    }
    const stageIndex = Math.min(3, Math.round(chapterValue));
    const chapter: SceneChapter = professionWeight > .5 ? 'profession' : entry === 3 ? 'approach' : readingScene ? 'reading' : CHAPTERS[stageIndex];
    stage.dataset.scene = chapter;
    stage.style.setProperty('--scene-bio', String(entry ? 0 : smooth(1 - Math.abs(chapterValue - 1)) * (1 - professionWeight)));
    const sceneProgress = entry === 3 ? eraValue / 6 : readingScene ? readingProgress : chapterValue / 3;
    const announcement = `${chapter}:${Math.round(sceneProgress * 100)}`;
    if (announcement !== lastAnnounced) {
      lastAnnounced = announcement;
      window.dispatchEvent(new CustomEvent('nexo:scene', { detail: { stage: chapter, progress: sceneProgress } }));
    }
    if (!entry) {
      const bounds = narrativeRegion?.getBoundingClientRect();
      const nextVisibility = !bounds || (bounds.top < window.innerHeight && bounds.bottom > 0);
      if (nextVisibility !== regionVisible) {
        regionVisible = nextVisibility;
        refreshWebgl?.();
      }
    } else if (entry === 3 && approachRegion) {
      const regionBounds = approachRegion.getBoundingClientRect();
      const nextVisibility = regionBounds.top < window.innerHeight && regionBounds.bottom > 0;
      if (nextVisibility !== regionVisible) {
        regionVisible = nextVisibility;
        refreshWebgl?.();
      }
    }
    // A paused scene still responds once to explicit scrolling or a selection.
    // It does not continue its ambient movement in the background.
    if (paused) drawStationary?.();
  }

  function onScroll() {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateChapter);
  }

  function scheduleMeasurements() {
    if (disposed || measureFrame) return;
    measureFrame = window.requestAnimationFrame(() => {
      measureFrame = 0;
      if (!disposed) measureChapters();
    });
  }

  function onDimension(event: Event) {
    const id = (event as CustomEvent<{ id?: string }>).detail?.id;
    dimension = ['biologica', 'psicologica', 'social'].indexOf(id || '');
    interactionPulse = 1;
    if (paused) drawStationary?.();
  }

  function onConcept(event: Event) {
    const id = (event as CustomEvent<{ id?: string }>).detail?.id || '';
    let hash = 0;
    for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
    concept = (hash % 1000) / 1000;
    interactionPulse = 1;
    if (paused) drawStationary?.();
  }

  function onPath(event: Event) {
    const id = (event as CustomEvent<{ id?: string | null }>).detail?.id;
    selectedPath = id === 'personal' ? -1 : id === 'business' ? 1 : 0;
    interactionPulse = 1;
    if (paused) drawStationary?.();
  }

  function onEra(event: Event) {
    const index = (event as CustomEvent<{ index?: number }>).detail?.index;
    if (typeof index !== 'number' || !Number.isFinite(index)) return;
    highlightedEra = Math.round(clamp(index, 0, 6));
    interactionPulse = 1;
    if (paused) drawStationary?.();
  }

  function onProfession(event: Event) {
    const index = (event as CustomEvent<{index?:number}>).detail?.index;
    if (typeof index !== 'number' || !Number.isFinite(index)) return;
    professionIndex = Math.round(clamp(index, 0, 2));
    stage.dataset.profession = professionIds[professionIndex];
    interactionPulse = 1;
    measureChapters();
    if (paused) drawStationary?.();
  }

  function onWorkFactor(event: Event) {
    if (entry !== 2) return;
    const index = (event as CustomEvent<{ index?: number }>).detail?.index;
    if (typeof index !== 'number' || !Number.isFinite(index)) return;
    workFactor = Math.round(clamp(index, 0, 3));
    stage.dataset.workFactor = String(workFactor);
    // The accessible HTML/SVG remains the complete experience in quiet mode.
    if (stage.dataset.mode === 'static') stage.dataset.workMorph = workFactor.toFixed(2);
    interactionPulse = .6;
    if (paused) drawStationary?.();
  }

  function onWorkStep(event: Event) {
    if (entry !== 2) return;
    const index = (event as CustomEvent<{ index?: number }>).detail?.index;
    if (typeof index !== 'number' || !Number.isFinite(index)) return;
    workStep = Math.round(clamp(index, 0, 4));
    stage.dataset.workStep = String(workStep);
    if (stage.dataset.mode === 'static') stage.dataset.workDepth = (workStep * 1.8).toFixed(2);
    interactionPulse = .45;
    if (paused) drawStationary?.();
  }

  function useStatic() {
    disposeWebgl?.();
    disposeWebgl = undefined;
    refreshWebgl = undefined;
    drawStationary = undefined;
    stage.dataset.mode = 'static';
    document.body.classList.remove('experience-ready');
    if (pause instanceof HTMLElement) pause.hidden = true;
    finishIntro();
  }

  async function loadWebgl() {
    if (disposed || openingCovered || loading || disposeWebgl || quiet.matches || connection?.saveData) return;
    loading = true;
    let disposePartial: (() => void) | undefined;
    try {
      const THREE = await import('three');
      if (disposed || openingCovered || quiet.matches || connection?.saveData) { loading = false; return; }

      const mobile = window.matchMedia('(max-width: 760px)').matches;
      const perStrand = quietReading ? (mobile ? 320 : 640) : (mobile ? 480 : 960);
      const count = perStrand * 6;
      const columns = mobile ? 32 : 48;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, mobile ? 1.35 : 1.7);
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'low-power',
        failIfMajorPerformanceCaveat: true,
      });
      disposePartial = () => renderer.dispose();
      let shaderFailed = false;
      renderer.debug.onShaderError = (gl, program, vertex, fragment) => {
        shaderFailed = true;
        console.error('NEXO WebGL program:', gl.getProgramInfoLog(program), gl.getShaderInfoLog(vertex), gl.getShaderInfoLog(fragment));
      };
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(pixelRatio);
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 110);
      camera.position.set(0, 0, 12.4);
      const sculpture = new THREE.Group();
      scene.add(sculpture);

      // Every vertex has its own position in every chapter. The GPU interpolates
      // the same network, preserving literal visual continuity while scrolling.
      const attributeNames = ['position', 'aOrigin', 'aBio', 'aIdeas', 'aPaths', 'aBusiness', 'aApproach', 'color'] as const;
      type VectorAttribute = typeof attributeNames[number];
      const vectors = Object.fromEntries(attributeNames.map((name) => [name, new Float32Array(count * 3)])) as Record<VectorAttribute, Float32Array>;
      const sizes = new Float32Array(count);
      const seeds = new Float32Array(count);
      const domains = new Float32Array(count);
      const sides = new Float32Array(count);
      const eraIndices = new Float32Array(count);
      const copper = new THREE.Color('#d6a17d');
      const ivory = new THREE.Color('#fff0d6');
      const quietCopper = new THREE.Color('#8a6456');
      const pigment = new THREE.Color();
      let randomSeed = 97731;
      const random = () => {
        randomSeed = (randomSeed * 16807) % 2147483647;
        return (randomSeed - 1) / 2147483646;
      };
      const centers = [
        [-4.3, 0.9, -0.5], [-2.0, 2.55, 0.2], [1.65, 2.1, -0.4],
        [4.15, -0.15, 0.1], [1.75, -2.1, 0.5], [-2.75, -1.8, -0.2],
      ];
      const sphereCenters = [[1.0, 0.55, 0.1], [3.15, 0.15, -0.6], [2.05, -1.25, 0.3]];

      for (let i = 0; i < count; i += 1) {
        const lane = Math.floor(i / perStrand);
        const k = i % perStrand;
        const t = (k / (perStrand - 1)) * 2 - 1;
        const diagonal = lane < 3 ? 1 : -1;
        const braid = lane % 3;
        const phase = t * Math.PI * 3.2 + braid * Math.PI * 2 / 3;
        const radius = 0.41 + 0.18 * Math.abs(t) + random() * 0.12;
        const dust = random() < 0.28 ? 1.1 : 0.16;
        const jitter = (random() - 0.5) * dust;
        const coil = Math.cos(phase) * radius + jitter;
        const n = 0.74;
        const offset = i * 3;
        vectors.position[offset] = t * 2.8 - diagonal * coil * n + 0.6;
        vectors.position[offset + 1] = diagonal * t * 3.05 + coil * n + 0.85;
        vectors.position[offset + 2] = Math.sin(phase) * radius * 2.1 + Math.sin(t * 2.6) * 0.32 + (random() - 0.5) * dust + diagonal * 0.13;
        vectors.aOrigin[offset] = (random() - 0.5) * 15;
        vectors.aOrigin[offset + 1] = (random() - 0.5) * 11;
        vectors.aOrigin[offset + 2] = (random() - 0.5) * 9;

        // Two indexed hemispheres per domain make a connected latitude/longitude
        // field, rather than three flat circles or unrelated particle clouds.
        const domain = lane % 3;
        const local = k + (lane >= 3 ? perStrand : 0);
        const rows = (perStrand * 2) / columns;
        const latitude = ((Math.floor(local / columns) + 0.5) / rows) * Math.PI;
        const longitude = (local % columns) / columns * Math.PI * 2 + (domain * 0.37);
        const sphereRadius = (domain === 2 ? 1.9 : 1.86) + (random() - 0.5) * 0.095;
        const sphereCenter = sphereCenters[domain];
        vectors.aBio[offset] = sphereCenter[0] + Math.sin(latitude) * Math.cos(longitude) * sphereRadius;
        vectors.aBio[offset + 1] = sphereCenter[1] + Math.cos(latitude) * sphereRadius;
        vectors.aBio[offset + 2] = sphereCenter[2] + Math.sin(latitude) * Math.sin(longitude) * sphereRadius;

        const cloudAngle = random() * Math.PI * 2;
        const cloudElevation = random() * 2 - 1;
        const cloudRadius = Math.pow(random(), 0.65) * 0.8;
        const cloudCenter = centers[lane];
        const otherCenter = centers[(lane + 1) % centers.length];
        const bridge = k % 10 < 4;
        if (bridge) {
          const f = (k % Math.floor(perStrand / 4)) / Math.floor(perStrand / 4);
          vectors.aIdeas[offset] = cloudCenter[0] + (otherCenter[0] - cloudCenter[0]) * f;
          vectors.aIdeas[offset + 1] = cloudCenter[1] + (otherCenter[1] - cloudCenter[1]) * f + Math.sin(f * Math.PI) * 0.4;
          vectors.aIdeas[offset + 2] = cloudCenter[2] + (otherCenter[2] - cloudCenter[2]) * f + Math.sin(f * Math.PI) * 0.8;
        } else {
          vectors.aIdeas[offset] = cloudCenter[0] + Math.cos(cloudAngle) * Math.sqrt(1 - cloudElevation ** 2) * cloudRadius;
          vectors.aIdeas[offset + 1] = cloudCenter[1] + cloudElevation * cloudRadius;
          vectors.aIdeas[offset + 2] = cloudCenter[2] + Math.sin(cloudAngle) * cloudRadius;
        }

        const side = lane < 3 ? -1 : 1;
        const f = k / (perStrand - 1);
        const streamPhase = f * Math.PI * 6 + braid * Math.PI * 2 / 3;
        const divergence = Math.pow(f, 0.75);
        const spread = 0.15 + f * 0.21;
        vectors.aPaths[offset] = side * (0.12 + divergence * 3.85) + Math.cos(streamPhase) * spread;
        vectors.aPaths[offset + 1] = 2.9 - f * 5.5 + Math.sin(streamPhase) * spread * 0.6;
        vectors.aPaths[offset + 2] = Math.sin(streamPhase) * (0.35 + f * 0.35) - f * 0.6;

        // The company entry shares the same material but its network has a more
        // measured spatial rhythm: six connected clusters on three depth planes.
        const gridX = (lane % 3) * 1.7 + 0.15;
        const gridY = lane < 3 ? 1.15 : -1.15;
        vectors.aBusiness[offset] = gridX + (random() - 0.5) * 1.45;
        vectors.aBusiness[offset + 1] = gridY + (random() - 0.5) * 1.3;
        vectors.aBusiness[offset + 2] = (k % 3 - 1) * 0.72 + (random() - 0.5) * 0.12;

        const shimmer = random();
        pigment.copy(copper).lerp(ivory, braid === 1 ? 0.56 + random() * 0.4 : Math.pow(random(), 2.6));
        if (shimmer < 0.06) pigment.copy(quietCopper);
        pigment.toArray(vectors.color, offset);
        sizes[i] = (shimmer > 0.982 ? 3.3 : 1.05 + Math.pow(random(), 2) * 2.0) * (mobile ? 1.05 : 1);
        seeds[i] = random();
        domains[i] = domain;
        sides[i] = side;
      }

      const perEra = Math.floor(count / 7);
      if (entry === 3) {
        // Seven abstract landmarks inhabit one long space. They are visual
        // metaphors, never diagrams claiming a historical or clinical relation.
        // A separate seed keeps every existing home/journey formation unchanged.
        let approachSeed = 4613;
        const approachRandom = () => {
          approachSeed = (approachSeed * 16807) % 2147483647;
          return (approachSeed - 1) / 2147483646;
        };
        for (let i = 0; i < count; i += 1) {
          const era = Math.min(6, Math.floor(i / perEra));
          const local = i - era * perEra;
          const eraCount = era === 6 ? count - era * perEra : perEra;
          const rows = Math.ceil(eraCount / columns);
          const u = (local % columns) / (columns - 1);
          const v = Math.floor(local / columns) / Math.max(1, rows - 1);
          const theta = u * Math.PI * 2;
          const phi = v * Math.PI * 2;
          const noise = (approachRandom() - 0.5) * 0.075;
          let x = 0;
          let y = 0;
          let z = 0;

          if (era === 0) {
            // Inquiry: one open spatial orbit, woven from several fine layers.
            x = Math.cos(theta) * (1.65 + Math.cos(phi) * 0.3);
            y = Math.sin(theta) * (1.85 + Math.cos(phi) * 0.3);
            z = Math.sin(phi) * 0.62 + Math.sin(theta) * 0.3;
          } else if (era === 1) {
            // Method: two braids continuously bridge one side to the other.
            const side = local % 2 ? 1 : -1;
            x = Math.cos(theta) * 1.9;
            y = Math.sin(theta * 2) * 0.82 + Math.cos(phi) * 0.17;
            z = Math.sin(theta) * 0.95 * side + Math.sin(phi) * 0.18;
          } else if (era === 2) {
            // Psychiatry: a plural, irregular field around an open center.
            const radius = 1.45 + Math.sin(theta * 3 + phi) * 0.34;
            x = Math.cos(theta) * Math.sin(phi * 0.5) * radius;
            y = Math.cos(phi * 0.5) * radius * 1.15;
            z = Math.sin(theta) * Math.sin(phi * 0.5) * radius + Math.sin(theta * 2) * 0.2;
          } else if (era === 3) {
            // Psychology: a suspended wave surface, with a visible far side.
            x = (u - 0.5) * 4.0;
            y = Math.sin(u * Math.PI * 3) * 0.8 + (v - 0.5) * 1.6;
            z = (v - 0.5) * 2.4 + Math.cos(u * Math.PI * 2) * 0.55;
          } else if (era === 4) {
            // Context: distinct networks remain connected across open space.
            const cluster = local % 3;
            const center = [[-1.1, 0.7, 0.15], [1.15, 0.55, -0.35], [0.05, -0.85, 0.1]][cluster];
            x = center[0] + Math.cos(theta) * Math.sin(phi * 0.5) * 0.86;
            y = center[1] + Math.cos(phi * 0.5) * 0.86;
            z = center[2] + Math.sin(theta) * Math.sin(phi * 0.5) * 0.86;
          } else if (era === 5) {
            // Integration: three intersecting spherical network fields.
            const sphere = local % 3;
            const center = [[-0.75, 0.5, 0.0], [0.8, 0.35, -0.35], [0.0, -0.7, 0.3]][sphere];
            x = center[0] + Math.sin(phi * 0.5) * Math.cos(theta) * 1.22;
            y = center[1] + Math.cos(phi * 0.5) * 1.22;
            z = center[2] + Math.sin(phi * 0.5) * Math.sin(theta) * 1.22;
          } else {
            // NEXO: the same braided X reappears inside the travelled field.
            const branch = local % 2 ? 1 : -1;
            const t = u * 2 - 1;
            const coil = Math.cos(t * Math.PI * 3 + phi) * 0.27;
            x = t * 1.65 - branch * coil;
            y = t * branch * 1.8 + coil;
            z = Math.sin(t * Math.PI * 3 + phi) * 0.48;
          }
          const offset = i * 3;
          vectors.aApproach[offset] = x + 3.0 + Math.sin(era * 1.7) * 0.3 + noise;
          vectors.aApproach[offset + 1] = y + 0.15 + noise;
          vectors.aApproach[offset + 2] = z - era * 9.0;
          eraIndices[i] = era;
        }
      }

      const uniforms = {
        uTime: { value: 0 },
        uChapter: { value: chapterValue },
        uFormation: { value: introComplete ? 1 : 0 },
        uPortrait: { value: 0 },
        uPixelRatio: { value: pixelRatio },
        uDimension: { value: dimension },
        uConcept: { value: concept },
        uPath: { value: selectedPath },
        uPulse: { value: 0 },
        uEntry: { value: entry },
        uEra: { value: eraValue },
        uEraHighlight: { value: highlightedEra },
        uTravel: { value: 0 },
        uProfession: { value: professionIndex },
        uProfessionWeight: { value: professionWeight },
        uWorkFactor: { value: workFactor },
        uWorkStep: { value: workStep },
        uReadingMode: { value: readingScene },
        uReadingProgress: { value: readingProgress },
      };

      const vertexPrelude = `
        attribute vec3 aOrigin;
        attribute vec3 aBio;
        attribute vec3 aIdeas;
        attribute vec3 aPaths;
        attribute vec3 aBusiness;
        attribute vec3 aApproach;
        attribute float aSeed;
        attribute float aDomain;
        attribute float aSide;
        attribute float aEra;
        uniform float uTime;
        uniform float uChapter;
        uniform float uFormation;
        uniform float uPortrait;
        uniform float uDimension;
        uniform float uConcept;
        uniform float uPath;
        uniform float uPulse;
        uniform float uEntry;
        uniform float uEra;
        uniform float uEraHighlight;
        uniform float uTravel;
        uniform float uProfession;
        uniform float uProfessionWeight;
        uniform float uWorkFactor;
        uniform float uWorkStep;
        uniform float uReadingMode;
        uniform float uReadingProgress;
        varying vec3 vColor;
        varying float vOpacity;
        varying float vDepth;

        vec3 networkPosition() {
          vec3 emblem = position;
          emblem.x = (emblem.x - uPortrait * 0.6) * mix(1.0, 0.68, uPortrait);
          emblem.y *= mix(1.0, 1.04, uPortrait);
          emblem *= mix(0.78, 0.88, uPortrait);
          emblem.x += (1.0 - uPortrait) * 2.35;
          emblem.y += 0.45;
          vec3 bio = aBio;
          bio.x = (bio.x - uPortrait * 2.0) * mix(1.0, 0.8, uPortrait);
          bio.y -= uPortrait * 0.65;
          vec3 ideas = aIdeas;
          ideas.x *= mix(1.0, 0.54, uPortrait);
          vec3 paths = aPaths;
          paths.x *= mix(1.0, 0.56, uPortrait);
          vec3 business = aBusiness;
          if (uEntry > 1.5 && uEntry < 2.5) {
            // Four spatial readings of the same work network. Existing sphere,
            // grid and strand coordinates supply every point and edge: there
            // are no additional vertex attributes or clinical classifications.
            vec3 workCenter = aDomain < .5 ? vec3(1.0,.55,.1) : aDomain < 1.5 ? vec3(3.15,.15,-.6) : vec3(2.05,-1.25,.3);
            vec3 localWork = aBio - workCenter;
            vec3 demands = vec3(2.75 + localWork.x * .9, .25 + (aDomain - 1.0) * .95 + localWork.y * .18, localWork.z * .68 + aSide * .35);
            float orbit = aDomain * 1.0472;
            vec3 autonomy = vec3(2.75 + localWork.x * cos(orbit) - localWork.z * .22 * sin(orbit), .25 + localWork.y * .88, localWork.x * sin(orbit) + localWork.z * .22 * cos(orbit));
            vec3 support = vec3(2.75 + (aBio.x - 2.0) * .92, .25 + aBio.y * .85, aBio.z * 1.1);
            vec3 roles = vec3(2.75 + aSide * .85 + localWork.x * .65, .25 + (aDomain - 1.0) * .65 + localWork.y * .45, localWork.z * .7 + aSide * .3);
            business = mix(demands, autonomy, smoothstep(0.0, 1.0, uWorkFactor));
            business = mix(business, support, smoothstep(1.0, 2.0, uWorkFactor));
            business = mix(business, roles, smoothstep(2.0, 3.0, uWorkFactor));
            // The network accompanies the visitor while the surrounding field
            // passes in perspective through the five assessment/action steps.
            business.z -= uWorkStep * 1.8;
          }
          business.x = (business.x - uPortrait * 1.9) * mix(1.0, 0.85, uPortrait);
          if (uEntry > 1.5 && uEntry < 2.5) business.y -= uPortrait * .6;

          vec3 p = mix(emblem, bio, smoothstep(0.0, 1.0, uChapter));
          p = mix(p, ideas, smoothstep(1.0, 2.0, uChapter));
          p = mix(p, paths, smoothstep(2.0, 3.0, uChapter));
          if (uEntry > 0.5) p = uEntry < 1.5 ? bio : business;
          if (uEntry > 2.5) {
            p = aApproach;
            p.x = (p.x - uPortrait * 3.0) * mix(1.0, 0.8, uPortrait);
            p.y = p.y * mix(1.0, 0.9, uPortrait) - uPortrait * 1.45;
            p.z += sin(p.x * 1.5 + uTime * 0.3 + aEra) * 0.075;
          }
          // Derive the new volumes from existing coordinates, preserving the
          // vertex-attribute budget on mobile and integrated graphics devices.
          vec3 domainCenter = aDomain < .5 ? vec3(1.0,.55,.1) : aDomain < 1.5 ? vec3(3.15,.15,-.6) : vec3(2.05,-1.25,.3);
          vec3 localField = aBio - domainCenter;
          vec3 neuro = vec3(3.0 + aSide * .7 + localField.x * .6, 1.1 + localField.y * .8, localField.z * .75);
          float orbitTilt = aDomain * 1.0472;
          vec3 medicine = vec3(3.0 + localField.x * cos(orbitTilt) - localField.z * .2 * sin(orbitTilt), 1.1 + localField.y * .85, localField.x * sin(orbitTilt) + localField.z * .2 * cos(orbitTilt));
          vec3 dialogue = aBio;
          dialogue.x = (dialogue.x - 2.0) * .72 + 3.0;
          dialogue.y = dialogue.y * .72 + 1.1;
          dialogue.z *= .85;
          vec3 profession = mix(neuro, medicine, smoothstep(0.0, 1.0, uProfession));
          profession = mix(profession, dialogue, smoothstep(1.0, 2.0, uProfession));
          if (uReadingMode > .5 && uEntry > .5 && uEntry < 1.5) {
            // The editorial pages retain the same spatial material, with forms
            // derived from existing coordinates instead of a new scene/asset.
            // These are visual metaphors; all meaning remains in the HTML.
            vec3 reading = dialogue;
            if (uReadingMode < 1.5) {
              vec3 orbits = medicine;
              orbits.y -= .45;
              vec3 connections = vec3(3.0 + aIdeas.x * .52, .65 + aIdeas.y * .68, aIdeas.z + aSide * .45);
              reading = mix(orbits, connections, smoothstep(0.0, .85, uReadingProgress));
            } else if (uReadingMode > 2.5 && uReadingMode < 3.5) {
              reading = vec3(3.0 + aSide * .58 + localField.x * .45, .65 + localField.y * .6, localField.z * .35);
            } else if (uReadingMode > 3.5) {
              reading = vec3(3.0 + (aBusiness.x - 1.85) * .68, .65 + aBusiness.y * .78, aBusiness.z * .65);
            }
            reading.x = (reading.x - uPortrait * 2.25) * mix(1.0, .72, uPortrait);
            reading.y = reading.y * mix(1.0, .75, uPortrait) - uPortrait * .65;
            reading.z -= uTravel;
            p = reading;
          }
          profession.x = (profession.x - uPortrait * 2.25) * mix(1.0, .72, uPortrait);
          profession.y = profession.y * mix(1.0, .75, uPortrait) - uPortrait * .65;
          profession.z -= uTravel;
          p = mix(p, profession, uProfessionWeight);
          vec3 origin = aOrigin;
          origin.x *= mix(1.0, 0.65, uPortrait);
          p = mix(origin, p, uFormation);
          float breath = sin(uTime * 0.46 + aSeed * 6.283);
          float readingRestraint = 1.0 - step(2.5, uReadingMode) * .85;
          p.z += breath * 0.055 * readingRestraint;
          p.y += sin(uTime * 0.31 + p.x * 0.7) * 0.026 * readingRestraint;

          float bioWeight = (1.0 - min(1.0, abs(uChapter - 1.0))) * step(0.0, uDimension);
          float selected = 1.0 - step(0.1, abs(aDomain - uDimension));
          float pathWeight = smoothstep(2.3, 3.0, uChapter) * step(0.1, abs(uPath));
          float chosenSide = 1.0 - step(0.1, abs(aSide - uPath));
          float wave = pow(0.5 + 0.5 * sin(p.y * 2.6 - uTime * 1.3), 8.0);
          float conceptWave = exp(-abs(aSeed - uConcept) * 11.0) * uPulse;
          float lightField = smoothstep(0.0, 1.0, 1.0 - min(1.0, abs(uChapter - 1.0))) * (1.0 - step(0.5, uEntry)) * (1.0 - uProfessionWeight);
          vec3 litColor = color * (1.0 + wave * 0.26 + conceptWave * 0.48);
          vec3 inkColor = mix(vec3(0.12, 0.24, 0.27), vec3(0.51, 0.28, 0.17), aSeed);
          vColor = mix(litColor, inkColor, lightField);
          vOpacity = mix(1.0, mix(0.4, 1.35, selected), bioWeight);
          vOpacity *= mix(1.0, mix(0.42, 1.35, chosenSide), pathWeight);
          if (uEntry > 2.5) {
            float distanceAhead = max(0.0, aEra - uEra);
            float distanceBehind = max(0.0, uEra - aEra);
            float proximity = exp(-distanceAhead * 0.85 - distanceBehind * 2.4);
            float highlighted = exp(-abs(aEra - uEraHighlight) * 3.0);
            vOpacity = proximity * (0.75 + highlighted * uPulse * 0.45);
            vColor = mix(vColor, vec3(0.58, 0.82, 0.88), clamp(distanceAhead * 0.2, 0.0, 0.55));
          }
          vOpacity = mix(vOpacity, 1.0, uProfessionWeight);
          if (uEntry > 1.5 && uEntry < 2.5) {
            vColor = mix(vColor, vec3(.5, .79, .79), .14 + uWorkStep * .025);
            vOpacity *= .8 + uPulse * .2;
          }
          if (uReadingMode > 2.5) vOpacity *= .52;
          return p;
        }
      `;

      const particleMaterial = new THREE.ShaderMaterial({
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        uniforms,
        vertexShader: `${vertexPrelude}
          attribute float aSize;
          uniform float uPixelRatio;
          varying float vSeed;
          void main() {
            vec3 p = networkPosition();
            vec4 view = modelViewMatrix * vec4(p, 1.0);
            vDepth = -view.z;
            vSeed = aSeed;
            float pulse = 1.0 + uPulse * 0.28;
            gl_PointSize = clamp(aSize * uPixelRatio * (23.0 / max(5.0, -view.z)) * pulse, 1.1, 10.0);
            gl_Position = projectionMatrix * view;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          varying float vOpacity;
          varying float vDepth;
          varying float vSeed;
          void main() {
            float r = length(gl_PointCoord - vec2(0.5)) * 2.0;
            if (r > 1.0) discard;
            float halo = exp(-r * r * 4.5) * 0.36;
            float core = 1.0 - smoothstep(0.05, 0.36, r);
            float depth = clamp(1.22 - vDepth * 0.034, 0.38, 1.0);
            gl_FragColor = vec4(vColor, (halo + core * 0.76) * (0.58 + vSeed * 0.4) * depth * vOpacity);
            #include <colorspace_fragment>
          }
        `,
      });
      const particleGeometry = new THREE.BufferGeometry();
      for (const name of attributeNames) particleGeometry.setAttribute(name, new THREE.BufferAttribute(vectors[name], 3));
      particleGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
      particleGeometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
      particleGeometry.setAttribute('aDomain', new THREE.BufferAttribute(domains, 1));
      particleGeometry.setAttribute('aSide', new THREE.BufferAttribute(sides, 1));
      particleGeometry.setAttribute('aEra', new THREE.BufferAttribute(eraIndices, 1));
      const particles = new THREE.Points(particleGeometry, particleMaterial);
      particles.frustumCulled = false;
      sculpture.add(particles);

      // Each edge follows the same morph as its two particle endpoints. Indexed
      // local links reveal the braids first, then the three spherical meshes.
      const links: number[] = [];
      if (entry === 3) {
        for (let i = 0; i < count; i += mobile ? 2 : 1) {
          const era = eraIndices[i];
          const next = era === 6 ? 2 : 1;
          if (i + next < count && eraIndices[i + next] === era && (i % perEra) % columns < columns - next) links.push(i, i + next);
          if (i + columns < count && eraIndices[i + columns] === era && i % 2 === 0) links.push(i, i + columns);
          // Widely spaced filaments connect the depth planes themselves.
          if (i % (columns * 3) === 0 && i + perEra < count) links.push(i, i + perEra);
        }
      } else for (let lane = 0; lane < 6; lane += 1) {
        for (let k = 0; k < perStrand; k += mobile ? 2 : 1) {
          const i = lane * perStrand + k;
          if (k + 1 < perStrand && k % columns < columns - 1) links.push(i, i + 1);
          if (k + columns < perStrand && k % 2 === 0) links.push(i, i + columns);
          if (k % (mobile ? 28 : 36) === 0) {
            const neighbor = (lane < 3 ? (lane + 1) % 3 : 3 + ((lane - 2) % 3)) * perStrand + k;
            links.push(i, neighbor);
          }
        }
      }
      const edgeGeometry = new THREE.BufferGeometry();
      for (const name of attributeNames) {
        const array = new Float32Array(links.length * 3);
        links.forEach((index, vertex) => array.set(vectors[name].subarray(index * 3, index * 3 + 3), vertex * 3));
        edgeGeometry.setAttribute(name, new THREE.BufferAttribute(array, 3));
      }
      for (const [name, source] of [['aSeed', seeds], ['aDomain', domains], ['aSide', sides], ['aEra', eraIndices]] as const) {
        edgeGeometry.setAttribute(name, new THREE.Float32BufferAttribute(links.map((index) => source[index]), 1));
      }
      const edgeMaterial = new THREE.ShaderMaterial({
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        uniforms,
        vertexShader: `${vertexPrelude}
          void main() {
            vec4 view = modelViewMatrix * vec4(networkPosition(), 1.0);
            vDepth = -view.z;
            gl_Position = projectionMatrix * view;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          varying float vOpacity;
          varying float vDepth;
          uniform float uFormation;
          uniform float uChapter;
          uniform float uEntry;
          uniform float uProfessionWeight;
          uniform float uReadingMode;
          void main() {
            float opacity = mix(0.012, mix(0.025, 0.14, smoothstep(0.2, 0.85, uChapter)), uFormation);
            if (uEntry > 2.5) opacity = 0.16;
            opacity = mix(opacity, .16, uProfessionWeight);
            if (uReadingMode > 2.5) opacity *= .5;
            opacity *= mix(1.0, 0.67, smoothstep(1.2, 2.0, uChapter));
            float depth = clamp(1.3 - vDepth * 0.035, 0.35, 1.0);
            gl_FragColor = vec4(vColor, opacity * vOpacity * depth);
            #include <colorspace_fragment>
          }
        `,
      });
      const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
      edges.frustumCulled = false;
      sculpture.add(edges);

      // A second, sparse depth field gives scale without competing with text.
      const starCount = entry === 3 ? (mobile ? 200 : 500) : (mobile ? 100 : 210);
      const starPositions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i += 1) {
        starPositions[i * 3] = (random() - 0.5) * (entry === 3 ? 42 : 18);
        starPositions[i * 3 + 1] = (random() - 0.5) * (entry === 3 ? 22 : 13);
        starPositions[i * 3 + 2] = entry === 3 ? 8 - random() * 130 : -1.5 - random() * 6;
      }
      const starGeometry = new THREE.BufferGeometry();
      starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      const starMaterial = new THREE.PointsMaterial({ color: '#d7b399', size: 0.017, transparent: true, opacity: 0.48, depthWrite: false, sizeAttenuation: true });
      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);

      // A real perspective surface surrounds the sculpture. Its far rows
      // converge on a horizon; waves and depth attenuation run on the GPU.
      // It remains the same environment in both journeys and all dark chapters.
      const fieldColumns = entry === 3 ? (mobile ? 80 : 144) : (mobile ? 72 : 128);
      const fieldRows = entry === 3 ? (mobile ? 112 : 160) : (mobile ? 90 : 112);
      const fieldPositions = new Float32Array(fieldColumns * fieldRows * 3);
      const fieldSeeds = new Float32Array(fieldColumns * fieldRows);
      for (let row = 0; row < fieldRows; row += 1) {
        for (let column = 0; column < fieldColumns; column += 1) {
          const index = row * fieldColumns + column;
          const z = 9 - row / (fieldRows - 1) * (entry === 3 ? 139 : 89);
          fieldPositions[index * 3] = (column / (fieldColumns - 1) - 0.5) * (entry === 3 ? 130 : 91);
          fieldPositions[index * 3 + 1] = -3.45 - z * 0.19;
          fieldPositions[index * 3 + 2] = z;
          fieldSeeds[index] = random();
        }
      }
      const fieldGeometry = new THREE.BufferGeometry();
      fieldGeometry.setAttribute('position', new THREE.BufferAttribute(fieldPositions, 3));
      fieldGeometry.setAttribute('aSeed', new THREE.BufferAttribute(fieldSeeds, 1));
      const fieldMaterial = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms,
        vertexShader: `
          uniform float uTime;
          uniform float uPixelRatio;
          uniform float uChapter;
          uniform float uEntry;
          uniform float uPulse;
          uniform float uTravel;
          uniform float uProfessionWeight;
          uniform float uReadingMode;
          attribute float aSeed;
          varying float vDepth;
          varying float vLight;
          varying float vVisible;
          void main() {
            vec3 p = position;
            if (uEntry > 2.5) p.y = -3.5;
            float sceneTime = uTime * (1.0 - step(2.5, uReadingMode) * .85);
            float wave = sin(p.x * 0.19 + p.z * 0.10 + sceneTime * 0.17)
                       + cos(p.z * 0.23 - p.x * 0.12 - sceneTime * 0.13) * 0.65;
            p.y += wave * 1.65;
            float radius = length(p.xz - vec2(0.0, -9.0 - uTravel));
            p.y += sin(radius * 0.65 - uTime * 1.7) * exp(-radius * 0.045) * uPulse * 0.7;
            vec4 view = modelViewMatrix * vec4(p, 1.0);
            vDepth = -view.z;
            vLight = 0.5 + wave * 0.18 + aSeed * 0.42;
            float bio = 1.0 - min(1.0, abs(uChapter - 1.0));
            vVisible = mix(uEntry > 0.5 ? 0.75 : 1.0 - bio, .85, uProfessionWeight);
            if (uReadingMode > 2.5) vVisible *= .42;
            gl_PointSize = clamp((1.2 + aSeed * 1.6) * uPixelRatio * 29.0 / max(6.0, -view.z), 1.05, 5.0);
            gl_Position = projectionMatrix * view;
          }
        `,
        fragmentShader: `
          varying float vDepth;
          varying float vLight;
          varying float vVisible;
          void main() {
            float r = length(gl_PointCoord - vec2(0.5)) * 2.0;
            if (r > 1.0) discard;
            float fog = exp(-vDepth * 0.017);
            vec3 blue = mix(vec3(0.12, 0.32, 0.43), vec3(0.46, 0.72, 0.77), vLight);
            gl_FragColor = vec4(blue, exp(-r * r * 3.2) * fog * vLight * vVisible * 0.95);
            #include <colorspace_fragment>
          }
        `,
      });
      const field = new THREE.Points(fieldGeometry, fieldMaterial);
      field.frustumCulled = false;
      scene.add(field);

      // Sparse mathematical marks are spatial objects. Historical information
      // belongs to the keyboard-accessible, attributed HTML interaction nodes.
      const glyphs: { sprite: InstanceType<typeof THREE.Sprite>; texture: InstanceType<typeof THREE.CanvasTexture>; material: InstanceType<typeof THREE.SpriteMaterial>; origin: number[]; phase: number }[] = [];
      if (!mobile && entry !== 3 && !readingScene) {
        for (const [index, symbol] of ['x', '∞', 'ψ', 'Δ', '?'].entries()) {
          const labelCanvas = document.createElement('canvas');
          labelCanvas.width = 128;
          labelCanvas.height = 128;
          const context = labelCanvas.getContext('2d');
          if (!context) continue;
          context.font = 'italic 68px Georgia, serif';
          context.fillStyle = '#e8ccb1';
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.fillText(symbol, 64, 68);
          const texture = new THREE.CanvasTexture(labelCanvas);
          const material = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.22, depthWrite: false });
          const sprite = new THREE.Sprite(material);
          const origin = [[-4.9, 2.4, -1.2], [4.9, 2.2, -2], [-3.9, -1.9, -1], [3.8, -2.8, -1.7], [-0.8, 3.6, -2.5]][index];
          sprite.position.set(origin[0], origin[1], origin[2]);
          sprite.scale.setScalar(0.55);
          scene.add(sprite);
          glyphs.push({ sprite, texture, material, origin, phase: random() * 6.28 });
        }
      }

      let frame = 0;
      let visible = true;
      let firstFrame = true;
      let lastTick = 0;
      let activeTime = 0;
      let sceneDisposed = false;
      let pointerX = 0;
      let pointerY = 0;
      let currentPointerX = 0;
      let currentPointerY = 0;
      let portrait = 0;
      const interval = 1000 / (quietReading ? (mobile ? 16 : 20) : (mobile ? 24 : 30));

      function renderFrame(delta = 0) {
        if (sceneDisposed || openingCovered || document.hidden || !visible || !regionVisible) return;
        activeTime += delta;
        const scrollFormation = entry ? 1 : clamp(window.scrollY / Math.max(1, window.innerHeight * 0.7));
        const formation = introComplete ? 1 : smooth(Math.max(activeTime / INTRO_MILLISECONDS, scrollFormation));
        uniforms.uFormation.value = formation;
        uniforms.uChapter.value = chapterValue;
        uniforms.uTime.value = activeTime / 1000;
        uniforms.uDimension.value = dimension;
        uniforms.uConcept.value = concept;
        uniforms.uPath.value = selectedPath;
        uniforms.uEra.value = eraValue;
        uniforms.uEraHighlight.value = highlightedEra;
        uniforms.uWorkFactor.value += (workFactor - uniforms.uWorkFactor.value) * (delta ? .085 : 1);
        uniforms.uWorkStep.value += (workStep - uniforms.uWorkStep.value) * (delta ? .06 : 1);
        uniforms.uReadingProgress.value = readingProgress;
        const workDepth = uniforms.uWorkStep.value * 1.8;
        const readingDepth = readingProgress * (readingScene === 1 ? 4.8 : readingScene === 2 ? 3.2 : readingScene === 3 ? .7 : .5);
        uniforms.uTravel.value = entry === 3 ? eraValue * 9 : entry === 2 ? workDepth : readingScene ? readingDepth : 0;
        uniforms.uProfession.value += (professionIndex - uniforms.uProfession.value) * (delta ? .09 : 1);
        uniforms.uProfessionWeight.value = professionWeight;
        interactionPulse = Math.max(0, interactionPulse - delta / 1900);
        uniforms.uPulse.value = interactionPulse;
        currentPointerX += (pointerX - currentPointerX) * (delta ? 0.055 : 1);
        currentPointerY += (pointerY - currentPointerY) * (delta ? 0.055 : 1);
        if (entry === 3) {
          // Translation through the actual world is perceptible in the passing
          // foreground, changing parallax and the vanishing point of the field.
          // The camera never orbits the entire historical corridor as a logo.
          sculpture.rotation.set(0, 0, 0);
          const travel = eraValue * 9;
          const drift = Math.sin(eraValue * 0.9) * 0.27;
          camera.position.set(currentPointerX * 0.35 + drift, -currentPointerY * 0.18 + Math.sin(eraValue * 1.4) * 0.12, 12.4 + portrait - travel - readingProgress * 1.6);
          camera.lookAt(drift * 0.7, 0.02, -travel);
          stars.rotation.y = currentPointerX * 0.003;
        } else if (entry === 2) {
          // A slow translation, rather than a camera cut, preserves the shared
          // environment when changing from a work factor to the care process.
          const drift = Math.sin(uniforms.uWorkStep.value * .55) * .25;
          sculpture.rotation.y = currentPointerX * .13;
          sculpture.rotation.x = -currentPointerY * .055;
          camera.position.set(currentPointerX * .3 + drift, -currentPointerY * .16, 12.4 + portrait - workDepth - uniforms.uWorkStep.value * .24);
          camera.lookAt(drift * .7, .04, -workDepth);
          stars.rotation.y = currentPointerX * .012 + activeTime / 550000;
        } else if (readingScene) {
          sculpture.rotation.y = currentPointerX * (quietReading ? .035 : .11);
          sculpture.rotation.x = -currentPointerY * (quietReading ? .015 : .04);
          camera.position.set(currentPointerX * (quietReading ? .08 : .25), -currentPointerY * (quietReading ? .04 : .13), 12.4 + portrait - readingDepth - readingProgress * (quietReading ? .3 : 1.0));
          camera.lookAt(0, .04, -readingDepth);
          stars.rotation.y = currentPointerX * (quietReading ? .003 : .012);
        } else {
          sculpture.rotation.y = currentPointerX * 0.19 + Math.sin(activeTime / 16000) * 0.035 + readingProgress * .16;
          sculpture.rotation.x = -currentPointerY * 0.085;
          camera.position.x = currentPointerX * 0.42;
          camera.position.y = -currentPointerY * 0.26;
          camera.position.z = 12.4 + portrait - readingProgress * 1.6;
          camera.lookAt(0, 0.04, 0);
          stars.rotation.y = currentPointerX * 0.017 + activeTime / 450000;
        }
        for (const { sprite, material, origin, phase } of glyphs) {
          sprite.position.y = origin[1] + Math.sin(activeTime / 6500 + phase) * 0.14;
          material.opacity = (0.14 + Math.sin(activeTime / 8000 + phase) * 0.035) * (1 - portrait) * (entry ? 0.7 : 1);
        }
        renderer.render(scene, camera);
        stage.dataset.camera = camera.position.x.toFixed(3) + ',' + camera.position.y.toFixed(3) + ',' + camera.position.z.toFixed(3);
        stage.dataset.professionMorph = uniforms.uProfession.value.toFixed(2);
        if (entry === 2) {
          stage.dataset.workMorph = uniforms.uWorkFactor.value.toFixed(2);
          stage.dataset.workDepth = workDepth.toFixed(2);
        }
        if (readingScene) {
          stage.dataset.readingMorph = readingProgress.toFixed(2);
          stage.dataset.readingDepth = readingDepth.toFixed(2);
        }
        if (shaderFailed) { useStatic(); return; }
        if (firstFrame) {
          firstFrame = false;
          stage.dataset.mode = 'webgl';
          document.body.classList.add('experience-ready');
          if (pause instanceof HTMLElement) pause.hidden = false;
        }
        stage.dataset.phase = formation < 0.14 ? 'fragments' : formation < 0.995 ? 'forming' : 'formed';
        if (formation >= 0.995 && !introComplete) finishIntro();
      }

      function draw(now: number) {
        frame = 0;
        if (sceneDisposed || openingCovered || paused || !visible || !regionVisible || document.hidden) return;
        frame = window.requestAnimationFrame(draw);
        if (!firstFrame && now - lastTick < interval) return;
        const delta = lastTick ? Math.min(120, now - lastTick) : 0;
        lastTick = now;
        renderFrame(delta);
      }

      function refresh() {
        if (sceneDisposed || openingCovered || paused || !visible || !regionVisible || document.hidden) {
          if (frame) window.cancelAnimationFrame(frame);
          frame = 0;
        } else if (!frame) {
          lastTick = 0;
          frame = window.requestAnimationFrame(draw);
        }
      }

      function resize() {
        const bounds = stage.getBoundingClientRect();
        const width = Math.max(1, bounds.width);
        const height = Math.max(1, bounds.height);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        portrait = clamp((1.05 - camera.aspect) / 0.4);
        uniforms.uPortrait.value = portrait;
        camera.position.z = 12.4 + portrait * 1.0;
        camera.updateProjectionMatrix();
        measureChapters();
        if (paused) renderFrame();
      }

      function onPointer(event: PointerEvent) {
        const bounds = stage.getBoundingClientRect();
        pointerX = clamp(((event.clientX - bounds.left) / Math.max(1, bounds.width) - 0.5) * 2, -1, 1);
        pointerY = clamp(((event.clientY - bounds.top) / Math.max(1, bounds.height) - 0.5) * 2, -1, 1);
      }

      function onPointerLeave() { pointerX = 0; pointerY = 0; }
      function onContextLost(event: Event) { event.preventDefault(); useStatic(); }
      const intersection = new IntersectionObserver(([observation]) => {
        visible = observation.isIntersecting;
        refresh();
      }, { rootMargin: '80px 0px', threshold: 0 });
      intersection.observe(stage);
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(stage);
      window.addEventListener('pointermove', onPointer, { passive: true });
      window.addEventListener('pointerleave', onPointerLeave, { passive: true });
      document.addEventListener('visibilitychange', refresh);
      canvas.addEventListener('webglcontextlost', onContextLost);
      refreshWebgl = refresh;
      drawStationary = () => renderFrame();

      disposeWebgl = () => {
        if (sceneDisposed) return;
        sceneDisposed = true;
        if (frame) window.cancelAnimationFrame(frame);
        intersection.disconnect();
        resizeObserver.disconnect();
        window.removeEventListener('pointermove', onPointer);
        window.removeEventListener('pointerleave', onPointerLeave);
        document.removeEventListener('visibilitychange', refresh);
        canvas.removeEventListener('webglcontextlost', onContextLost);
        particleGeometry.dispose();
        edgeGeometry.dispose();
        starGeometry.dispose();
        fieldGeometry.dispose();
        particleMaterial.dispose();
        edgeMaterial.dispose();
        starMaterial.dispose();
        fieldMaterial.dispose();
        for (const { texture, material } of glyphs) { texture.dispose(); material.dispose(); }
        scene.clear();
        renderer.dispose();
        refreshWebgl = undefined;
        drawStationary = undefined;
      };
      disposePartial = undefined;
      resize();
      refresh();
      loading = false;
    } catch {
      disposePartial?.();
      loading = false;
      useStatic();
    }
  }

  function scheduleWebgl() {
    if (disposed || openingCovered || quiet.matches || connection?.saveData) return;
    if (idleWindow.requestIdleCallback) idleHandle = idleWindow.requestIdleCallback(() => void loadWebgl(), { timeout: 450 });
    else loadTimer = window.setTimeout(() => void loadWebgl(), 0);
  }

  function onMotionChange() {
    if (quiet.matches) useStatic();
    else scheduleWebgl();
  }

  function onOpeningOpened() {
    openingCovered = homeOpeningVisible();
    if (!openingCovered) return;
    window.clearTimeout(loadTimer);
    if (idleHandle) idleWindow.cancelIdleCallback?.(idleHandle);
    loadTimer = idleHandle = 0;
    refreshWebgl?.();
  }

  function onOpeningDismissed() {
    openingCovered = homeOpeningVisible();
    if (openingCovered) return;
    measureChapters();
    if (disposeWebgl) {
      refreshWebgl?.();
      if (paused) drawStationary?.();
    } else scheduleWebgl();
  }

  skip?.addEventListener('click', onSkip);
  pause?.addEventListener('click', onPause);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measureChapters, { passive: true });
  window.addEventListener('nexo:dimension', onDimension);
  window.addEventListener('nexo:concept', onConcept);
  window.addEventListener('nexo:path', onPath);
  window.addEventListener('nexo:era', onEra);
  window.addEventListener('nexo:profession', onProfession);
  window.addEventListener('nexo:work-factor', onWorkFactor);
  window.addEventListener('nexo:work-step', onWorkStep);
  window.addEventListener('nexo:opening-opened', onOpeningOpened);
  window.addEventListener('nexo:opening-dismissed', onOpeningDismissed);
  // Educational panels can change height without resizing the fixed canvas or
  // the window. Re-measure later chapter boundaries after that layout settles.
  // The observer reads the narrative; stage updates do not size this region.
  const narrativeResize = narrativeRegion ? new ResizeObserver(scheduleMeasurements) : undefined;
  if (narrativeRegion) narrativeResize?.observe(narrativeRegion);
  quiet.addEventListener('change', onMotionChange);
  measureChapters();
  updatePause();
  if (introComplete) finishIntro();
  if (quiet.matches || connection?.saveData) useStatic();
  else if (document.readyState === 'complete') scheduleWebgl();
  else window.addEventListener('load', scheduleWebgl, { once: true });

  return () => {
    disposed = true;
    window.clearTimeout(loadTimer);
    if (idleHandle) idleWindow.cancelIdleCallback?.(idleHandle);
    if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
    if (measureFrame) window.cancelAnimationFrame(measureFrame);
    narrativeResize?.disconnect();
    window.removeEventListener('load', scheduleWebgl);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', measureChapters);
    window.removeEventListener('nexo:dimension', onDimension);
    window.removeEventListener('nexo:concept', onConcept);
    window.removeEventListener('nexo:path', onPath);
    window.removeEventListener('nexo:era', onEra);
    window.removeEventListener('nexo:profession', onProfession);
    window.removeEventListener('nexo:work-factor', onWorkFactor);
    window.removeEventListener('nexo:work-step', onWorkStep);
    window.removeEventListener('nexo:opening-opened', onOpeningOpened);
    window.removeEventListener('nexo:opening-dismissed', onOpeningDismissed);
    quiet.removeEventListener('change', onMotionChange);
    skip?.removeEventListener('click', onSkip);
    pause?.removeEventListener('click', onPause);
    disposeWebgl?.();
    document.body.classList.remove('experience-ready');
    stage.dataset.mode = 'static';
  };
}

function bootExperience() {
  // The home film owns the first frame. Internal pages have no opening marker.
  if (homeOpeningVisible()) return;
  stopExperience?.();
  stopExperience = startExperience();
}

if (typeof window !== 'undefined') {
  window.addEventListener('nexo:opening-dismissed', () => { if (!stopExperience) bootExperience(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootExperience, { once: true });
  else bootExperience();
  window.addEventListener('pagehide', () => { stopExperience?.(); stopExperience = undefined; });
  window.addEventListener('pageshow', (event) => { if (event.persisted) bootExperience(); });
}

export {};

