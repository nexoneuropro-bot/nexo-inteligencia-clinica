# Fontes e validações — NEXO

Consulta: **14/10/2026**. Este registro apoia a redação e a implementação da prévia. Não certifica conformidade jurídica, ética, clínica, de acessibilidade ou segurança. As decisões e a publicação dependem da revisão dos responsáveis habilitados.

## Psicologia, avaliação e documentos

- O [SATEPSI/CFP — perguntas frequentes](https://satepsi.cfp.org.br/faq.cfm) remete à Resolução CFP nº 31/2022 para avaliação psicológica e à nº 06/2019 para documentos psicológicos. A escolha dos instrumentos cabe à pessoa profissional conforme demanda e contexto; a lista de testes favoráveis é atualizada periodicamente. A interface exploratória do site não deve reproduzir instrumentos restritos, avaliar sintomas, pontuar saúde mental ou receber o nome de teste psicológico.
- A [orientação oficial do CRP sobre publicidade](https://transparencia.cfp.org.br/crp16/pergunta-frequente/publicidade-dos-servicos-psicologicos/) reproduz o art. 20 do Código de Ética: identificar nome completo e CRP, divulgar qualificações possuídas e evitar previsão taxativa de resultados. O prazo de 10 a 20 sessões é apenas referência proposta no briefing, sujeita à avaliação individual e revisão clínica.
- O [CFP sobre registro de especialista](https://site.cfp.org.br/servicos/titulo-de-especialista/) informa que esse registro reconhece a atuação em especialidade e não é condição obrigatória para o exercício profissional. Ainda assim, a titulação e a formação efetivamente divulgadas precisam ser comprovadas; não inferir qualificações a partir do número do CRP.
- O [CFP sobre documentos escritos](https://site.cfp.org.br/publicada-nova-resolucao-sobre-elaboracao-de-documentos-escritos/) distingue documentos como laudo e relatório. A comunicação da NEXO deve manter claras as atribuições psicológicas e médicas, sem prometer conclusão diagnóstica específica nem documento conjunto obrigatório.

## Publicidade médica

O [CFM — Resolução nº 2.336/2023, quadro oficial](https://publicidademedica.cfm.org.br/resolucao/o-que-muda) exige nome, CRM e identificação como médico; a especialidade registrada deve vir acompanhada do RQE. A publicidade institucional também possui exigências para identificação do estabelecimento e direção técnica. A mesma fonte veda promessa de bons resultados e divulgação enganosa. **CRM não comprova, por si só, especialidade.**

Não foram consultados cadastros individuais nesta etapa. Não afirmar que Gabriel Alves Batista, CRP-SP 06/176184, ou Ivo Peixoto Barbosa Júnior, CRM-SP 193133, possuem registros ativos, títulos ou especialidades confirmados. Os dados são os fornecidos no briefing. A apresentação como psiquiatra e a divulgação médica definitiva precisam de confirmação do RQE e revisão da identificação institucional aplicável.

## Saúde mental no trabalho e NR-1

A [página vigente do Ministério do Trabalho e Emprego sobre a NR-1](https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/nr-1) informa que a nova redação do capítulo 1.5 entrou em vigor em **26/05/2026**. Ela inclui expressamente os fatores de risco psicossociais relacionados ao trabalho no GRO. Portanto, em outubro de 2026, não descrevê-la como futura.

O [texto oficial atualizado da NR-1, itens 1.5.3 e seguintes](https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/nr-01-atualizada-2025-i-3.pdf) trata de identificação, avaliação, prevenção e acompanhamento de riscos. A redação do site deve focar condições e organização do trabalho. Consultoria, treinamento ou questionário isolado não devem ser anunciados como garantia de adequação legal, certificação ou eliminação de riscos. Escopo, métodos, equipe e entregáveis exigem validação técnica antes da oferta definitiva.

## Privacidade

- A [ANPD — perguntas frequentes](https://www.gov.br/anpd/pt-br/acesso-a-informacao/perguntas-frequentes/perguntas-frequentes) classifica dados de saúde vinculados a pessoas como sensíveis e remete às hipóteses legais específicas do art. 11 da LGPD. Evitar coleta clínica na navegação e no contato comercial; um link para WhatsApp não torna o tratamento posterior automaticamente adequado.
- O [guia da ANPD sobre cookies](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_cookies_e_protecao_de_dados_pessoais) orienta transparência e boas práticas. Antes de adicionar analytics, formulários, agendamento ou serviços de terceiros, mapear dados, finalidade, base legal, destinatários, retenção, segurança e canal para exercício de direitos. A política da prévia precisa ser revisada com os dados reais do controlador e da hospedagem.

## Implementação, SEO e acessibilidade

- [Astro — renderização](https://docs.astro.build/en/guides/on-demand-rendering/): páginas são pré-renderizadas como HTML estático por padrão. Manter conteúdo e links no HTML e usar JavaScript somente para aprimoramentos.
- [Astro — sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/): o domínio configurado em `site` orienta URLs do sitemap; conferir o endereço efetivamente autorizado antes da produção.
- [Google Search Central — noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing?hl=pt-br): o rastreador precisa acessar a página para ler `noindex`. Não combinar esse objetivo com bloqueio integral em `robots.txt`; usar meta/cabeçalho apropriado ou controle de acesso para prévias. `noindex` não é proteção de dados confidenciais.
- [Cloudflare Pages — Astro](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/): a configuração estática utiliza `npm run build` e diretório `dist`. Registrar domínio e conectar contas continuam pendentes.
- [Three.js — responsividade](https://threejs.org/manual/pages/responsive.html) e [liberação de recursos](https://threejs.org/manual/pages/cleanup.html): ajustar a resolução ao tamanho exibido e liberar geometrias e materiais ao encerrar a cena.
- [W3C — WCAG 2.2](https://www.w3.org/TR/WCAG22/): o critério 2.2.2 prevê controle para pausar/parar/ocultar movimento automático não essencial acima de cinco segundos em paralelo a outro conteúdo. Respeitar movimento reduzido, teclado, foco, contraste e alternativa textual. Testes parciais não permitem afirmar conformidade integral AA.

## Bloqueios para publicação definitiva

1. Aprovação expressa da prévia e autorização para publicar no domínio definitivo, como solicitado no briefing.
2. Conferência de registros, títulos, RQE, responsável técnico e inscrições institucionais aplicáveis; aprovação da redação pelos profissionais.
3. Dados jurídicos e contato de privacidade do controlador, confirmação de domínio, operação de atendimento e serviços efetivamente disponíveis.
4. Fotografias reais e referências de identidade fornecidas no kit e integradas à prévia. Confirmar uso público das imagens e identidade final antes da publicação.
5. Aprovação dos conteúdos editoriais e da autoria antes de apresentá-los como publicados ou revisados por profissionais.
6. Revisão da política de privacidade, provedores e eventuais tratamentos de dados; e-mail sugerido não deve aparecer como operacional.
7. Verificações finais em hospedagem real, incluindo HTTPS, redirecionamentos, indexabilidade, acessibilidade, desempenho móvel e segurança. Metas de Core Web Vitals e SEO não constituem resultados garantidos.
