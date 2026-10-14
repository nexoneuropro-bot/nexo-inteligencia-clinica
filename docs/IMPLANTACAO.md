# Implantação — NEXO

O projeto gera arquivos estáticos em `dist/` e pode ser hospedado no Cloudflare Pages ou em outro serviço compatível. Este documento prepara a implantação; não autoriza publicar no domínio definitivo, registrar domínio ou contratar serviços.

## 1. Validar a prévia

Revise a home e as onze páginas em desktop e celular. Confira navegação por teclado, foco, menu móvel, movimento reduzido, alternativa à cena 3D, links e mensagens de WhatsApp. Verifique também se o conteúdo permanece disponível quando o JavaScript não executa.

Antes da publicação definitiva, resolva os pontos de [FONTES-E-VALIDACOES.md](FONTES-E-VALIDACOES.md): registros e qualificações, RQE quando aplicável, identificação institucional, redação clínica, oferta empresarial, imagens autorizadas e privacidade. Artigos só devem ser apresentados como aprovados após revisão efetiva.

O kit original está preservado em `references/kit/`. Os retratos reais, a marca provisória, os favicons e as imagens de compartilhamento foram integrados à prévia local. A aprovação final da identidade e do uso público das fotografias permanece pendente.

As metas de LCP até 2,5 segundos, INP abaixo de 200 milissegundos e CLS abaixo de 0,1 ainda precisam de medição na hospedagem real e em dispositivos representativos. Uma verificação local não comprova os Core Web Vitals de usuários reais nem conformidade integral com WCAG 2.2 AA.

## 2. Preparar o build

Use Node.js **22.12.0 ou superior** e pnpm. Na pasta do projeto:

```powershell
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm verify
pnpm preview
```

Confira o resultado no endereço exibido pelo terminal. Esses comandos devem ser executados e seus resultados inspecionados; esta documentação não é um registro de aprovação dos testes.

As variáveis públicas são incorporadas durante o build. Após alterá-las, gere um novo build.

## 3. Manter a prévia fora dos resultados de busca

Nos ambientes de desenvolvimento e prévia:

```dotenv
PUBLIC_INDEXABLE=false
```

Qualquer valor diferente do literal `true` mantém o modo não indexável. Nesse modo, as páginas enviam a instrução `noindex` e não apresentam URL canônica de produção. Confira também as saídas de `robots.txt` e `sitemap.xml` geradas pelo projeto antes de distribuir uma prévia.

Não bloqueie o acesso integral dos rastreadores em `robots.txt` como substituto do `noindex`: eles precisam conseguir ler a instrução da página. Para restringir acesso humano, configure proteção própria da hospedagem. Não coloque dados confidenciais em uma prévia pública.

## 4. Versionar no GitHub

Repositório informado: [nexoneuropro-bot/nexo-inteligencia-clinica](https://github.com/nexoneuropro-bot/nexo-inteligencia-clinica).

Confira o estado local antes de configurar ou enviar qualquer alteração:

```powershell
git status
git remote -v
git branch --show-current
```

Se o repositório local ainda não tiver remoto, o endereço informado pode ser cadastrado como `origin`. Se houver outro remoto, confira-o antes de alterá-lo. O envio exige autenticação na conta apropriada e acesso ao repositório; a presença do endereço neste documento não significa que o push ocorreu.

Versione código-fonte, documentação e `pnpm-lock.yaml`. Não versione `node_modules/`, `dist/`, `.env` ou credenciais. Configure a branch de produção somente depois de confirmar qual branch contém a revisão aprovada.

## 5. Configurar Cloudflare Pages

Depois de autorizar a hospedagem, conecte a conta GitHub que possui acesso ao repositório e selecione o projeto. Use estas configurações:

| Campo | Valor |
| --- | --- |
| Framework | Astro, com saída estática |
| Diretório raiz | Pasta que contém `package.json` no repositório |
| Comando de build | `pnpm build` |
| Diretório de saída | `dist` |
| Runtime de build | Node.js 22.12.0 ou superior compatível com a versão instalada do Astro |
| Instalação | pnpm com o lockfile versionado |

Se o projeto for enviado como raiz do repositório, o diretório raiz do Pages também deve ser a raiz. Se estiver dentro de uma subpasta, indique essa subpasta; não use o caminho absoluto do computador local.

Mantenha `PUBLIC_INDEXABLE=false` nos deploys de prévia. O build estático não exige servidor de aplicação, banco de dados ou adapter de renderização em servidor.

## 6. Habilitar produção somente após aprovação

Com a revisão concluída, o domínio confirmado e a publicação definitiva expressamente autorizada, configure o ambiente de produção:

```dotenv
PUBLIC_INDEXABLE=true
PUBLIC_SITE_URL=https://nexoneuro.com
```

Esse endereço é o domínio pretendido no briefing. Use-o apenas após confirmar titularidade, DNS e destino efetivo. Se a origem aprovada for outra, atualize a variável antes do build.

Adicione o domínio no Pages, siga a configuração de DNS indicada pelo serviço e aguarde a emissão do certificado. Depois de HTTPS estar ativo no domínio principal e em `www`, configure no Cloudflare o redirecionamento permanente de `www.nexoneuro.com` para `nexoneuro.com`, preservando caminho e parâmetros. Valide a regra antes de disponibilizar o site.

Confira no resultado publicado:

- HTTPS válido e ausência de redirecionamentos em ciclo.
- Rotas e recursos carregando, incluindo fontes, ícone e imagem de compartilhamento.
- Metadados, canônicos, Open Graph e dados estruturados consistentes com a origem real.
- `robots.txt`, `sitemap.xml` e ausência de `noindex` apenas no ambiente aprovado de produção.
- Contatos e informações legais efetivamente operacionais.
- Navegação móvel, acessibilidade, desempenho e comportamento dos serviços externos.

Cadastre a propriedade no Google Search Console e envie o sitemap após confirmar a origem e a indexabilidade. A configuração técnica não garante posições em resultados de busca.

## 7. Operação e atualização

Cada alteração de código ou conteúdo deve passar pelas verificações e pela revisão apropriada antes de chegar à branch de produção. Preserve o modo não indexável em prévias e não apresente conteúdos clínicos ou editoriais novos como aprovados antes da revisão dos responsáveis.

Antes de adicionar analytics, formulários, agendamento ou outros serviços externos, defina finalidade, dados tratados, base legal aplicável, segurança, retenção, operadores e transparência. Atualize a política de privacidade conforme a operação real.

Em caso de regressão, o responsável pela hospedagem pode restaurar um deploy anterior validado pelo painel do serviço. Mantenha registro da versão aprovada para facilitar a recuperação.
