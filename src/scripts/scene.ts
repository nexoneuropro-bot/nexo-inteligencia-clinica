/**
 * Progressive, decorative enhancement. All navigation and content work before
 * Three is downloaded, and the SVG remains visible until the first good frame.
 */
type Connection = { saveData?: boolean };
type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

const INTRO_STORAGE_KEY = 'nexo-intro-v1';
const INTRO_DURATION = 3800;

function startUniverse() {
  const container = document.getElementById('nexo-universe');
  const canvasElement = document.getElementById('nexo-canvas');
  if (!(container instanceof HTMLElement) || !(canvasElement instanceof HTMLCanvasElement)) return;
  const canvas: HTMLCanvasElement = canvasElement;

  const skipButton = document.getElementById('skip-intro');
  const pauseButton = document.getElementById('pause-effects');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = (navigator as Navigator & { connection?: Connection }).connection;
  const idleWindow = window as IdleWindow;
  let previouslyViewed = false;
  let skipped = false;
  let completed = false;
  let destroyed = false;
  let paused = false;
  let idleHandle = 0;
  let idleTimeout = 0;
  let cleanupScene: (() => void) | undefined;
  let setScenePaused: ((value: boolean) => void) | undefined;

  // A page restored from the back/forward cache reuses these same DOM nodes.
  container.classList.remove('webgl-ready', 'scene-static', 'effects-paused', 'intro-complete');
  if (skipButton instanceof HTMLButtonElement) {
    skipButton.disabled = false;
    skipButton.hidden = false;
  }
  if (pauseButton instanceof HTMLElement) pauseButton.hidden = false;

  try {
    const remembered = sessionStorage.getItem(INTRO_STORAGE_KEY);
    previouslyViewed = remembered === 'viewed' || remembered === 'skipped';
  } catch {
    // Private browsing and blocked storage should not affect the experience.
  }

  function completeIntro(wasSkipped = false) {
    skipped = skipped || wasSkipped;
    completed = true;
    container!.classList.add('intro-complete');
    if (skipButton instanceof HTMLButtonElement) {
      // Preserve a useful keyboard focus target when this control disappears.
      if (document.activeElement === skipButton) {
        const nextControl = pauseButton && !pauseButton.hidden
          ? pauseButton
          : document.querySelector<HTMLElement>('.hero-actions a');
        nextControl?.focus({ preventScroll: true });
      }
      skipButton.disabled = true;
      skipButton.hidden = true;
    }
    try {
      sessionStorage.setItem(INTRO_STORAGE_KEY, skipped ? 'skipped' : 'viewed');
    } catch {
      // Only a presentation preference is stored. Nothing depends on storage.
    }
  }

  function onSkip() {
    completeIntro(true);
  }

  function updatePauseButton() {
    if (pauseButton instanceof HTMLElement) {
      pauseButton.setAttribute('aria-pressed', String(paused));
      const label = paused ? 'Retomar efeitos' : 'Pausar efeitos';
      pauseButton.setAttribute('aria-label', label);
      const text = pauseButton.querySelector('[data-pause-label]');
      if (text) text.textContent = label;
      else pauseButton.textContent = label;
    }
  }

  function onPause() {
    paused = !paused;
    updatePauseButton();
    container!.classList.toggle('effects-paused', paused);
    setScenePaused?.(paused);
  }

  skipButton?.addEventListener('click', onSkip);
  pauseButton?.addEventListener('click', onPause);
  updatePauseButton();
  if (previouslyViewed) completeIntro();

  function useStaticScene() {
    container!.classList.remove('webgl-ready');
    container!.classList.add('scene-static');
    container!.dataset.scene = 'static';
    if (pauseButton instanceof HTMLElement) pauseButton.hidden = true;
    completeIntro();
  }

  function onMotionChange() {
    if (reducedMotion.matches) {
      cleanupScene?.();
      cleanupScene = undefined;
      useStaticScene();
    }
  }

  function onPageHide() {
    destroyed = true;
    window.clearTimeout(idleTimeout);
    if (idleHandle) idleWindow.cancelIdleCallback?.(idleHandle);
    window.removeEventListener('load', scheduleScene);
    window.removeEventListener('pagehide', onPageHide);
    reducedMotion.removeEventListener('change', onMotionChange);
    skipButton?.removeEventListener('click', onSkip);
    pauseButton?.removeEventListener('click', onPause);
    cleanupScene?.();
    cleanupScene = undefined;
  }

  reducedMotion.addEventListener('change', onMotionChange);
  window.addEventListener('pagehide', onPageHide, { once: true });

  // These modes do not import Three or create a WebGL context.
  if (reducedMotion.matches || connection?.saveData) {
    useStaticScene();
    return;
  }

  function scheduleScene() {
    if (destroyed || reducedMotion.matches) return;
    if (idleWindow.requestIdleCallback) {
      idleHandle = idleWindow.requestIdleCallback(() => void loadScene(), { timeout: 700 });
    } else {
      idleTimeout = window.setTimeout(() => void loadScene(), 0);
    }
  }

  async function loadScene() {
    if (destroyed || reducedMotion.matches || connection?.saveData) return;
    container!.dataset.scene = 'loading';

    let disposePartialScene: (() => void) | undefined;
    try {
      const THREE = await import('three');
      if (destroyed || reducedMotion.matches || connection?.saveData) return;

      const mobile = window.matchMedia('(max-width: 760px)').matches;
      const totalPoints = mobile ? 850 : 1850;
      const constellationPoints = mobile ? 95 : 180;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75);
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'low-power',
        failIfMajorPerformanceCaveat: true,
      });
      let shaderFailed = false;
      renderer.debug.onShaderError = () => { shaderFailed = true; };
      disposePartialScene = () => renderer.dispose();
      renderer.setPixelRatio(pixelRatio);
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 60);
      camera.position.z = 12.4;
      const sculpture = new THREE.Group();
      scene.add(sculpture);

      // Seeded placement gives the emblem a consistent silhouette on every visit.
      let seed = 1777;
      const random = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
      const positions = new Float32Array(totalPoints * 3);
      const origins = new Float32Array(totalPoints * 3);
      const colors = new Float32Array(totalPoints * 3);
      const sizes = new Float32Array(totalPoints);
      const alphas = new Float32Array(totalPoints);
      const copper = new THREE.Color('#c58d70');
      const ivory = new THREE.Color('#f0e5d3');
      const mutedCopper = new THREE.Color('#795f55');
      const nodeColor = new THREE.Color();

      for (let i = 0; i < totalPoints; i += 1) {
        const branch = i % 2;
        const t = ((Math.floor(i / 2) + random()) / (totalPoints / 2)) * 2 - 1;
        const angle = random() * Math.PI * 2;
        const width = Math.pow(random(), 0.7) * (0.12 + 0.20 * Math.abs(t));
        const direction = branch === 0 ? 1 : -1;
        const bend = Math.sin(t * Math.PI) * 0.12;
        positions[i * 3] = t * 2.48 + Math.cos(angle) * width;
        positions[i * 3 + 1] = t * 3.03 * direction + Math.sin(angle) * width + bend;
        positions[i * 3 + 2] = Math.sin(angle) * width * 1.8 + Math.sin(t * Math.PI * 1.5) * 0.30;
        origins[i * 3] = (random() - 0.5) * 14;
        origins[i * 3 + 1] = (random() - 0.5) * 11;
        origins[i * 3 + 2] = (random() - 0.5) * 10;
        nodeColor.copy(copper).lerp(ivory, Math.pow(random(), 2.6));
        if (random() < 0.10) nodeColor.copy(mutedCopper);
        nodeColor.toArray(colors, i * 3);
        sizes[i] = (random() < 0.045 ? 3.2 : 0.7 + random() * 1.35) * (mobile ? 1.13 : 1);
        alphas[i] = 0.34 + random() * 0.62;
      }

      const uniforms = {
        uProgress: { value: previouslyViewed || completed ? 1 : 0 },
        uTime: { value: 0 },
        uPixelRatio: { value: pixelRatio },
        uOpacity: { value: 1 },
        uSweep: { value: -8 },
      };
      const morphVertex = `
        attribute vec3 aOrigin;
        uniform float uProgress;
        uniform float uTime;
        varying vec3 vColor;
        vec3 morphPosition() {
          vec3 p = mix(aOrigin, position, uProgress);
          p.x += sin(position.y * 1.7 + uTime * 0.35) * 0.017 * uProgress;
          p.z += sin(position.x * 1.3 + uTime * 0.28) * 0.035 * uProgress;
          return p;
        }
      `;
      const pointMaterial = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        uniforms,
        vertexShader: `${morphVertex}
          attribute float aSize;
          attribute float aAlpha;
          uniform float uPixelRatio;
          uniform float uSweep;
          varying float vAlpha;
          void main() {
            vec3 p = morphPosition();
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            float pulse = exp(-pow(position.y - uSweep, 2.0) * 5.0);
            vColor = color * (1.0 + pulse * 0.48);
            vAlpha = aAlpha;
            gl_PointSize = aSize * uPixelRatio * (18.0 / max(4.0, -mv.z));
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          uniform float uOpacity;
          varying vec3 vColor;
          varying float vAlpha;
          void main() {
            float radius = length(gl_PointCoord - vec2(0.5)) * 2.0;
            if (radius > 1.0) discard;
            float halo = pow(1.0 - radius, 2.2) * 0.42;
            float core = 1.0 - smoothstep(0.10, 0.56, radius);
            gl_FragColor = vec4(vColor, (halo + core) * vAlpha * uOpacity);
            #include <colorspace_fragment>
          }
        `,
      });
      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particleGeometry.setAttribute('aOrigin', new THREE.BufferAttribute(origins, 3));
      particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      particleGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
      particleGeometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
      const particles = new THREE.Points(particleGeometry, pointMaterial);
      particles.frustumCulled = false;
      sculpture.add(particles);

      // Local edges keep the network legible instead of filling the X with noise.
      const edgePositions: number[] = [];
      const edgeOrigins: number[] = [];
      const edgeColors: number[] = [];
      for (let base = 0; base < totalPoints - 24; base += mobile ? 10 : 12) {
        for (const branch of [0, 1]) {
          const i = base + branch;
          const partner = Math.min(totalPoints - 1, i + 2 + Math.floor(random() * 8) * 2);
          for (const index of [i, partner]) {
            edgePositions.push(positions[index * 3], positions[index * 3 + 1], positions[index * 3 + 2]);
            edgeOrigins.push(origins[index * 3], origins[index * 3 + 1], origins[index * 3 + 2]);
            edgeColors.push(colors[index * 3], colors[index * 3 + 1], colors[index * 3 + 2]);
          }
        }
      }
      const edgeGeometry = new THREE.BufferGeometry();
      edgeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions, 3));
      edgeGeometry.setAttribute('aOrigin', new THREE.Float32BufferAttribute(edgeOrigins, 3));
      edgeGeometry.setAttribute('color', new THREE.Float32BufferAttribute(edgeColors, 3));
      const edgeMaterial = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        vertexColors: true,
        uniforms,
        vertexShader: `${morphVertex}
          void main() {
            vColor = color;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(morphPosition(), 1.0);
          }
        `,
        fragmentShader: `
          uniform float uProgress;
          varying vec3 vColor;
          void main() {
            gl_FragColor = vec4(vColor, 0.10 * smoothstep(0.1, 0.85, uProgress));
            #include <colorspace_fragment>
          }
        `,
      });
      const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
      edges.frustumCulled = false;
      sculpture.add(edges);

      const starPositions = new Float32Array(constellationPoints * 3);
      const starColors = new Float32Array(constellationPoints * 3);
      const starSizes = new Float32Array(constellationPoints);
      const starAlphas = new Float32Array(constellationPoints);
      for (let i = 0; i < constellationPoints; i += 1) {
        starPositions[i * 3] = (random() - 0.5) * 11.5;
        starPositions[i * 3 + 1] = (random() - 0.5) * 10.5;
        starPositions[i * 3 + 2] = -1.5 - random() * 5;
        nodeColor.copy(copper).lerp(ivory, random() * 0.8).toArray(starColors, i * 3);
        starSizes[i] = 0.65 + random() * 1.3;
        starAlphas[i] = 0.12 + random() * 0.28;
      }
      const starGeometry = new THREE.BufferGeometry();
      starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      starGeometry.setAttribute('aOrigin', new THREE.BufferAttribute(starPositions.slice(), 3));
      starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
      starGeometry.setAttribute('aSize', new THREE.BufferAttribute(starSizes, 1));
      starGeometry.setAttribute('aAlpha', new THREE.BufferAttribute(starAlphas, 1));
      scene.add(new THREE.Points(starGeometry, pointMaterial));

      // A single incomplete orbit and a few small coordinate marks frame the X.
      const orbitPositions: number[] = [];
      for (let i = 0; i <= 130; i += 1) {
        const angle = -0.35 + (i / 130) * Math.PI * 1.67;
        orbitPositions.push(Math.cos(angle) * 4.1, Math.sin(angle) * 3.5, 0);
      }
      const orbitGeometry = new THREE.BufferGeometry();
      orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPositions, 3));
      const orbitMaterial = new THREE.LineBasicMaterial({ color: '#b28470', transparent: true, opacity: 0.15, depthWrite: false });
      const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
      orbit.rotation.set(0.82, -0.21, -0.32);
      orbit.position.z = -0.8;
      sculpture.add(orbit);

      const marks: number[] = [];
      for (const [x, y] of [[-3.5, 2.5], [3.5, 1.4], [-3.35, -1.7], [3.2, -2.6]]) {
        marks.push(x - 0.065, y, -0.7, x + 0.065, y, -0.7);
        marks.push(x, y - 0.065, -0.7, x, y + 0.065, -0.7);
      }
      const marksGeometry = new THREE.BufferGeometry();
      marksGeometry.setAttribute('position', new THREE.Float32BufferAttribute(marks, 3));
      sculpture.add(new THREE.LineSegments(marksGeometry, orbitMaterial));

      let raf = 0;
      let visible = true;
      let firstFrame = true;
      let lastFrame = 0;
      let activeElapsed = 0;
      let pointerX = 0;
      let pointerY = 0;
      let sceneDisposed = false;
      const frameInterval = 1000 / (mobile ? 24 : 30);

      function resize() {
        const bounds = container!.getBoundingClientRect();
        const width = Math.max(1, bounds.width);
        const height = Math.max(1, bounds.height);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.position.z = camera.aspect < 0.9 ? 12.4 * (0.9 / camera.aspect) : 12.4;
        camera.updateProjectionMatrix();
        // Resizing while paused still updates its stationary frame.
        if (paused && !document.hidden && visible) renderer.render(scene, camera);
      }

      function draw(now: number) {
        raf = 0;
        if (sceneDisposed || paused || !visible || document.hidden) return;
        raf = window.requestAnimationFrame(draw);
        if (now - lastFrame < frameInterval && !firstFrame) return;
        // Loading, offscreen time, background tabs, and pause do not consume the
        // cinematic. The rest of the page stays immediately usable throughout.
        const delta = lastFrame ? Math.min(200, now - lastFrame) : 0;
        lastFrame = now;
        activeElapsed += delta;
        const elapsed = activeElapsed;
        const progress = skipped || completed || previouslyViewed ? 1 : Math.min(1, elapsed / INTRO_DURATION);
        const association = Math.min(1, Math.max(0, (progress - 0.10) / 0.80));
        uniforms.uProgress.value = association * association * (3 - 2 * association);
        uniforms.uTime.value = elapsed / 1000;
        uniforms.uSweep.value = progress > 0.35 && progress < 0.95 ? -4 + ((progress - 0.35) / 0.6) * 8 : -8;
        sculpture.rotation.y += (pointerX * 0.09 - sculpture.rotation.y) * 0.035;
        sculpture.rotation.x += (-pointerY * 0.055 - sculpture.rotation.x) * 0.035;
        renderer.render(scene, camera);
        if (shaderFailed) {
          cleanupScene?.();
          useStaticScene();
          return;
        }
        if (firstFrame) {
          firstFrame = false;
          container!.classList.add('webgl-ready');
          container!.dataset.scene = 'ready';
        }
        if (progress >= 1 && !completed) completeIntro();
      }

      function refreshPlayback() {
        if (sceneDisposed || paused || !visible || document.hidden) {
          if (raf) window.cancelAnimationFrame(raf);
          raf = 0;
        } else if (!raf) {
          lastFrame = 0;
          raf = window.requestAnimationFrame(draw);
        }
      }

      function onPointer(event: PointerEvent) {
        const bounds = container!.getBoundingClientRect();
        pointerX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
        pointerY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
      }

      function onContextLost(event: Event) {
        event.preventDefault();
        cleanupScene?.();
        useStaticScene();
      }

      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        refreshPlayback();
      }, { threshold: 0 });
      observer.observe(container!);
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container!);
      document.addEventListener('visibilitychange', refreshPlayback);
      canvas.addEventListener('webglcontextlost', onContextLost);
      if (!mobile) window.addEventListener('pointermove', onPointer, { passive: true });
      setScenePaused = (value) => {
        paused = value;
        refreshPlayback();
      };

      cleanupScene = () => {
        if (sceneDisposed) return;
        sceneDisposed = true;
        if (raf) window.cancelAnimationFrame(raf);
        observer.disconnect();
        resizeObserver.disconnect();
        document.removeEventListener('visibilitychange', refreshPlayback);
        canvas.removeEventListener('webglcontextlost', onContextLost);
        window.removeEventListener('pointermove', onPointer);
        particleGeometry.dispose();
        edgeGeometry.dispose();
        starGeometry.dispose();
        orbitGeometry.dispose();
        marksGeometry.dispose();
        pointMaterial.dispose();
        edgeMaterial.dispose();
        orbitMaterial.dispose();
        renderer.dispose();
        scene.clear();
        setScenePaused = undefined;
        container!.classList.remove('webgl-ready');
      };
      disposePartialScene = undefined;

      resize();
      refreshPlayback();
    } catch {
      cleanupScene?.();
      disposePartialScene?.();
      useStaticScene();
    }
  }

  if (document.readyState === 'complete') scheduleScene();
  else window.addEventListener('load', scheduleScene, { once: true });
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startUniverse, { once: true });
  else startUniverse();
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) startUniverse();
  });
}

export {};
