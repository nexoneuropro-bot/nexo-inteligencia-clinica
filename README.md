# NEXO Inteligência Clínica

Prova de conceito da revisão imersiva, construída com Astro, TypeScript, CSS e Three.js. A experiência percorre quatro capítulos com transformação contínua da geometria WebGL e continua nas jornadas **Para Você** e **Para Sua Empresa**. As demais páginas institucionais e seus metadados permanecem disponíveis em HTML estático. Não houve publicação em `nexoneuro.com`.

Leia o [relatório da revisão imersiva](docs/RELATORIO-REVISAO-IMERSIVA.md), com evidências, capturas e limitações. O [relatório da primeira versão](docs/RELATORIO-DE-ENTREGA.md) é histórico.

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

Prévia principal da revisão de 14/10/2026: [127.0.0.1:4321](http://127.0.0.1:4321/). No celular conectado à mesma rede: [192.168.0.14:4321](http://192.168.0.14:4321/). Ambos servem o build atualizado; o desenvolvimento também estava disponível na porta 4323. Esses endereços dependem dos servidores locais em execução.

## Experiência e arquivos

- `ExperienceHome.astro`: abertura reflexiva, dimensões biopsicossociais, constelação de ideias e escolha das jornadas.
- `ExperienceStage.astro` e `experience-scene.ts`: geometria WebGL real, câmera, partículas, conexões, transformação entre capítulos, carregamento progressivo e alternativa estática.
- `JourneyEntry.astro`: continuidade visual com atmosferas distintas para pessoas e organizações.
- `KnowledgePanel.astro`, `experience-ui.ts` e `knowledge.ts`: dez contextos históricos e científicos com fontes, duas citações com tradução livre e quatro leituras do X.
- `experience.css`: composição editorial, fotografia humana real, versões responsivas, controles e movimento reduzido.

Os textos clínicos em `src/data/pages.ts` e as reflexões e contatos em `src/data/reflections.ts` foram preservados. As interações não são testes, não atribuem pontuações e não produzem diagnósticos. O `sessionStorage` registra apenas a apresentação da abertura na sessão; não guarda respostas clínicas. Não há analytics nesta prévia.

Referências editoriais e contexto das citações: [REFERENCIAS-EXPERIENCIA.md](docs/REFERENCIAS-EXPERIENCIA.md). A versão anterior foi preservada em `references/versao-1/`. O kit integral permanece na entrega local; os originais em `references/kit/` e o recorte de logo original não foram enviados ao GitHub após rejeição da revisão automática de aprovação.

## Validação de 14/10/2026

As rotinas `check`, `build` e `verify` do package.json foram executadas diretamente por Node, usando os mesmos scripts dos comandos pnpm acima. O check examinou 26 arquivos com zero erros, avisos ou sugestões. O build final gerou 13 HTMLs, incluindo a página 404, para as 12 rotas institucionais; a verificação terminou sem falhas. As 12 rotas retornaram HTTP 200 na porta 4321 e a home atualizada também respondeu pelo endereço de rede. A cena WebGL e as interações foram verificadas no navegador em 1440 × 900 e 390 × 844. [Capturas reais no pacote local](../capturas-revisao/desktop-universo.jpg) e o escopo dos testes estão no relatório.

O bundle Three.js apresentou aviso de tamanho: 736.440 bytes, ou 185.282 bytes com gzip. Ele é carregado progressivamente nas três rotas da experiência. Não foram medidos Core Web Vitals nem desempenho em celular físico; a implementação de movimento reduzido e leitores de tela ainda precisa de verificação específica em execução. Esses testes não constituem auditoria de conformidade.

## Repositório, publicação e pendências

Repositório: [nexoneuropro-bot/nexo-inteligencia-clinica](https://github.com/nexoneuropro-bot/nexo-inteligencia-clinica). A base da primeira versão está publicada no [commit 856b815](https://github.com/nexoneuropro-bot/nexo-inteligencia-clinica/commit/856b815123c18c5c11ccefd24e387dd5a8e318a2), com 65 arquivos. A revisão usa a branch `feat/experiencia-imersiva`; o link do commit ou pull request da revisão é informado na entrega em chat.

`PUBLIC_INDEXABLE=false` mantém a prévia sem indexação. Somente o valor literal `true` habilita indexação e endereços canônicos; `PUBLIC_SITE_URL` deve conter a origem autorizada. Detalhes de implantação: [IMPLANTACAO.md](docs/IMPLANTACAO.md).

A aprovação artística pelo usuário, a conferência de registros, títulos, RQE, autorização do uso público das fotografias e os dados operacionais e de privacidade continuam pendentes. Consulte [FONTES-E-VALIDACOES.md](docs/FONTES-E-VALIDACOES.md). A implantação definitiva depende da validação desta experiência e de autorização expressa.
