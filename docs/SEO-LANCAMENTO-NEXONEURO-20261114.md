# NEXO · Plano de ativacao SEO no dominio oficial

Revisao tecnica: 14/11/2026. Este documento registra verificacoes e portas de aprovacao. **Nao ativa indexacao nem publica a aplicacao clinica.**

## Estado constatado em 14/11/2026

- `https://nexoneuro.com/` passou a responder com a home NEXO servida pela Cloudflare Pages.
- O mesmo build do projeto `nexo-previa-20261014` atende ao dominio oficial e ao subdominio `.pages.dev`.
- A home e os servicos retornam `meta robots: noindex,follow`. O sitemap publico tem zero URLs.
- `robots.txt` permite rastreamento, intencionalmente, para os robos lerem `noindex`.
- O build atual apresenta `og:image` e `twitter:image` originados da URL de previa. A configuracao de producao deve gerar URLs no dominio oficial.
- O conteudo ativo deriva da branch `feat/experiencia-imersiva`. Nao incorporar a branch antiga `seo/nexo-prepublicacao-20261114` de `main` sem reconciliar.
- O encaminhamento gratuito de entrada `contato@nexoneuro.com` para a caixa administrativa foi configurado na Cloudflare. Ele nao cria SMTP para envio como dominio.
- Confirmar em testes reais o recebimento de mensagens e nao coletar dados clinicos via formulario de contato.

## Melhorias preparadas nesta branch

1. Cards da home nomeiam explicitamente `avaliacao neuropsicologica` e `riscos psicossociais no trabalho e NR-1`, preservando H1, narrativa e animacoes.
2. Formulario `mailto:` e link visivel utilizam `contato@nexoneuro.com`; nenhum dado e enviado automaticamente pelo formulario.
3. Pagina de contato e politica de privacidade explicam o canal institucional e seu encaminhamento.
4. `scripts/seo-release-audit.mjs` confere 15 rotas institucionais, titulo, metadescricao, H1, robots, canonical, `og:url`, imagem de compartilhamento, JSON-LD, sitemap, headers e exclusao das rotas clinicas do sitemap.
5. A acao `nexo-seo-release-gate.yml` compila separadamente uma previa nao indexavel e uma producao **simulada** indexavel. Nao executa deploy nem altera configuracoes Cloudflare.

## Liberacao intermediaria por lista explicita (novembro de 2026)

Existe um caminho intermediario para ativar SEO institucional sem converter o ambiente clinico em pagina indexavel:

- A chave `PUBLIC_INDEXABLE=true` habilita somente as paginas listadas em `src/data/seo-public-policy.mjs`. A lista nao inclui `/profissionais/` ou `/integracao-psiquiatrica/`, pois aguardam verificacao cadastral e revisao de qualificacoes.
- Com `PUBLIC_EDITORIAL_SHARED_PREVIEW=true`, a landing `/psicologia-em-pauta/` e os seis dossies ainda marcados como rascunho permanecem `noindex` e fora do sitemap. O acervo pode ser lido na experiencia atual, mas **nao** e apresentado ao Google como material editorial aprovado.
- Rotas `/conhecendo-meu-momento/`, `/nexo-profissional/`, `/nr1-questionario/` e `/pesquisa/` continuam com `noindex,nofollow,noarchive` por meta e/ou header. Isso nao equivale a controle de acesso: a seguranca real depende da autenticacao, autorizacao, isolamento e backend.
- O host oficial `https://nexoneuro.com` apresenta canonical e sitemap somente das paginas institucionais elegiveis. Regras de `_headers` com seletores de hostname Cloudflare aplicam `X-Robots-Tag: noindex` aos enderecos `*.pages.dev`, inclusive previews versionados.
- A auditoria `SEO_AUDIT_MODE=mixed` verifica os tres cenarios. O Search Console so deve receber o sitemap **depois** do deploy no dominio oficial e da verificacao HTTP.
- Esta opcao nao substitui a migracao futura para ambientes realmente separados; nao altera banco D1, convites ou funcoes clinicas.

**Gate de publicacao:** confirmar com o responsavel a legitimidade dos servicos oferecidos e corrigir avisos/identidade profissional; preservar com cuidado as paginas em revisao; garantir HTTP 200, canonical de dominio, sitemap, headers de noindex das rotas reservadas e teste de `pages.dev` antes de solicitar indexacao.

## Separacao indispensavel: preview x producao

**Nao basta mudar `PUBLIC_INDEXABLE=true` no projeto `nexo-previa-20261014`.** Isso passaria a servir o mesmo artefato indexavel tambem no host `pages.dev`, e a plataforma clinica compartilha rotas/funcoes.

