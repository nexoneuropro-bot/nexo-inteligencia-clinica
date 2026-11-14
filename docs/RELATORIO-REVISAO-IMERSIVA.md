# NEXO — revisão da experiência imersiva

Data: **14/10/2026**. Prova de conceito funcional na branch `feat/experiencia-imersiva`, para validação artística antes de adaptar as demais páginas. Não houve publicação em `nexoneuro.com`.

## Resultado e direção visual

A home passa a apresentar quatro capítulos conectados: abertura e formação do X, transformação para o universo biopsicossocial, exploração de ideias e transição para os caminhos **Para Você** e **Para Sua Empresa**. As duas jornadas receberam entradas próprias que prolongam o mesmo ambiente visual. Fotografias reais de Gabriel e Ivo introduzem presença humana e contraste com o universo abstrato.

A [referência visual enviada pelo usuário](https://images.reallygooddesigns.com/2024/12/captivating-boating-history-3d-design.webp) foi interpretada por meio de horizonte, campo ondulante e pontos em perspectiva. Esses elementos são construídos com geometria WebGL real, movimento de câmera e resposta à interação; a referência orienta a composição e não funciona como fundo que simula uma cena interativa.

O conteúdo clínico em `src/data/pages.ts` e o conteúdo de `src/data/reflections.ts` não foram alterados. As páginas individuais, títulos, descrições e estrutura de SEO foram preservados. A exploração contém dez contextos históricos e científicos documentados, duas citações verificadas com tradução livre e quatro sentidos do X. Perguntas e conexões são convites à reflexão; não há quiz clínico, pontuação ou diagnóstico.

## Componentes e técnicas

| Arquivo | Responsabilidade |
| --- | --- |
| `ExperienceHome.astro` | Narrativa editorial e composição dos quatro capítulos. |
| `ExperienceStage.astro` | Canvas decorativo, alternativa estática em SVG e integração progressiva. |
| `experience-scene.ts` | Cena Three.js, partículas e conexões em profundidade, formação e transformação da geometria, câmera e respostas a mouse, toque e rolagem. |
| `JourneyEntry.astro` | Entradas contínuas nas jornadas, com atmosferas próprias. |
| `KnowledgePanel.astro` e `experience-ui.ts` | Contextos, fontes, citações, seleção de dimensões, novas perguntas e agrupamentos mobile. |
| `knowledge.ts` | Dez contextos contextualizados, duas citações e quatro leituras do X. |
| `ExperienceNav.astro`, `ExperienceFooter.astro` e `experience.css` | Navegação, rodapé, tipografia, fotografia e composição responsiva. |

O canvas é uma camada visual. Conteúdo institucional e destinos de navegação permanecem em HTML. A implementação inclui foco visível, navegação por teclado, retorno de foco ao fechar conexões, controles para pular a abertura e pausar movimento, preferência por movimento reduzido e alternativa sem WebGL. A versão anterior foi preservada em `references/versao-1/`.

Fontes e limites editoriais: [REFERENCIAS-EXPERIENCIA.md](REFERENCIAS-EXPERIENCIA.md).

## Testes executados

- Rotina `check` (`node scripts/astro.mjs check`, a mesma chamada por `pnpm check`): **26 arquivos**, zero erros, avisos ou sugestões.
- Rotina `build` (`node scripts/astro.mjs build`): conclusão sem erros; **13 HTMLs**, incluindo 404, para as 12 rotas institucionais.
- Rotina `verify` (`node scripts/verify.mjs`): zero falhas nas verificações de rotas, HTML, destinos e recursos.
- Após o ajuste final do CSS mobile, build e verificação foram repetidos sem falhas. As 12 rotas responderam HTTP 200 na porta 4321; a home atualizada também foi confirmada com HTTP 200 no endereço de rede local.
- Navegação real por automação CUA em **1440 × 900** e **390 × 844**: ausência de overflow horizontal na home e na jornada examinadas.
- Modo `webgl` confirmado na home, em Para Você e em Para Sua Empresa.
- Painéis de Arendt e Aristóteles: citação traduzida, atribuição e link próprio da fonte verificados. **Escape** fechou o painel e devolveu o foco.
- Seleções **Social** e **Psicológica**, troca de reflexão e alternância dos grupos de cinco contextos no mobile verificadas.
- Pausa: estado registrado no `dataset` e câmera estável durante a observação.

As constatações acima descrevem os cenários executados. Não constituem auditoria completa de acessibilidade ou conformidade.

## Capturas reais

| Desktop — 1440 × 900 | Mobile — 390 × 844 |
| --- | --- |
| [Universo e abertura](../../capturas-revisao/desktop-universo.jpg) | [Universo e abertura](../../capturas-revisao/mobile-universo.jpg) |
| [Conexão com Arendt](../../capturas-revisao/desktop-conexao-arendt.jpg) | [Conexão com Aristóteles](../../capturas-revisao/mobile-conexao-aristoteles.jpg) |
| [Dimensões biopsicossociais](../../capturas-revisao/desktop-biopsicossocial.jpg) | [Dimensões biopsicossociais](../../capturas-revisao/mobile-biopsicossocial.jpg) |
| [Constelação](../../capturas-revisao/desktop-constelacao.jpg) | [Constelação](../../capturas-revisao/mobile-constelacao.jpg) |
| [Para Você](../../capturas-revisao/desktop-para-voce.jpg) | [Para Você](../../capturas-revisao/mobile-para-voce.jpg) |
| [Para Sua Empresa](../../capturas-revisao/desktop-para-empresa.jpg) | — |

São capturas do navegador executando a implementação. Os links desta tabela funcionam no pacote local; as capturas não são publicadas no repositório. Não foi produzida uma gravação curta nesta etapa.

## Desempenho e limites

O build emitiu aviso de tamanho do bundle Three.js: **736.440 bytes**, ou **185.282 bytes com gzip**. A biblioteca é carregada progressivamente nas três rotas que usam a cena. As demais páginas institucionais mantêm sua arquitetura estática.

Ainda não foram medidos LCP, INP, CLS ou desempenho em celular físico. A preferência de movimento reduzido está implementada, mas sua execução específica não foi testada neste ciclo. Também não houve teste com leitor de tela. A resposta em dispositivos com GPU, memória, rede e versões de navegador diferentes exige medição própria; os resultados desktop e mobile em viewport não comprovam desempenho em hardware móvel.

## Prévia e GitHub

A prévia principal é a saída compilada atualizada: [127.0.0.1:4321](http://127.0.0.1:4321/). No celular conectado à mesma rede: [192.168.0.14:4321](http://192.168.0.14:4321/). O navegador foi conferido nessa versão compilada. O desenvolvimento também estava disponível em [127.0.0.1:4323](http://127.0.0.1:4323/), servido com `host 0.0.0.0`. Os links locais dependem de os servidores permanecerem ativos e da conectividade da rede.

A primeira versão foi enviada para `main` no [commit 856b815](https://github.com/nexoneuropro-bot/nexo-inteligencia-clinica/commit/856b815123c18c5c11ccefd24e387dd5a8e318a2), com 65 arquivos. O commit ou pull request de `feat/experiencia-imersiva` é vinculado na entrega em chat.

Os originais de `references/kit/` e o recorte de logo original foram excluídos do envio ao GitHub após rejeição da revisão automática de aprovação. O kit integral continua preservado na entrega local.

## Pendências para a próxima etapa

Aprovação artística desta prova de conceito; conferência dos dados profissionais, registros, títulos e RQE; autorização do uso público das fotografias; revisão dos dados operacionais e de privacidade; medição em ambiente e dispositivos reais. A adaptação do restante do site e a implantação definitiva aguardam a validação do usuário.
