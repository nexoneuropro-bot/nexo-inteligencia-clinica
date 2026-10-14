/**
 * A continuous, decorative WebGL layer for the NEXO proof of concept.
 * All content, controls, navigation and the static SVG exist in HTML first.
 * Three is imported only for visitors who have not requested a quiet page.
 */
type SceneChapter = 'intro' | 'bio' | 'ideas' | 'paths';
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

function startExperience(): (() => void) | undefined {
  const stageElement = document.getElementById('experience-stage');
  const canvasElement = document.getElementById('experience-canvas');
  if (!(stageElement instanceof HTMLElement) || !(canvasElement instanceof HTMLCanvasElement)) return;
  const stage: HTMLElement = stageElement;
  const canvas: HTMLCanvasElement = canvasElement;
  const entry = stage.dataset.entry === 'personal' ? 1 : stage.dataset.entry === 'business' ? 2 : 0;
  const skip = document.getElementById('experience-skip-intro');
  const pause = document.getElementById('experience-pause');
  const quiet = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = (navigator as Navigator & { connection?: DataConnection }).connection;
  const idleWindow = window as IdleWindow;
  const chapters = CHAPTERS.map((id) => document.getElementById(`experience-${id}`));
  let chapterStarts: number[] = [];
  let chapterValue = entry === 1 ? 1 : entry === 2 ? 2 : 0;
  let lastAnnounced = '';
  let introComplete = entry !== 0;
  let paused = false;
  let disposed = false;
  let loading = false;
  let idleHandle = 0;
  let loadTimer = 0;
  let scrollFrame = 0;
  let disposeWebgl: (() => void) | undefined;
  let refreshWebgl: (() => void) | undefined;
  let drawStationary: (() => void) | undefined;
  let dimension = -1;
  let concept = 0;
  let selectedPath = entry === 1 ? -1 : entry === 2 ? 1 : 0;
  let interactionPulse = 0;
  let regionVisible = true;

  stage.dataset.mode = 'static';
  stage.dataset.phase = introComplete ? 'formed' : 'fragments';
  stage.dataset.scene = entry === 1 ? 'bio' : entry === 2 ? 'ideas' : 'intro';
  stage.dataset.paused = 'false';
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
    updateChapter();
  }

  function updateChapter() {
    scrollFrame = 0;
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
    const stageIndex = Math.min(3, Math.round(chapterValue));
    const chapter = CHAPTERS[stageIndex];
    stage.dataset.scene = chapter;
    stage.style.setProperty('--scene-bio', String(entry ? 0 : smooth(1 - Math.abs(chapterValue - 1))));
    const announcement = `${chapter}:${Math.round(chapterValue * 100)}`;
    if (announcement !== lastAnnounced) {
      lastAnnounced = announcement;
      window.dispatchEvent(new CustomEvent('nexo:scene', { detail: { stage: chapter, progress: chapterValue / 3 } }));
    }
    if (!entry) {
      const first = chapters[0];
      const last = chapters[chapters.length - 1];
      const nextVisibility = !first || !last || (first.getBoundingClientRect().top < window.innerHeight && last.getBoundingClientRect().bottom > 0);
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
    if (disposed || loading || disposeWebgl || quiet.matches || connection?.saveData) return;
    loading = true;
    let disposePartial: (() => void) | undefined;
    try {
      const THREE = await import('three');
      if (disposed || quiet.matches || connection?.saveData) { loading = false; return; }

      const mobile = window.matchMedia('(max-width: 760px)').matches;
      const perStrand = mobile ? 480 : 960;
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
      renderer.debug.onShaderError = () => { shaderFailed = true; };
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
      const attributeNames = ['position', 'aOrigin', 'aBio', 'aIdeas', 'aPaths', 'aBusiness', 'color'] as const;
      type VectorAttribute = typeof attributeNames[number];
      const vectors = Object.fromEntries(attributeNames.map((name) => [name, new Float32Array(count * 3)])) as Record<VectorAttribute, Float32Array>;
      const sizes = new Float32Array(count);
      const seeds = new Float32Array(count);
      const domains = new Float32Array(count);
      const sides = new Float32Array(count);
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
      };

      const vertexPrelude = `
        attribute vec3 aOrigin;
        attribute vec3 aBio;
        attribute vec3 aIdeas;
        attribute vec3 aPaths;
        attribute vec3 aBusiness;
        attribute float aSeed;
        attribute float aDomain;
        attribute float aSide;
        uniform float uTime;
        uniform float uChapter;
        uniform float uFormation;
        uniform float uPortrait;
        uniform float uDimension;
        uniform float uConcept;
        uniform float uPath;
        uniform float uPulse;
        uniform float uEntry;
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
          business.x = (business.x - uPortrait * 1.9) * mix(1.0, 0.85, uPortrait);

          vec3 p = mix(emblem, bio, smoothstep(0.0, 1.0, uChapter));
          p = mix(p, ideas, smoothstep(1.0, 2.0, uChapter));
          p = mix(p, paths, smoothstep(2.0, 3.0, uChapter));
          if (uEntry > 0.5) p = uEntry < 1.5 ? bio : business;
          vec3 origin = aOrigin;
          origin.x *= mix(1.0, 0.65, uPortrait);
          p = mix(origin, p, uFormation);
          float breath = sin(uTime * 0.46 + aSeed * 6.283);
          p.z += breath * 0.055;
          p.y += sin(uTime * 0.31 + p.x * 0.7) * 0.026;

          float bioWeight = (1.0 - min(1.0, abs(uChapter - 1.0))) * step(0.0, uDimension);
          float selected = 1.0 - step(0.1, abs(aDomain - uDimension));
          float pathWeight = smoothstep(2.3, 3.0, uChapter) * step(0.1, abs(uPath));
          float chosenSide = 1.0 - step(0.1, abs(aSide - uPath));
          float wave = pow(0.5 + 0.5 * sin(p.y * 2.6 - uTime * 1.3), 8.0);
          float conceptWave = exp(-abs(aSeed - uConcept) * 11.0) * uPulse;
          float lightField = smoothstep(0.0, 1.0, 1.0 - min(1.0, abs(uChapter - 1.0))) * (1.0 - step(0.5, uEntry));
          vec3 litColor = color * (1.0 + wave * 0.26 + conceptWave * 0.48);
          vec3 inkColor = mix(vec3(0.12, 0.24, 0.27), vec3(0.51, 0.28, 0.17), aSeed);
          vColor = mix(litColor, inkColor, lightField);
          vOpacity = mix(1.0, mix(0.4, 1.35, selected), bioWeight);
          vOpacity *= mix(1.0, mix(0.42, 1.35, chosenSide), pathWeight);
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
      const particles = new THREE.Points(particleGeometry, particleMaterial);
      particles.frustumCulled = false;
      sculpture.add(particles);

      // Each edge follows the same morph as its two particle endpoints. Indexed
      // local links reveal the braids first, then the three spherical meshes.
      const links: number[] = [];
      for (let lane = 0; lane < 6; lane += 1) {
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
      for (const [name, source] of [['aSeed', seeds], ['aDomain', domains], ['aSide', sides]] as const) {
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
          void main() {
            float opacity = mix(0.012, mix(0.025, 0.14, smoothstep(0.2, 0.85, uChapter)), uFormation);
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
      const starCount = mobile ? 100 : 210;
      const starPositions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i += 1) {
        starPositions[i * 3] = (random() - 0.5) * 18;
        starPositions[i * 3 + 1] = (random() - 0.5) * 13;
        starPositions[i * 3 + 2] = -1.5 - random() * 6;
      }
      const starGeometry = new THREE.BufferGeometry();
      starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      const starMaterial = new THREE.PointsMaterial({ color: '#d7b399', size: 0.017, transparent: true, opacity: 0.48, depthWrite: false, sizeAttenuation: true });
      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);

      // A real perspective surface surrounds the sculpture. Its far rows
      // converge on a horizon; waves and depth attenuation run on the GPU.
      // It remains the same environment in both journeys and all dark chapters.
      const fieldColumns = mobile ? 72 : 128;
      const fieldRows = mobile ? 90 : 112;
      const fieldPositions = new Float32Array(fieldColumns * fieldRows * 3);
      const fieldSeeds = new Float32Array(fieldColumns * fieldRows);
      for (let row = 0; row < fieldRows; row += 1) {
        for (let column = 0; column < fieldColumns; column += 1) {
          const index = row * fieldColumns + column;
          const z = 9 - row / (fieldRows - 1) * 89;
          fieldPositions[index * 3] = (column / (fieldColumns - 1) - 0.5) * 91;
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
          attribute float aSeed;
          varying float vDepth;
          varying float vLight;
          varying float vVisible;
          void main() {
            vec3 p = position;
            float wave = sin(p.x * 0.19 + p.z * 0.10 + uTime * 0.17)
                       + cos(p.z * 0.23 - p.x * 0.12 - uTime * 0.13) * 0.65;
            p.y += wave * 1.65;
            float radius = length(p.xz - vec2(0.0, -9.0));
            p.y += sin(radius * 0.65 - uTime * 1.7) * exp(-radius * 0.045) * uPulse * 0.7;
            vec4 view = modelViewMatrix * vec4(p, 1.0);
            vDepth = -view.z;
            vLight = 0.5 + wave * 0.18 + aSeed * 0.42;
            float bio = 1.0 - min(1.0, abs(uChapter - 1.0));
            vVisible = uEntry > 0.5 ? 0.75 : 1.0 - bio;
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
      if (!mobile) {
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
      const interval = 1000 / (mobile ? 24 : 30);

      function renderFrame(delta = 0) {
        if (sceneDisposed || document.hidden || !visible || !regionVisible) return;
        activeTime += delta;
        const scrollFormation = entry ? 1 : clamp(window.scrollY / Math.max(1, window.innerHeight * 0.7));
        const formation = introComplete ? 1 : smooth(Math.max(activeTime / INTRO_MILLISECONDS, scrollFormation));
        uniforms.uFormation.value = formation;
        uniforms.uChapter.value = chapterValue;
        uniforms.uTime.value = activeTime / 1000;
        uniforms.uDimension.value = dimension;
        uniforms.uConcept.value = concept;
        uniforms.uPath.value = selectedPath;
        interactionPulse = Math.max(0, interactionPulse - delta / 1900);
        uniforms.uPulse.value = interactionPulse;
        currentPointerX += (pointerX - currentPointerX) * (delta ? 0.055 : 1);
        currentPointerY += (pointerY - currentPointerY) * (delta ? 0.055 : 1);
        sculpture.rotation.y = currentPointerX * 0.19 + Math.sin(activeTime / 16000) * 0.035;
        sculpture.rotation.x = -currentPointerY * 0.085;
        camera.position.x = currentPointerX * 0.42;
        camera.position.y = -currentPointerY * 0.26;
        camera.lookAt(0, 0.04, 0);
        stars.rotation.y = currentPointerX * 0.017 + activeTime / 450000;
        for (const { sprite, material, origin, phase } of glyphs) {
          sprite.position.y = origin[1] + Math.sin(activeTime / 6500 + phase) * 0.14;
          material.opacity = (0.14 + Math.sin(activeTime / 8000 + phase) * 0.035) * (1 - portrait) * (entry ? 0.7 : 1);
        }
        renderer.render(scene, camera);
        stage.dataset.camera = camera.position.x.toFixed(3) + ',' + camera.position.y.toFixed(3);
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
        if (sceneDisposed || paused || !visible || !regionVisible || document.hidden) return;
        frame = window.requestAnimationFrame(draw);
        if (!firstFrame && now - lastTick < interval) return;
        const delta = lastTick ? Math.min(120, now - lastTick) : 0;
        lastTick = now;
        renderFrame(delta);
      }

      function refresh() {
        if (sceneDisposed || paused || !visible || !regionVisible || document.hidden) {
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
    if (disposed || quiet.matches || connection?.saveData) return;
    if (idleWindow.requestIdleCallback) idleHandle = idleWindow.requestIdleCallback(() => void loadWebgl(), { timeout: 450 });
    else loadTimer = window.setTimeout(() => void loadWebgl(), 0);
  }

  function onMotionChange() {
    if (quiet.matches) useStatic();
    else scheduleWebgl();
  }

  skip?.addEventListener('click', onSkip);
  pause?.addEventListener('click', onPause);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measureChapters, { passive: true });
  window.addEventListener('nexo:dimension', onDimension);
  window.addEventListener('nexo:concept', onConcept);
  window.addEventListener('nexo:path', onPath);
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
    window.removeEventListener('load', scheduleWebgl);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', measureChapters);
    window.removeEventListener('nexo:dimension', onDimension);
    window.removeEventListener('nexo:concept', onConcept);
    window.removeEventListener('nexo:path', onPath);
    quiet.removeEventListener('change', onMotionChange);
    skip?.removeEventListener('click', onSkip);
    pause?.removeEventListener('click', onPause);
    disposeWebgl?.();
    document.body.classList.remove('experience-ready');
    stage.dataset.mode = 'static';
  };
}

function bootExperience() {
  stopExperience?.();
  stopExperience = startExperience();
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootExperience, { once: true });
  else bootExperience();
  window.addEventListener('pagehide', () => { stopExperience?.(); stopExperience = undefined; });
  window.addEventListener('pageshow', (event) => { if (event.persisted) bootExperience(); });
}

export {};

