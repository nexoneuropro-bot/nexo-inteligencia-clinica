# NEXO Inteligência Clínica

Prova de conceito da revisão imersiva, construída com Astro, TypeScript, CSS e Three.js. A home percorre quatro capítulos com transformação contínua da geometria WebGL. A cena permanece nas jornadas **Para Você**, **Para Sua Empresa** e nas demais páginas internas. **Nossa abordagem** acrescenta uma travessia histórica de sete perspectivas, com câmera em profundidade, contextos e fontes. Conteúdo e metadados continuam disponíveis em HTML estático. Não houve publicação em `nexoneuro.com`.

Leia a [revisão de continuidade](docs/CONTINUIDADE-IMERSIVA.md) e as [fontes da travessia histórica](docs/REFERENCIAS-ABORDAGEM.md). Os relatórios da [revisão anterior](docs/RELATORIO-REVISAO-IMERSIVA.md) e da [primeira versão](docs/RELATORIO-DE-ENTREGA.md) são históricos.

## Executar e verificar

Requisitos: Node.js 22.12.0 ou superior e pnpm. As versões resolvidas estão em `pnpm-lock.yaml`.

```powershell
pnpm install --frozen-lockfile
Copy-Item .env.example .env
pnpm dev
```

```powershell
pnpm check
pnpm build
pnpm verify
pnpm preview
```

Use o endereço informado pelo Astro. Para acesso pela mesma rede local, execute `pnpm dev --host 0.0.0.0` ou `pnpm preview --host 0.0.0.0`. Refaça o build após alterações para atualizar a prévia estática.

Prévia temporária: [nexo-previa-20261014.pages.dev](https://nexo-previa-20261014.pages.dev/), vinculada à branch `feat/experiencia-imersiva`. A implantação deste commit precisa terminar no Cloudflare Pages para atualizar o site externo. A raiz está pública com noindex; a restrição nativa protege apenas URLs de pré-visualização. A proteção da raiz por Zero Trust aguarda ativação pelo titular, pois exige etapa de cobrança. A prévia local usa o endereço informado pelo servidor Astro.

## Experiência e arquivos

- `ExperienceHome.astro`: abertura reflexiva, dimensões biopsicossociais, constelação de ideias e escolha das jornadas.
- `ExperienceStage.astro` e `experience-scene.ts`: geometria WebGL real, câmera, partículas, conexões, transformação entre capítulos, carregamento progressivo e alternativa estática.
- `JourneyEntry.astro`: continuidade visual nas jornadas e páginas internas, com atmosferas distintas para pessoas e organizações.
- `ApproachExperience.astro`, `approach-ui.ts`, `approach-history.ts` e `approach.css`: sete perspectivas históricas, capítulos navegáveis, contexto com fontes e passagem para as fotografias reais e o conteúdo clínico.
- `KnowledgePanel.astro`, `experience-ui.ts` e `knowledge.ts`: dez contextos históricos e científicos com fontes, duas citações com tradução livre e quatro leituras do X.
- `experience.css`: composição editorial, fotografia humana real, versões responsivas, controles e movimento reduzido.

Os textos clínicos em `src/data/pages.ts` e as reflexões e contatos em `src/data/reflections.ts` foram preservados. As interações não são testes, não atribuem pontuações e não produzem diagnósticos. O `sessionStorage` registra apenas a apresentação da abertura na sessão; não guarda respostas clínicas. Não há analytics nesta prévia.

Referências editoriais e contexto das citações: [REFERENCIAS-EXPERIENCIA.md](docs/REFERENCIAS-EXPERIENCIA.md). A versão anterior foi preservada em `references/versao-1/`. O kit integral permanece na entrega local; os originais em `references/kit/` e o recorte de logo original não foram enviados ao GitHub após rejeição da revisão automática de aprovação.

## Validação de 14/10/2026

As rotinas `check`, `build` e `verify` do package.json foram executadas diretamente por Node, usando os mesmos scripts dos comandos pnpm acima. O check examinou 29 arquivos com zero erros, avisos ou sugestões. O build final gerou 13 HTMLs, incluindo a página 404, para as 12 rotas institucionais; a verificação terminou sem falhas. As 12 rotas foram verificadas no navegador em 1440 × 900 e 390 × 844 com WebGL ativo, um H1, noindex e sem rolagem horizontal. Contextos, fontes, fechamento por Escape, retorno do foco, menu móvel e pausa foram conferidos em execução. O escopo e as limitações estão no relatório de continuidade.

O bundle Three.js apresentou aviso de tamanho: 736.440 bytes, ou 185.282 bytes com gzip. Ele é carregado progressivamente nas rotas da experiência. Não foram medidos Core Web Vitals nem desempenho em celular físico; a implementação de movimento reduzido e leitores de tela ainda precisa de verificação específica em execução. Esses testes não constituem auditoria de conformidade.

## Repositório, publicação e pendências

Repositório: [nexoneuropro-bot/nexo-inteligencia-clinica](https://github.com/nexoneuropro-bot/nexo-inteligencia-clinica). A base da primeira versão está publicada no [commit 856b815](https://github.com/nexoneuropro-bot/nexo-inteligencia-clinica/commit/856b815123c18c5c11ccefd24e387dd5a8e318a2), com 65 arquivos. A revisão usa a branch `feat/experiencia-imersiva`; o link do commit ou pull request da revisão é informado na entrega em chat.

`PUBLIC_INDEXABLE=false` mantém a prévia sem indexação. Somente o valor literal `true` habilita indexação e endereços canônicos; `PUBLIC_SITE_URL` deve conter a origem autorizada. Detalhes de implantação: [IMPLANTACAO.md](docs/IMPLANTACAO.md).

A aprovação artística pelo usuário, a conferência de registros, títulos, RQE, autorização do uso público das fotografias e os dados operacionais e de privacidade continuam pendentes. Consulte [FONTES-E-VALIDACOES.md](docs/FONTES-E-VALIDACOES.md). A implantação definitiva depende da validação desta experiência e de autorização expressa.
