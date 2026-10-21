# Psicologia em Pauta — operação da revisão local

17/10/2026. Este procedimento descreve os seis rascunhos editoriais. Não autoriza publicação, alteração de domínio ou indexação.

Em 17/10/2026, a área institucional para empresas foi ampliada com três rotas: `/recrutamento-e-selecao/`, `/treinamento-e-desenvolvimento/` e `/avaliacao-psicologica-organizacional/`. As contagens operacionais abaixo incluem essas páginas. A ampliação não altera o estado editorial dos seis artigos nem libera seus arquivos para o build normal.

## Arquitetura e estado

- `src/data/editorial/*.json`: seis artigos, com blocos, fontes, créditos, páginas de origem e notas. Estado atual: `draft: true`, `reviewed: false`.
- `src/data/editorial.ts`: seleção explícita entre revisão local e artigos elegíveis para futura publicação.
- `src/components/EditorialLanding.astro`: coleção e painel de revisão.
- `src/pages/psicologia-em-pauta/[article].astro`: HTML completo dos artigos elegíveis no modo escolhido.
- `src/lib/editorial-files.mjs`: leitura protegida dos arquivos locais, com validação de nomes e de caminhos.
- Endpoints estáticos em `originais/`, `imagens/` e `sociais/`: emitidos apenas no build editorial local.
- `scripts/verify-editorial.mjs`: separação entre o build de revisão e o build normal. Não precisa ler o acervo privado no modo público.

Os seis PDFs prioritários ficam no acervo de trabalho, fora de `public/`. As versões anteriores e a apresentação editável são referências comparativas, sem rotas ou downloads duplicados.

## Abrir o artefato já gerado

A prévia atual está em `outputs/previa-editoria`, com início em:

<http://127.0.0.1:4392/psicologia-em-pauta/>

O script `outputs/ABRIR-PREVIA-EDITORIAL.ps1` verifica se o servidor já responde e, quando necessário, inicia o helper `work/serve_editorial_preview.py` em janela oculta. O helper usa somente `127.0.0.1:4392`, bloqueia listagem de diretórios e acrescenta headers de `noindex`, `no-store`, `nosniff` e CSP. Ele serve o build existente; não executa novo build nem envia arquivos à internet.

O endereço é local a este computador. Não configurar `0.0.0.0`, túnel ou publicação na hospedagem para compartilhar o rascunho sem autorização específica. `noindex` orienta buscadores e não substitui controle de acesso.

## Regerar a revisão local

Execute os comandos a partir da pasta `outputs/nexo`. Os caminhos privados podem ser indicados por variáveis locais, sem gravá-los em arquivos versionados:

```powershell
$env:PUBLIC_EDITORIAL_PREVIEW='true'
$env:PUBLIC_INDEXABLE='false'
$env:PUBLIC_SITE_URL='http://127.0.0.1:4392'
$env:NEXO_EDITORIAL_ARCHIVE='C:\Users\Nutricomp\Documents\Codex\2026-10-14\files-pasted-by-the-user-nexo\work\psicologia-em-pauta-kit\PSICOLOGIA_EM_PAUTA_KIT_CODEX_2026\01_EDICOES_PRIORITARIAS'
$env:NEXO_EDITORIAL_IMAGES='C:\Users\Nutricomp\Documents\Codex\2026-10-14\files-pasted-by-the-user-nexo\work\pauta-audit\editorial-images'
pnpm check
pnpm build --outDir ../previa-editoria
node scripts/verify.mjs ../previa-editoria
node scripts/verify-editorial.mjs ../previa-editoria --draft
```

`PUBLIC_EDITORIAL_PREVIEW=true` gera os seis rascunhos e seus arquivos de conferência. Ele também força o bloqueio de indexação, ainda que `PUBLIC_INDEXABLE` seja `true`. Os endpoints privados recusam sua leitura fora desse modo. Não configurar essa flag na Cloudflare.

A saída esperada nesta etapa é de 22 HTMLs (15 rotas institucionais, seis artigos e uma página 404) e 14 arquivos editoriais de conferência: seis PDFs originais, duas ilustrações JPEG dos temas Neurodivergência/Profissão e seis PNGs sociais. As ilustrações vetoriais semânticas dos demais temas não exigem JPEGs correspondentes.

Para reabrir depois do build, execute o launcher em `outputs/ABRIR-PREVIA-EDITORIAL.ps1`. Um novo build não altera automaticamente os arquivos de uma implantação externa anterior.

## Conferir a separação do build normal

Antes de gerar um artefato normal, desative explicitamente o modo editorial e retire os caminhos privados do ambiente do processo. O exemplo abaixo mantém a saída sem indexação e não realiza publicação:

