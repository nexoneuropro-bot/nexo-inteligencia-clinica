import { defineConfig } from 'astro/config';
import {writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {fileURLToPath, pathToFileURL} from 'node:url';

const nativeDevDependencies = ['picomatch', 'yaml', 'eventemitter3'];
const requireFromProject = createRequire(import.meta.url);
const projectPath = fileURLToPath(new URL('.', import.meta.url)).replaceAll('\\', '/').replace(/\/$/, '');
const nativeDevModules = nativeDevDependencies.map(name => {
  const file = requireFromProject.resolve(name).replaceAll('\\', '/');
  return { name, file, url: pathToFileURL(file).href };
});

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://nexoneuro.com',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  build: { format: 'directory' },
  // Compatibility for pinned Astro 7.3.8 / Vite 8.3.4 on Windows with pnpm.
  // Their dev runner can inline these CJS entries as ESM. fetchModule belongs
  // to Vite's experimental Environment API; revalidate this adapter on upgrades.
  // Production builds use Vite's normal pipeline and never install this adapter.
  vite: {
    plugins: [{
      name: 'nexo-native-dev-dependencies',
      apply: 'serve',
      enforce: 'pre',
      configureServer(server) {
        if (process.platform !== 'win32') return;
        for (const environment of Object.values(server.environments)) {
          if (environment.name === 'client' || !environment.fetchModule) continue;
          const fetchModule = environment.fetchModule.bind(environment);
          environment.fetchModule = async (id, ...options) => {
            const cleanId = id.split('?')[0].replaceAll('\\', '/');
            const fileId = cleanId.startsWith('/node_modules/') ? projectPath + cleanId : cleanId;
            const native = nativeDevModules.find(module => id === module.name || fileId === module.file || cleanId === module.url);
            if (native) return { externalize: native.url, type: 'commonjs' };
            return fetchModule(id, ...options);
          };
        }
      },
    }],
    // Keep executable scripts external so the deployed script-src 'self' CSP
    // also permits small Astro bundles (navigation and historical contexts).
    build: { target: 'es2022', assetsInlineLimit: 0 },
  },
  integrations:[{name:'nexo-static-headers',hooks:{'astro:build:done':async({dir})=>{
    const noindex=process.env.PUBLIC_INDEXABLE==='true'&&process.env.PUBLIC_EDITORIAL_PREVIEW!=='true'&&process.env.PUBLIC_EDITORIAL_SHARED_PREVIEW!=='true'?'':'  X-Robots-Tag: noindex, follow\n';
    await writeFile(new URL('_headers',dir),`/*\n${noindex}  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'none'\n`);
    const editorialPreview=process.env.PUBLIC_EDITORIAL_PREVIEW==='true'||process.env.PUBLIC_EDITORIAL_SHARED_PREVIEW==='true';
    await writeFile(new URL('_redirects',dir),editorialPreview?'/psicologia-em-pauta/originais/analise-do-comportamento.pdf /psicologia-em-pauta/edicoes/analise-do-comportamento.pdf 302\n':'');
  }}}]
});
