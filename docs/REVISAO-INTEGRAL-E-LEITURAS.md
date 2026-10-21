# Revisão integral e Psicologia em Pauta

16 de outubro de 2026.

A linguagem visual acompanha as páginas de leitura: Psicologia em Pauta conecta órbitas durante a rolagem; Profissionais preserva o encontro entre perspectivas; Contato e Privacidade usam composições discretas. A 404 recebe a mesma navegação e uma alternativa espacial, com caminhos claros de retorno. As formas são metáforas visuais, sem representar causalidade ou avaliação clínica.

Foram removidos das páginas os avisos internos de preparação e revisão. Os registros profissionais aparecem diretamente. Contato apresenta somente o telefone e WhatsApp existentes. Privacidade descreve o comportamento implementado, incluindo armazenamento de apresentação na sessão, áudio opcional local, hospedagem e serviços externos. A revisão editorial não confirma dados operacionais ausentes nem certifica conformidade jurídica.

Os painéis de conhecimento e as fontes da história receberam tipografia maior e controles de fechamento com área mínima de 44 px. A navegação inclui Em Pauta; o menu compacto evita comprimir os links em larguras intermediárias. A auto-observação utiliza as fontes já carregadas pelo projeto.

## Guias educativos

O kit não continha artigos completos: apenas uma imagem de referência da seção. Foram criados três materiais educativos novos, derivados dos conteúdos institucionais e das fontes primárias indicadas em cada leitura:

1. Observar relações no cotidiano.
2. Caminhos de cuidado.
3. Condições de trabalho e NR-1.

Todos têm leitura integral em HTML e um PDF de duas páginas, com identidade comum, data, numeração e referências clicáveis. Não são apresentados como artigos científicos ou textos assinados/revisados pelos profissionais. Não reproduzem escalas ou instrumentos, não pontuam visitantes e não coletam respostas.

`src/data/learning-guides.json` é a fonte de conteúdo da página e dos arquivos. `scripts/generate-learning-guides.py` gera os PDFs com ReportLab, valida páginas/seções com pypdf e atualiza os tamanhos no catálogo. O build do site usa os PDFs já versionados e não precisa de Python. Após editar o catálogo, é necessário regenerar e conferir visualmente os PDFs antes de publicar. Os tamanhos e as assinaturas dos arquivos também são conferidos pelo verificador estático.

## SEO e publicação

Os textos e as fontes estão no HTML, inclusive quando a leitura usa um elemento `details`. Títulos e descrições acompanham os assuntos atuais. Foram preservadas as 12 rotas institucionais, os links entre páginas, o controle de canonical, o sitemap e os dados estruturados de produção já existentes. Os guias não criam novas rotas de artigos nem atribuem credenciais ou autoria inexistentes.

A prévia temporária continua pública, com `PUBLIC_INDEXABLE=false`, meta `noindex` nas páginas e `X-Robots-Tag` também nos downloads diretos. A remoção de avisos visuais não altera essa proteção contra indexação. O domínio definitivo e a branch principal não fazem parte desta implantação.

Resultados do build, da navegação e da implantação são registrados no relatório de entrega que acompanha esta revisão. As verificações automatizadas não equivalem a uma auditoria completa de acessibilidade, desempenho ou conformidade clínica/jurídica.
