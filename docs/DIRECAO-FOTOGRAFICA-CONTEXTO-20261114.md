# NEXO · Fotografia que contextualiza, texto que conduz

Direção de arte aprovada em conversa de 14/11/2026, a partir da abertura de **Psicologia em Pauta** em `nexoneuro.com`.

## O problema observado

A fotografia documental de uma equipe ocupava quase toda a janela, com rostos muito grandes e cores intensas. O texto aparecia sobre o registro, mas a imagem disputava a atenção e dava à página aspecto de publicação pessoal em rede social, em vez de uma editoria de ciência, escuta e contexto.

## Hierarquia desejada

1. **A ideia, a pergunta e a informação são o primeiro plano.** A foto deve sugerir a circunstância, a reunião, a atividade, a convivência ou o ambiente.
2. **Fotografia documental como contexto, não prova clínica.** Pessoas podem aparecer, mas rostos em primeiro plano não são o foco editorial. A imagem não deve sugerir diagnóstico, vínculo profissional, autorização de paciente ou relação específica não documentada.
3. **Fusão com o ambiente visual NEXO.** Usar azul profundo, fades suaves, baixa saturação e transições graduais para não parecer um arquivo fotográfico encaixado abruptamente.
4. **Legendas e fontes permanecem acessíveis e corretas.** O fade é CSS, preserva o arquivo original e a possibilidade de consultar o registro com sua legenda. Não se substitui ou apaga pessoa em foto histórica.
5. **Leia-se primeiro o texto.** Contraste, foco de teclado, níveis de títulos e responsividade devem ser verificados em desktop e celular.
6. **Fotos da revista HTML em escala editorial, não em formato de stories.** Capa e catálogo podem usar imagens atmosferizadas; as fotografias do corpo da reportagem devem continuar inteligíveis, com tratamento mais sutil e legendas completas.
7. **Acessibilidade.** `alt` permanece fiel ao conteúdo; preferências de movimento reduzido e modo de alto contraste devem ser preservadas.

## Aplicação técnica

- `src/styles/editorial.css`: abertura da editoria e dos artigos, catálogo e fotografia de capítulo.
- `src/styles/editorial-magazine.css`: capas, sumários e capítulos na revista HTML.
- Sem alterar `src/data/editorial-photography.json`, direitos, autoria, PDFs originais, ativos fotográficos ou a experiência clínica.

## Conferências antes de publicar

- Abertura `/psicologia-em-pauta/`: título e chamada legíveis sem texto competindo com rostos; foto de equipe integrada ao azul e contexto reconhecível.
- Capítulos e catálogo: variedade entre edições mantida; todas as legendas preservadas.
- Analisar desktop e celular, incluindo retratos verticais, pessoas próximas da borda e títulos longos.
- Modo revista: capa legível, foto contextual e conteúdo documental ainda reconhecível.
- Testes de build e integridade completos. Nenhuma alteração no `noindex` institucional nem nas rotas clínicas.

**Orientação para futuras imagens:** antes de escolher uma fotografia, perguntar qual situação ela ajuda a compreender. Se a resposta for apenas “mostrar quem estava lá”, preferir um enquadramento mais contextual ou manter a imagem como registro secundário com crédito.