Procedimento recomendado:
- Preservar o projeto atual e sua branch de origem, DNS, Workers, D1 e variaveis clinicas. Manter `PUBLIC_INDEXABLE=false` e URL canonica de previa no build desse projeto.
- Planejar a divisao do site institucional e do aplicativo clinico, incluindo origens/cookies, autenticao, API, storage, convites, links de retorno e protecao de acesso. Verificar que a URL de previa nao oferece acesso nao autorizado. `noindex` nao e controle de acesso.
- Criar um build de **producao separado**, com `PUBLIC_INDEXABLE=true`, `PUBLIC_SITE_URL=https://nexoneuro.com`, `PUBLIC_EDITORIAL_PREVIEW=false` e `PUBLIC_EDITORIAL_SHARED_PREVIEW=false`. Esse build so deve conter paginas aprovadas para acesso publico e preservar `noindex,nofollow,noarchive` nas rotas reservadas.
- Somente depois de revisar o roteamento e as dependencias clinicas, transferir o dominio personalizado `nexoneuro.com` para o projeto de producao aprovado. Fazer testes de smoke e plano de reversao, sem desligar a previa. O registro de email MX/TXT deve permanecer.
- Verificar o host `www.nexoneuro.com`, certificado TLS e redirecionamento permanente 301 para `https://nexoneuro.com/`. Nao criar redirect antes de confirmar DNS/certificado.

## Portas de aprovacao editorial, profissional e legal

- Conferencia humana de identidade, qualificacoes, registros profissionais, anuncios de atividades e RQE quando houver mencao a especialidade medica. Registro profissional fornecido pelo briefing nao prova verificacao cadastral.
- Revisao de informacoes comerciais de NR-1: responsabilidade tecnica, escopo, metodo, promessas e entregaveis; nao anunciar certificacao automatica ou adequacao legal garantida.
- Revisao e aprovacao da politica de privacidade e identificacao correta do controlador, contatos de privacidade, fornecedores e bases legais para os tratamentos efetivos. Verificar componentes de contato e seus limites.
- Confirmacao de direitos de imagem, fontes, autoria/revisao dos artigos antes de indexar.
- Verificacao de privacidade e autorizacao das interfaces clinicas e estudos com acesso privado. Nao tratar rotas ocultas do sitemap como protegidas.
- Aprovacao do responsavel pelos servicos antes da mudanca de `noindex` para `index`.

## Conferencia de liberacao

- CI de preview e producao simulada concluido sem falhas.
- Em `https://nexoneuro.com/`: status HTTP 200 com TLS valido, titulo correto, meta robots `index,follow`, canonical absoluto, `og:url` e imagens sociais no dominio oficial.
- Em `https://nexoneuro.com/robots.txt`: `Allow: /` e anuncio de `https://nexoneuro.com/sitemap.xml`.
- Em `https://nexoneuro.com/sitemap.xml`: URLs institucionais aprovadas; sem paineis, instrumentos, pesquisas reservadas, 404 ou prontuarios.
- Em `https://nexo-previa-20261014.pages.dev/`: continuar com `noindex`, sem canonical de producao nem sitemap publico.
- Testar formulario de contato no desktop e celular e link de email, envio/recebimento real, WhatsApp, paginas internas, navegacao por teclado, WebGL/movimento reduzido e Core Web Vitals (LCP, INP, CLS).
- Testar login, consentimento, convites, APIs, cookies, D1 e armazenamento clinico sob as origens aprovadas antes de expor rotas em dominio novo.
- Depois da liberacao: adicionar propriedade de dominio no Google Search Console, fazer verificacao DNS TXT sem apagar MX/SPF, enviar sitemap oficial e monitorar cobertura, problemas de indexacao e consultas. Nao prometer posicoes.

## Comandos para CI e auditoria local

```bash
PUBLIC_INDEXABLE=false PUBLIC_SITE_URL=https://nexo-previa-20261014.pages.dev PUBLIC_EDITORIAL_PREVIEW=false PUBLIC_EDITORIAL_SHARED_PREVIEW=false pnpm build
pnpm verify
SEO_AUDIT_MODE=preview node scripts/seo-release-audit.mjs

PUBLIC_INDEXABLE=true PUBLIC_SITE_URL=https://nexoneuro.com PUBLIC_EDITORIAL_PREVIEW=false PUBLIC_EDITORIAL_SHARED_PREVIEW=false pnpm build
pnpm verify
SEO_AUDIT_MODE=production node scripts/seo-release-audit.mjs
```

**Importante:** Os comandos de producao geram artefatos para testes, nao enviam a Cloudflare. O resultado de build nao constitui validacao clinica, LGPD, seguranca, desempenho em navegador ou aceitacao do responsavel.
