# Inventário e leitura do kit NEXO

Verificação em **14/10/2026** de `work/kit-nexo/NEXO_KIT_CODEX_2026`. O kit foi tratado como material de referência e configuração: nenhum arquivo foi executado, alterado ou publicado por esta auditoria.

Foram lidos integralmente `00_LEIA_PRIMEIRO.md`, os cinco arquivos de `07_DOCUMENTACAO`, os quatro arquivos de `06_CONFIGURACAO` (incluindo `.env.example`), `visualizar_kit.html` e o README de `08_EQUIPE_E_REFERENCIAS_ADICIONAIS`. Também foram lidos os SVGs de proposta e `site.webmanifest`. A inspeção visual das imagens é uma etapa complementar separada.

## Integridade e completude

- **55 arquivos físicos**, total de **15.489.467 bytes** (aproximadamente 14,77 MiB).
- **Nenhum arquivo declarado está ausente.** A comparação considerou tanto `files` quanto os quatro nomes da seção complementar `pastas` do manifesto.
- O manifesto fornece tamanho e SHA-256 para 50 arquivos: **48 correspondem integralmente** e dois documentos possuem tamanho e hash diferentes.
- Os quatro arquivos da pasta 08 estão declarados por nome, mas não têm tamanho ou hash no manifesto. Isso limita a verificação a existência e inventário local.
- O próprio `07_DOCUMENTACAO/05_MANIFESTO_ARQUIVOS.json` é o único arquivo físico não incluído em `files` nem em `pastas`; a ausência de auto-hash é esperada e não representa arquivo faltante.
- `.env.example` está presente. Algumas listagens comuns omitem arquivos cujo nome começa com ponto; a conferência incluiu arquivos ocultos.

| Arquivo divergente | Bytes no manifesto | Bytes reais | SHA-256 real |
| --- | ---: | ---: | --- |
| `07_DOCUMENTACAO/03_INVENTARIO_DE_ASSETS.md` | 1.097 | 1.545 | `4fcbe5702109c4ea9e4624e4bac340e5bcc370fa6bfd291e3d3db572ba54bebc` |
| `07_DOCUMENTACAO/04_PENDENCIAS_PUBLICACAO.md` | 954 | 1.176 | `723ae4d2e442451050f76a1f10c4c641a9fc8dec3c7030de58cacb9b3b6a4422` |

Os dois documentos contêm complementos relativos à pasta 08. Isso é compatível com uma atualização posterior à geração dos hashes, mas o histórico não está incluído no pacote; portanto, não é possível certificar a causa da divergência. Convém regenerar o manifesto após consolidar a versão final, preservando o kit recebido como referência.

## Pontos de atenção para implementação

1. **Identidade ainda provisória.** Os arquivos de logo, favicon, Apple/Android e cartões OG são propostas, embora uma pasta se chame `05_PUBLIC_PRONTO_PARA_SITE`. O `00_LEIA_PRIMEIRO.md` e o guia condicionam seu uso público à aprovação. O visualizador chama a identidade original de “aprovada como estudo de referência”, enquanto os documentos mantêm a decisão entre o X e o símbolo N+conexões pendente. Interpretar o original como referência de direção artística; não promover uma proposta nova a marca oficial sem validação.
2. **Domínio fixado nos exemplos, sem confirmação de titularidade.** `site.config.json`, `.env.example`, o exemplo de `<head>` e `robots.txt.example` apontam para `https://nexoneuro.com`. O mesmo JSON registra `domainRegistrationStatus: NAO_VERIFICADO`. O domínio é uma intenção de configuração. A prévia precisa de controle de indexação próprio; o modelo de robots permite rastreamento e foi escrito para produção após validação do domínio.
3. **Metadados são exemplos.** O `<head>` usa título e descrição fixos e não contém `noindex` para prévia. Adaptar por página e ambiente. A descrição resumida “avaliação com laudo” deve manter a ressalva “quando cabível” no conteúdo contextual e, quando necessário, nos metadados. O exemplo não inclui JSON-LD nem pretende comprovar registro profissional.
4. **Fotografias foram acrescentadas.** O guia ainda lista fotos reais como pendentes; a pasta 08 agora contém retratos identificados pelo kit como Gabriel e Ivo, e o checklist adicional pede confirmar aprovação para uso público. O fornecimento dos arquivos resolve a ausência de material, mas o pacote não contém termo específico de autorização. Não alterar a identidade dos profissionais nem inventar currículos.
5. **Visualizador incompleto em relação à versão final do pacote.** `visualizar_kit.html` mostra as três referências originais, quatro propostas PNG, os dois cartões sociais e nove recortes. Ele não mostra os três PNGs da pasta 08 nem o seu README. Também não exibe todas as variações vetoriais/PNG; isso não significa que estejam ausentes.
6. **Referências não são fotografias da operação.** Os originais e recortes são estudos de website; `NEXO_PREVIA_BANCO_DE_IMAGENS.jpg` é uma prévia do banco do kit. Não usar cenários, rostos ou trechos desses mockups para afirmar instalações reais, equipe adicional, depoimentos ou artigos publicados.
7. **Dados profissionais permanecem pendentes de conferência.** O JSON marca ambos com `reviewRequired: true`, `medicalSpecialistRegistryVerified: false` e RQE nulo para Ivo. Manter nome e números fornecidos, sem afirmar verificação. Confirmar registros, qualificação divulgada, RQE, identificação institucional e responsabilidades antes do lançamento.
8. **Escopo clínico coerente entre os documentos.** O briefing e o JSON mantêm avaliação individual, instrumentos indicados, laudo psicológico quando pertinente e articulação com Psiquiatria apenas quando clinicamente indicada após acolhimento/anamnese. Não converter isso em pacote obrigatório, documento único, garantia diagnóstica ou benefício jurídico. A menção a conteúdo editorial “revisado” é objetivo; nenhum artigo com revisão comprovada foi incluído.
9. **NR-1: sem promessa automática.** Os documentos propõem consultoria e fatores de risco psicossociais relacionados ao trabalho, sem garantir conformidade. Não há data de vigência ou afirmação futura a corrigir no texto do kit. Na redação definitiva, considerar a redação do capítulo 1.5 já vigente desde 26/05/2026, conforme fontes oficiais registradas em `FONTES-E-VALIDACOES.md`.
10. **Configuração ainda não equivale a serviço ativo.** E-mail é nulo/inativo; localização, modalidades, CNPJ e redes estão vazios. Não preencher por inferência. O manifesto web usa `display: standalone` e ícones com `purpose: any maskable`; isso, isoladamente, não configura funcionamento offline nem comprova segurança visual das áreas maskable. Os SVGs de logotipo usam texto com fontes de fallback, de modo que a aparência pode variar por ambiente até a arte final ser consolidada.

