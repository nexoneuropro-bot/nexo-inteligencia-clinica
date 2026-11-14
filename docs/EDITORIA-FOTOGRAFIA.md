# Fotografia editorial — restauração de 18/10/2026

O inventário verificável está em `src/data/editorial-photography.json`. Cada imagem registra arquivo, dimensões, texto alternativo, legenda, crédito, papel visual, SHA256 do JPEG, PDF de origem, SHA256 do PDF, página, chave do objeto de imagem e, quando necessário, coordenadas do recorte. As imagens foram extraídas dos PDFs fornecidos; não houve geração de pessoas ou alteração de seus rostos.

A autorização direta do titular está registrada em `AUTORIZACAO-EDITORIAL-IMAGENS.md`, de 17/10/2026. O inventário não atribui uma licença de terceiros, identidades ou diagnósticos às pessoas presentes nas cenas ilustrativas.

## Capas e aberturas

| Edição | Fotografia e origem | Crédito e contexto |
| --- | --- | --- |
| Relações e reciprocidade | Cena de cooperação doméstica; Tabloid Premium v4, p. 6, recorte da primeira fotografia da faixa | Acervo editorial próprio; imagem ilustrativa. A REV05 contém apenas retrato do autor e mapas; a transferência de imagem entre edições está documentada. |
| Neurodivergência e comunicação | Conversa em sofá; premium_v2, p. 1 | Acervo editorial próprio; imagem ilustrativa. Não identifica diagnóstico ou paciente. |
| O que faz um psicólogo | Duas pessoas em diálogo; Tabloid Premium v4, p. 1, recorte da primeira fotografia da faixa | Acervo editorial próprio; imagem ilustrativa. Não identifica papéis profissionais ou vínculo de atendimento. |
| Análise do Comportamento | Retrato de Gabriel Alves Batista; edição original, p. 1 e p. 7 | Acervo do autor. A legenda identifica autor e curador. O original não oferece outra fotografia temática; a figura de Skinner é ilustração editorial. |
| Escuta, atenção e relações | Conversa em ambiente de serviço; premium_v2, p. 13 | Acervo editorial próprio; imagem ilustrativa. A transferência entre edições está documentada. O raster residual da p. 9 de Escuta contém texto/tabela e foi excluído. |
| Quem cuida de quem cuida | Registro de equipe multiprofissional; edição original, p. 6 | Acervo do autor; legenda documental preservada. |

## Fotografias internas

Cinco outras fotografias, sem repetir a cena de capa nos capítulos: convivência na cozinha em Relações (`expectativa-e-capacidade`); entrevista e desconforto em contexto em Neuro (`avaliacao-responsavel` e `sensorialidade-e-acolhimento`); diálogo diante de computador em Profissão (`tempo-tecnico`); atendimento em serviço em Cuidado (`reportagem-visual`, p. 5 do original). Os capítulos das outras edições preservam seu conteúdo sem inventar fotografias que os originais não oferecem.

As mesmas escolhas de capa e de capítulo alimentam o catálogo, as aberturas HTML, a revista e a geração do PDF. Reapresentar uma capa na miniatura e no sumário identifica a mesma edição; fotografias de capítulos são cenas distintas. A fotografia de equipe também abre a editoria como destaque da edição Cuidado.

## Causa da perda visual

Antes desta restauração, `EditorialLanding.astro` usava uma constelação SVG na abertura e `EditorialArtwork` em quatro das seis edições. `[article].astro` exibia fotografia apenas nos temas `neuro` e `profession`, condicionada à prévia; os demais recebiam diagramas. `EditorialMagazine.astro` limitava a foto de capa aos mesmos dois temas. O modelo de blocos e os renderizadores de capítulos não tinham fotografias. O diretório `public/psicologia-em-pauta/imagens` não era uma pasta ausente por engano: as imagens são emitidas por uma rota estática de prévia a partir de `src/assets/editorial-images`.

## Verificação

Foram conferidos os hashes dos PDFs, as assinaturas JPEG, a abertura das 11 imagens e suas dimensões. Os recortes foram inspecionados para excluir textos incorporados e cenas vizinhas. Os quatro componentes Astro alterados passaram pelo compilador instalado sem diagnóstico. A checagem geral e a inspeção de layout no navegador pertencem à validação integrada da entrega.
