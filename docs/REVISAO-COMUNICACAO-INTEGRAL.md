# Revisão da comunicação e continuidade

14/10/2026. Esta revisão trata da passagem das ideias para os profissionais e da clareza dos caminhos de cuidado em todo o site. O commit e a implantação final são identificados no relatório externo que acompanha a entrega.

## Experiência

O encontro dos profissionais agora integra fotografias reais, conteúdo sobre Neuropsicologia, Psiquiatria e diálogo no cuidado e a mesma cena WebGL. A seleção altera contexto e geometria. O componente aparece na home, em Nossa abordagem, em Profissionais e em Para você. A jornada empresarial preserva seu contexto próprio, com uma passagem humana transparente.

As formas são metáforas abstratas de investigação e integração; não são modelos anatômicos ou diagnósticos. A implementação deriva as novas formas dos atributos gráficos já existentes, preservando o limite de atributos da GPU. A pausa e a alternativa estática continuam disponíveis.

Os fundos das áreas de leitura foram abertos para manter o horizonte visível. A câmera acompanha também a leitura. A animação da home continua depois da escolha de jornada e chega aos profissionais. O cabeçalho foi reforçado para separar a navegação do texto em movimento. O índice de capítulos deixa de cobrir a passagem humana.

## Serviços explicados

`CarePathways.astro` apresenta cinco entradas selecionáveis na home e em Para você: Psicoterapia, Terapia breve, Avaliação neuropsicológica, Interface com Psiquiatria e Autoconhecimento e acolhimento social. Cada entrada tem explicação, pergunta reflexiva, referência e link pertinente. No celular, a seleção conduz ao texto e há retorno ao mapa.

A pedido do titular, as páginas Psicoterapia e Para você foram complementadas para explicitar a psicoterapia breve em Análise do Comportamento, autoconhecimento e rastreios quando indicados. Os demais textos clínicos e os contatos foram preservados. A interface psiquiátrica continua condicionada à indicação individual. Não foram publicados nomes, itens ou resultados de instrumentos. O acolhimento social é descrito no site institucional com contato interno, sem link para outro projeto.

As fontes primárias e os limites editoriais estão em [REFERENCIAS-PROFISSOES.md](REFERENCIAS-PROFISSOES.md). Nomes, CRP e CRM continuam apresentados como informados; não foram acrescentados títulos de especialidade ou RQE não verificados.

## Navegação e SEO

Psicoterapia breve ganhou acesso direto no menu. Em pauta e o contexto do trabalho aparecem na navegação institucional, e a jornada empresarial leva à página de NR-1. A navegação por seções voltou ao celular. Contato e Privacidade têm abertura mais curta.

O verificador percorre os links HTML desde a home e exige que as 12 rotas sejam alcançáveis. Também verifica a presença dos cinco caminhos de cuidado. A regra que rejeita JavaScript executável inline, incompatível com a CSP, permanece no pipeline.

Títulos de busca agora identificam o assunto de cada página, preservando os títulos editoriais visíveis. A configuração de produção acrescenta Organization, WebSite, WebPage e breadcrumbs vinculados. A 404 continua sem indexação. Detalhes e fontes: [SEO-PREVIA-E-PRODUCAO.md](SEO-PREVIA-E-PRODUCAO.md).

O teste de produção foi feito apenas em artefato local isolado, sem publicar no domínio definitivo. A prévia pública permanece com `PUBLIC_INDEXABLE=false`, conforme decisão do titular, sem cartão ou Zero Trust.

## Verificação local

- Check: 34 arquivos, zero erros, avisos ou sugestões.
- Build: 13 HTMLs para 12 rotas e 404; verificador sem falhas; 12 rotas alcançáveis desde a home.
- Navegador: 12 rotas em 1440 × 900 e 390 × 844 com WebGL, um H1, noindex e sem transbordamento horizontal. Menu adaptado também conferido em 1024 × 768.
- Interações: perspectivas dos profissionais, seleção de caminhos e geometria correspondente; seleção móvel de terapia breve com foco no texto; acolhimento com link interno.
- SEO da prévia: zero canonical, zero JSON-LD de produção e sitemap vazio.
- SEO de produção local: 12 canonicals, sitemap com 12 URLs, 11 breadcrumbs, títulos/descrições distintos, 404 noindex e dados estruturados JSON válidos; zero falhas.

O bundle Three.js continua com aviso de tamanho (736.440 bytes, 185.282 em gzip). Não foram medidos Core Web Vitals, desempenho em celular físico ou conformidade integral com leitores de tela. Não houve publicação em domínio definitivo, alteração de DNS, novas dependências, novas imagens ou coleta adicional de dados.