## Inventário completo

Os caminhos abaixo são relativos à raiz do kit. “Conforme” significa tamanho e SHA-256 iguais ao manifesto; não significa aprovação da identidade, autorização de uso ou validação do conteúdo clínico.

| Caminho | Bytes | Conferência |
| --- | ---: | --- |
| `00_LEIA_PRIMEIRO.md` | 1.101 | Conforme |
| `01_REFERENCIAS_ORIGINAIS/01_referencia_abertura_X_3D.png` | 2.303.186 | Conforme |
| `01_REFERENCIAS_ORIGINAIS/02_referencia_home_completa.png` | 2.215.621 | Conforme |
| `01_REFERENCIAS_ORIGINAIS/03_referencia_identidade_original.png` | 1.678.299 | Conforme |
| `02_RECORTE_DE_REFERENCIAS/01_hero_x.jpg` | 128.039 | Conforme |
| `02_RECORTE_DE_REFERENCIAS/02_biopsicossocial.jpg` | 58.838 | Conforme |
| `02_RECORTE_DE_REFERENCIAS/03_explore_ideias.jpg` | 80.005 | Conforme |
| `02_RECORTE_DE_REFERENCIAS/04_jornadas.jpg` | 67.455 | Conforme |
| `02_RECORTE_DE_REFERENCIAS/05_servicos_clinicos.jpg` | 67.054 | Conforme |
| `02_RECORTE_DE_REFERENCIAS/06_organizacoes.jpg` | 64.675 | Conforme |
| `02_RECORTE_DE_REFERENCIAS/07_psicologia_em_pauta.jpg` | 57.687 | Conforme |
| `02_RECORTE_DE_REFERENCIAS/08_sobre_nexo.jpg` | 54.401 | Conforme |
| `02_RECORTE_DE_REFERENCIAS/09_contato_rodape.jpg` | 40.969 | Conforme |
| `03_LOGO_VETORIAL_PROPOSTA/logo-nexo-horizontal-sobre-dark.svg` | 1.170 | Conforme |
| `03_LOGO_VETORIAL_PROPOSTA/logo-nexo-horizontal-sobre-light.svg` | 1.170 | Conforme |
| `03_LOGO_VETORIAL_PROPOSTA/logo-nexo-stacked-sobre-dark.svg` | 1.209 | Conforme |
| `03_LOGO_VETORIAL_PROPOSTA/logo-nexo-stacked-sobre-light.svg` | 1.209 | Conforme |
| `03_LOGO_VETORIAL_PROPOSTA/simbolo-x-azul.svg` | 821 | Conforme |
| `03_LOGO_VETORIAL_PROPOSTA/simbolo-x-fundo-azul.svg` | 980 | Conforme |
| `03_LOGO_VETORIAL_PROPOSTA/simbolo-x-transparente.svg` | 821 | Conforme |
| `04_LOGO_PNG/logo-nexo-horizontal-sobre-dark.png` | 35.919 | Conforme |
| `04_LOGO_PNG/logo-nexo-horizontal-sobre-light.png` | 36.694 | Conforme |
| `04_LOGO_PNG/logo-nexo-stacked-sobre-dark.png` | 45.447 | Conforme |
| `04_LOGO_PNG/logo-nexo-stacked-sobre-light.png` | 44.501 | Conforme |
| `04_LOGO_PNG/recorte-logo-original-referencia-fundo-azul.png` | 323.777 | Conforme |
| `04_LOGO_PNG/recorte-logo-original-referencia-fundo-marfim.png` | 285.719 | Conforme |
| `04_LOGO_PNG/simbolo-x-azul.png` | 50.377 | Conforme |
| `04_LOGO_PNG/simbolo-x-fundo-azul.png` | 80.804 | Conforme |
| `04_LOGO_PNG/simbolo-x-transparente.png` | 54.119 | Conforme |
| `05_PUBLIC_PRONTO_PARA_SITE/android-chrome-192x192.png` | 14.630 | Conforme |
| `05_PUBLIC_PRONTO_PARA_SITE/android-chrome-512x512.png` | 47.711 | Conforme |
| `05_PUBLIC_PRONTO_PARA_SITE/apple-touch-icon.png` | 13.524 | Conforme |
| `05_PUBLIC_PRONTO_PARA_SITE/favicon-16x16.png` | 656 | Conforme |
| `05_PUBLIC_PRONTO_PARA_SITE/favicon-32x32.png` | 1.589 | Conforme |
| `05_PUBLIC_PRONTO_PARA_SITE/favicon-48x48.png` | 2.644 | Conforme |
| `05_PUBLIC_PRONTO_PARA_SITE/favicon.ico` | 39.445 | Conforme |
| `05_PUBLIC_PRONTO_PARA_SITE/favicon.svg` | 980 | Conforme |
| `05_PUBLIC_PRONTO_PARA_SITE/og-image.png` | 158.244 | Conforme |
| `05_PUBLIC_PRONTO_PARA_SITE/site.webmanifest` | 588 | Conforme |
| `05_PUBLIC_PRONTO_PARA_SITE/twitter-card.png` | 157.043 | Conforme |
| `06_CONFIGURACAO/.env.example` | 346 | Conforme |
| `06_CONFIGURACAO/meta-tags-astro-example.astro` | 1.252 | Conforme |
| `06_CONFIGURACAO/robots.txt.example` | 149 | Conforme |
| `06_CONFIGURACAO/site.config.json` | 2.665 | Conforme |
| `07_DOCUMENTACAO/01_BRIEFING_PARA_CODEX.md` | 5.174 | Conforme |
| `07_DOCUMENTACAO/02_GUIA_DE_IMPLANTACAO.md` | 2.408 | Conforme |
| `07_DOCUMENTACAO/03_INVENTARIO_DE_ASSETS.md` | 1.545 | Divergente; ver tabela acima |
| `07_DOCUMENTACAO/04_PENDENCIAS_PUBLICACAO.md` | 1.176 | Divergente; ver tabela acima |
| `07_DOCUMENTACAO/05_MANIFESTO_ARQUIVOS.json` | 9.472 | Manifesto, sem auto-hash |
| `08_EQUIPE_E_REFERENCIAS_ADICIONAIS/gabriel_alves_batista_neuropsicologo.png` | 2.204.541 | Declarado por nome; sem hash |
| `08_EQUIPE_E_REFERENCIAS_ADICIONAIS/ivo_peixoto_barbosa_junior_psiquiatra.png` | 1.696.932 | Declarado por nome; sem hash |
| `08_EQUIPE_E_REFERENCIAS_ADICIONAIS/README.md` | 1.310 | Declarado por nome; sem hash |
| `08_EQUIPE_E_REFERENCIAS_ADICIONAIS/referencia_visual_home_site_nexo.png` | 3.094.480 | Declarado por nome; sem hash |
| `NEXO_PREVIA_BANCO_DE_IMAGENS.jpg` | 243.663 | Conforme |
| `visualizar_kit.html` | 5.233 | Conforme |

## Pendências preservadas

O kit solicita uma home funcional e testável, seguida de páginas internas e implantação controlada. Ele não traz uma aplicação Astro existente nem comprova aprovação final de marca, credenciais, domínio, tratamento de dados ou publicação. A entrega pode avançar como prévia, mantendo esses itens registrados. A publicação definitiva continua sujeita à autorização expressa solicitada pelo usuário.
