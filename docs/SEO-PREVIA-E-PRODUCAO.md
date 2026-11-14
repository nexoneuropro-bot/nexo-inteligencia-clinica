# SEO da prévia e da futura produção

Revisão do código-fonte em 14/10/2026. Este documento descreve a implementação e as condições de uma futura publicação; não registra aprovação de build, indexação ou implantação.

## Prévia pública: manter fora da busca

A prévia pública permanece com `PUBLIC_INDEXABLE=false`. Ela pode ser acessada por link, sem conta, mas não é a publicação definitiva. Não há autorização para publicar em `nexoneuro.com` ou habilitar sua indexação.

Somente o literal `PUBLIC_INDEXABLE=true` ativa o modo de produção. Qualquer outro valor mantém:

- `meta robots` com `noindex,follow` nas páginas;
- `X-Robots-Tag: noindex, follow` em `_headers`, gerado pelo build;
- ausência de canonical, `og:url` e JSON-LD de produção;
- sitemap XML válido sem URLs e ausência de anúncio de sitemap em `robots.txt`.

O `robots.txt` permite rastreamento para que os buscadores consigam ler o `noindex`. Isso é intencional: `noindex` controla indexação, não acesso humano. Não substituir essa configuração por `Disallow: /`. [Referência: noindex no Google Search Central](https://developers.google.com/search/docs/crawling-indexing/block-indexing).

## Base implementada

O Astro gera HTML estático. Títulos, descrições, textos clínicos, títulos de seção e links de navegação não dependem do WebGL. A cena é decorativa, com `aria-hidden`; o documento mantém `lang="pt-BR"`, um `main`, link para pular ao conteúdo e navegação em HTML.

As 12 rotas de conteúdo atuais — início e 11 páginas — têm títulos e descrições próprios. As descrições das páginas internas vêm de `src/data/pages.ts`; a home declara a sua em `src/pages/index.astro`. `Layout.astro` aplica títulos de busca que identificam o serviço ou assunto, preservando o H1 editorial visível. O mesmo título é usado em `<title>`, `og:title` e `twitter:title`; as três descrições também permanecem consistentes. As alterações clínicas recentes em Psicoterapia e Para você permanecem no conteúdo editorial, sem criar qualificações profissionais ou nomes de instrumentos não fornecidos.

| Rota | Título de busca e compartilhamento |
| --- | --- |
| `/` | NEXO Inteligência Clínica · Psicoterapia e Neuropsicologia |
| `/para-voce/` | Psicoterapia, autoconhecimento e avaliação · NEXO |
| `/psicoterapia/` | Psicoterapia breve em Análise do Comportamento · NEXO |
| `/avaliacao-neuropsicologica/` | Avaliação neuropsicológica · NEXO |
| `/integracao-psiquiatrica/` | Interface com Psiquiatria quando indicada · NEXO |
| `/para-sua-empresa/` | Consultoria em pessoas e relações nas empresas · NEXO |
| `/riscos-psicossociais-nr1/` | Riscos psicossociais no trabalho e NR-1 · NEXO |
| `/nossa-abordagem/` | Abordagem biopsicossocial · NEXO |
| `/profissionais/` | Profissionais de Psicologia e Medicina · NEXO |
| `/psicologia-em-pauta/` | Psicologia em Pauta · NEXO |
| `/contato/` | Contato · NEXO |
| `/politica-de-privacidade/` | Política de privacidade · NEXO |

Na saída HTML, o separador entre assunto e marca é `|`. Nenhum título acrescenta cidade, especialidade validada ou credencial ausente. `WebPage.name` conserva o título editorial correspondente ao H1, enquanto os breadcrumbs usam o rótulo da página.

Em um build de produção autorizado, `Layout.astro` gera canonical e `og:url` por rota. O JSON-LD relaciona `Organization`, `WebSite` e `WebPage` por identificadores estáveis. Páginas internas existentes recebem `BreadcrumbList` com o percurso real NEXO → página. O nome da página vem de seu rótulo editorial. A página 404 continua `noindex` e sem canonical, `og:url` ou JSON-LD, mesmo no modo de produção.

`Organization` usa somente nome, nome abreviado, URL e telefone já apresentados no site. Não há afirmações estruturadas de especialidade médica, RQE, credenciais verificadas, avaliações, notas, endereço não confirmado, perguntas frequentes ou artigos ainda não publicados. `WebSite` identifica o nome do site e seu vínculo com a organização. [Referências: Organization](https://developers.google.com/search/docs/appearance/structured-data/organization), [nome do site](https://developers.google.com/search/docs/appearance/site-names) e [breadcrumbs](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb).

O sitemap de produção lista o início e as páginas de `src/data/pages.ts`, com URLs absolutas. Não inclui 404, páginas fictícias, datas de atualização inventadas ou artigos que ainda não existem.

## Quando houver autorização de produção

1. Confirmar a origem HTTPS definitiva e configurar `PUBLIC_SITE_URL` com esse endereço antes do build. O valor padrão `https://nexoneuro.com` é uma referência de configuração, não uma confirmação de titularidade nem de publicação. Canonicals, metadados sociais, identificadores JSON-LD e sitemap precisam concordar com a origem realmente aprovada.
2. Manter o ambiente de prévia com `PUBLIC_INDEXABLE=false`. Ativar `PUBLIC_INDEXABLE=true` somente no ambiente de produção expressamente autorizado e gerar um novo build; as variáveis são incorporadas ao HTML durante a geração estática.
3. Conferir no artefato de produção os 12 destinos canônicos, títulos e descrições distintos, o sitemap, os links internos, as imagens sociais e o JSON-LD. Confirmar também que a 404 continua não indexável e que o cabeçalho `X-Robots-Tag: noindex` não está sendo aplicado às páginas válidas da produção.
4. Concluir a revisão dos registros, títulos, RQE, uso público das imagens, política de privacidade e conteúdo clínico antes da publicação definitiva. A preparação técnica para SEO não valida esses dados.
5. Após a publicação autorizada, conferir a leitura pelo Google e o sitemap no Search Console. Dados estruturados devem ser validados com as ferramentas indicadas pelo Google. Nenhuma conta, medição, rastreador, integração ou envio ao Search Console é ativado por esta alteração.

Essa base facilita interpretação, navegação e descoberta do conteúdo quando a produção for autorizada. Ela não garante indexação, posição nos resultados, tráfego orgânico ou exibição de resultados enriquecidos. [Referência: limites e validação dos dados estruturados](https://developers.google.com/search/docs/appearance/structured-data/organization).
