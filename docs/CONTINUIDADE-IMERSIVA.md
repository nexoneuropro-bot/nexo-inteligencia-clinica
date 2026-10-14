# Continuidade da experiência imersiva

14/10/2026. Implementação e validação local concluídas. O SHA remoto e a implantação desta continuidade ainda não estão confirmados neste registro.

## Resultado

As 12 rotas compartilham o ambiente WebGL. Em Nossa abordagem, sete capítulos acompanham uma travessia em profundidade, com câmera de 0 a 54 unidades e chegada ao último capítulo, índice 6, na profundidade 54. Contextos nativos permitem consultar as fontes e retornar à experiência; Escape fecha o contexto e devolve o foco ao acionador.

A navegação mobile permite acessar Para Você e fecha o menu após a escolha. A pausa nativa altera o estado da cena para `stage.paused=true` e apresenta Retomar.

O ajuste final de CSS limita o índice lateral a 25 px para evitar uma área invisível sobreposta aos cliques. A nota introdutória é ocultada no mobile para evitar cruzamento com os controles.

O conteúdo clínico de `src/data/pages.ts` e `src/data/reflections.ts` permanece inalterado. Não foram acrescentados coletores de dados, dependências ou imagens.

## Fontes e recorte editorial

O conteúdo está em `src/data/approach-history.ts`. As fontes, os trechos consultados e os limites editoriais estão em [REFERENCIAS-ABORDAGEM.md](REFERENCIAS-ABORDAGEM.md).

Os sete encontros tratam de Platão/Aristóteles, Bacon, Pinel, Wundt/James, Vygotsky, Engel e a proposta atual da NEXO. O último encontro usa referência institucional interna; os anteriores usam obras históricas e acervos identificados. São três citações curtas, de Aristóteles, James e Engel, com tradução livre e atribuição.

A sequência é uma seleção editorial, não uma história universal, uma filiação teórica da NEXO ou uma escala de progresso entre saberes. Perguntas e metáforas espaciais são autorais. O percurso não oferece teste, diagnóstico ou validação de resultados clínicos.

## Validação local

| Verificação | Resultado |
| --- | --- |
| `pnpm check` | 29 arquivos; zero erros, avisos ou sugestões |
| Build final | Concluído às 16:29:21; 13 HTMLs para 12 rotas e 404 |
| `pnpm verify` | Zero falhas |
| Desktop 1440 × 900 | As 12 rotas com WebGL, um H1, sem transbordamento horizontal e com `noindex` |
| Mobile 390 × 844 | As 12 rotas com os mesmos critérios; home examinada separadamente das 11 internas |
| Contextos | Fontes de psiquiatria e Engel abertas; Escape e retorno de foco confirmados |
| Menu mobile | Para Você acessível, com fechamento do menu |
| Pausa | Estado pausado e rótulo Retomar confirmados |

As últimas correções após o check foram somente de CSS. Lighthouse, Core Web Vitals e aparelho físico não foram medidos. As capturas reais e os relatórios de entrega ficam fora do repositório, em `outputs/capturas-continuidade` e nos documentos de entrega que acompanham o projeto.

## Publicação temporária e acesso

O projeto Pages é `nexo-previa-20261014`, com URL [nexo-previa-20261014.pages.dev](https://nexo-previa-20261014.pages.dev/). O hostname principal respondeu HTTP 200 sem autenticação, com meta robots `noindex,follow` e cabeçalho `X-Robots-Tag: noindex, follow`. Esse resultado refere-se à publicação disponível; não confirma a implantação desta continuidade.

O último commit remoto registrado antes desta revisão é `903d003a37cb43608f6ef5dc17854d0074c3f95f`, na branch `feat/experiencia-imersiva`. O [PR rascunho #1](https://github.com/nexoneuropro-bot/nexo-inteligencia-clinica/pull/1) permanece sem merge. Conferir e registrar o novo SHA no build remoto antes de anunciar a revisão como implantada.

`Restrict previews` está habilitada para `*.nexo-previa-20261014.pages.dev` e não protege o hostname principal, que continua público. `noindex` não restringe acesso humano.

A ativação do Zero Trust solicitou cartão e aceitação de termos com cobrança recorrente por excedentes; essa etapa não foi confirmada. A escolha do titular entre prévia pública com `noindex` e ativação pessoal de acesso restrito continua pendente. Se o acesso restrito for escolhido, ainda será necessário configurar a lista de avaliadores e testar cada hostname sem sessão.

Nenhum domínio personalizado foi associado. O domínio definitivo e o DNS não foram alterados. A auditoria anterior dos 77 arquivos do escopo reduzido não identificou segredos ou dados clínicos privados; não foi uma auditoria integral da conta ou infraestrutura.