```powershell
$env:PUBLIC_EDITORIAL_PREVIEW='false'
$env:PUBLIC_INDEXABLE='false'
$env:PUBLIC_SITE_URL='https://nexo-previa-20261014.pages.dev'
Remove-Item Env:NEXO_EDITORIAL_ARCHIVE -ErrorAction SilentlyContinue
Remove-Item Env:NEXO_EDITORIAL_IMAGES -ErrorAction SilentlyContinue
pnpm build --outDir ../../work/editorial-public-guard
node scripts/verify.mjs ../../work/editorial-public-guard
node scripts/verify-editorial.mjs ../../work/editorial-public-guard --public
```

O verificador público exige 16 HTMLs/15 rotas institucionais, sem as seis rotas de artigos, os PDFs originais, as ilustrações e os cartões sociais desta revisão. Ele também procura URLs, títulos e trechos característicos dos rascunhos nos HTMLs e assets emitidos. Os guias educativos anteriores e os assets institucionais aprovados não são confundidos com os PDFs originais do novo acervo. O verificador geral confere a navegação desde a home, os links e recursos locais, um H1 e metadados em todas as páginas, além da entrada espacial empresarial nas três novas rotas.

A ausência das pastas privadas foi exercitada no teste de integração: o build normal e seus verificadores passaram. A exclusão dos rascunhos deve ser confirmada novamente se forem alterados os imports, a seleção de rotas ou os endpoints. O resultado não equivale a uma auditoria completa de histórico Git ou infraestrutura.

## Créditos, datas e aprovação

Em **17/10/2026**, o titular confirmou o crédito **Texto e curadoria de Gabriel Alves Batista** para as seis adaptações HTML. Esse dado é registrado separadamente dos créditos dos PDFs:

```json
"adaptationCredit": {
  "name": "Gabriel Alves Batista",
  "label": "Texto e curadoria",
  "confirmedByHolder": true,
  "confirmedAt": "2026-10-17"
}
```

Três documentos têm crédito explícito de texto/autoria localizado: Neurodivergência, Profissão e Análise do Comportamento. Relações registra curadoria; Escuta e Quem cuida apresentam créditos/assinaturas sem papel autoral explícito. Esses achados e os campos originais de `credit` permanecem preservados. `credit.authorshipConfirmedBySource` descreve a evidência do PDF; `adaptationCredit.confirmedByHolder` registra a confirmação direta da autoria da adaptação. A confirmação de créditos não constitui aprovação editorial ou clínica nem autorização de publicação.

`migratedAt` registra a migração, não publicação ou revisão clínica. As datas originais dos dossiês e os períodos dos dados são preservados no conteúdo. Os estados `verified`, `pending` e `replace` descrevem o alcance da checagem de cada referência; um registro conferido não valida todas as inferências do artigo.

No estado atual, os seis artigos não são elegíveis para o build público. A seleção prevista em `publicEditorialArticles` requer cumulativamente:

```text
draft === false
reviewed === true
approvedForPublication === true
publishedAt com uma data real
(credit.authorshipConfirmedBySource === true
  OU adaptationCredit.confirmedByHolder === true)
```

Esses campos só devem registrar aprovação efetiva. Para uma futura publicação também será necessário resolver as pendências, preparar os assets autorizados fora dos endpoints de revisão, conferir metadados/SEO e realizar o procedimento de implantação expressamente autorizado. Alterar flags não concede autorização editorial, não libera automaticamente os originais e não substitui a revisão do titular.

## Conferências registradas

Os resultados abaixo registram a integração editorial anterior à ampliação empresarial. Os números esperados atuais são 22 HTMLs no build de revisão e 16 no build normal; a rodada de integração das três novas rotas deve registrar sua própria execução, sem reescrever o histórico dos relatórios.

- Astro check: 52 arquivos, zero erros, avisos e sugestões.
- Build de revisão: 19 HTMLs, seis artigos, 14 arquivos de conferência, zero falhas.
- Build normal: 13 HTMLs, ausência dos artigos e arquivos editoriais privados, zero falhas, com caminhos privados indisponíveis.
- Seis hashes de origem, texto integral dos blocos, tabelas, referências, links para páginas, um H1, metadados próprios, imagens sociais e ausência de scripts executáveis inline verificados.
- Indexação do rascunho bloqueada no HTML, nos headers e no sitemap, inclusive em teste com flag de indexação ativada.
- Conferência visual dos seis artigos em viewports 1440 × 1000 e 390 × 844: sem transbordamento lateral, texto de 18 px, imagens carregadas. Temas expansíveis, Escape, profundidade ao cursor, pausa, modo noturno, capítulos ativos e quadros contidos verificados. Não equivale a teste em aparelho físico ou auditoria completa de tecnologias assistivas.
- Treze respostas HTTP 200 locais, com header noindex, entre coleção, artigos e PDFs.

Relatórios em `outputs/MAPA-MIGRACAO-PSICOLOGIA-EM-PAUTA.md`, `outputs/REVISAO-CONTEUDO-EDITORIA.md` e `outputs/ENTREGA-EDITORIA-PSICOLOGIA-EM-PAUTA.md`. Nesta rodada não houve commit, push, publicação na Cloudflare ou alteração de domínio.
