# NEXO · O que pensamos? / Relacionamento aberto
**Projeto de pesquisa social exploratória, revisão humana. Versão de código 12/11/2026.**

## Pergunta de investigação
O que pessoas adultas residentes no Brasil compreendem pela expressão “relacionamento aberto” e quais diferenças de significado podem aparecer entre os perfis sociodemográficos dos respondentes?

A pesquisa NÃO mede acerto/erro, adesão, aceitação, disposição para viver o modelo ou “competência” dos participantes. A literatura científica é usada **depois** das respostas para contextualizar o debate, não para induzir definições no formulário.

## Percurso
- Página: `/pesquisa/relacionamento-aberto/`.
- Três questões abertas, nesta ordem: associação espontânea, significado, funcionamento imaginado.
- Só depois: idade, UF, escolaridade, gênero, orientação sexual, situação afetiva, tipo de território e familiaridade prévia. Todas opcionais, incluindo “prefiro não informar”.
- Consentimento social independente da assistência, confirmação de maioridade, permissão opcional separada para pequenos trechos desidentificados. Recusa não prejudica o acesso ao NEXO.
- Ditado somente se o navegador **confirmar** `SpeechRecognition.processLocally` para pt-BR; não usar serviço remoto como fallback. A transcrição aparece no campo editável e só é transmitida após confirmação final. O programa nunca usa `MediaRecorder`, upload de áudio ou armazenamento local.
- Não há `localStorage`, cookies do participante, prontuário, classificação, IA decisória, captura de dados clínicos ou análise automática.
- O servidor guarda as respostas textuais e o perfil, cifrados e acessíveis apenas via sessão profissional existente, para revisão humana. A pessoa recebe recibo aleatório cujo hash permite retirada durante a retenção.
- A referência a “sem identificação direta” NÃO é garantia de anonimato: o texto livre e perfis raros podem ser indiretamente identificáveis. Nunca publicar respostas brutas, grupos pequenos ou trechos sem revisão e autorização.
- O formulário mostra o estado real da coleta. Mesmo quando o roteiro pode ser testado em modo prévia, botão de envio fica desativado se o backend está fechado.

## Princípio da IA
> IA como apoio à reflexão e à busca de fontes confiáveis, não como profissional nem como juíza das pessoas.

Regras para futuros fluxos de pesquisa assistida por IA:
1. Não emitir escore de conhecimento, classificação de participante, diagnóstico, análise clínica ou conclusões psicológicas.
2. Preservar trechos originais e separar *fala observada*, *hipótese de interpretação proposta por humano* e *evidência científica*.
3. Fontes bibliográficas devem identificar autoria, título, ano, desenho de estudo e URL/DOI conferível; **nunca inventar citações**.
4. Indicar limites do método, contexto sociocultural, viés de amostragem e diferenças entre correlação e causa.
5. Todo tema analítico, divulgação, inferência e comparação com literatura requer validação do profissional responsável.

## Painel e acesso
- Painel documental: `/pesquisa/relacionamento-aberto-painel/`.
- Apenas sessão de profissional NEXO autentica `GET /api/pesquisa-relacionamento/records?offset=...`.
- Exibição das respostas textuais **sem categorização automática** e exportação local JSON para trabalho humano. Arquivos exportados são sensíveis e ficam fora do controle do servidor; o profissional responde por seu armazenamento seguro e descarte.
- Fontes visíveis no painel somente, para não contaminar o instrumento. Um eventual assistente de pesquisa com busca dinâmica, avaliação de qualidade e fontes recentes é uma etapa separada; **não está implementado nem alegado como ativo**.

## Ativação operacional segura
O código GitHub e o endereço planejado **não comprovam publicação**. A coleta está FECHADA por padrão.

1. Conferir branch de base `feat/nexo-piloto-seguro-20261112`, sem substituir `main` ou dados assistenciais. Executar build/checagens do Astro e `node --experimental-strip-types --test scripts/test-relationship-research.mjs`.
2. Confirmar no Cloudflare Pages a branch/commit efetivamente implantados, CSP, HTTPS, política de privacidade, ausência de telemetria, permissão local de microfone apenas na rota de pesquisa e acessibilidade móvel.
3. Backup do D1 e migração **aditiva** `migrations/0004_pesquisa_relacionamento_aberto.sql` após 0001-0003. Validar criptografia AES-GCM, autenticação passkey, limitação de taxa e a rotina efetiva de descarte.
4. Documentar finalidade, decisão ética aplicável e base legal específica da pesquisa. O projeto não cria parecer ou dispensa ética automaticamente. A revisão das categorias sensíveis (sobretudo orientação sexual) é obrigatória. Conferir participação voluntária, direitos, aviso de privacidade e contato.
5. Testar com relatos FICTÍCIOS: coleta fechada; três perguntas; voz local; perfis opcionais; validação de consentimento; receber; consultar sob passkey; negar sem sessão; obter recibo; excluir; purgar; simular indisponibilidade.
6. Somente após confirmação real de todos os requisitos, configurar no ambiente de produção:
   - `NEXO_RELATIONSHIP_RESEARCH_ENABLED=true`
   - `NEXO_RELATIONSHIP_RESEARCH_REVIEWED=true`
   - `NEXO_RELATIONSHIP_RESEARCH_ETHICS_REFERENCE` = documentação concreta do enquadramento ético (mín. 20 caracteres)
   - `NEXO_RELATIONSHIP_RESEARCH_OPEN_UNTIL` = data ISO futura de encerramento da coleta
   As flags do acolhimento clínico são independentes. Não alterar `NEXO_DEMO_ONLY` para contorná-las.
7. Confirmar `GET /api/pesquisa-relacionamento/status` com `open:true` **no domínio publicado** e uma submissão sintética de ponta a ponta, retirando-a antes de divulgar o link.

## Protocolo de análise posterior
Fase exploratória com seleção voluntária e não probabilística: resultados não representam automaticamente o Brasil. Testar compreensão e usabilidade em 8–10 pessoas; registrar critérios, canais de recrutamento, período, fluxo de exclusão e número de respostas válidas. Análise de conteúdo e construção de códigos **sob decisão do pesquisador**, com definição transparente de temas e registro de divergências. Comparar perfis apenas com células suficientemente grandes para preservar confidencialidade; não utilizar categorias demográficas como avaliação de capacidade.

## Fontes verificadas na preparação
- Pew Research Center, *Writing Survey Questions*: https://www.pewresearch.org/writing-survey-questions/
- Cardoso D, Pascoal PM, Maiochi FH (2021), *Defining Polyamory: A Thematic Analysis of Lay People's Definitions*, DOI https://doi.org/10.1007/s10508-021-02002-y (conceito relacionado, não sinônimo do objeto do estudo).
- Scoats R, Campbell C (2022), *What do we know about consensual non-monogamy?*, DOI https://doi.org/10.1016/j.copsyc.2022.101468 (revisão para debate posterior).
- CNS, Resolução 510/2016: https://bvsms.saude.gov.br/bvs/saudelegis/cns/2016/res0510_07_04_2016.html
- ANPD, Guia de dados pessoais para fins acadêmicos e pesquisas: https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-tratamento-de-dados-pessoais-para-fins-academicos-e-para-a-realizacao-de-estudos-e-pesquisas
- MDN, ditado no dispositivo: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/processLocally

**Nota de segurança:** a aplicação não consulta automaticamente essas fontes. Trata-se de uma curadoria editorial documentada. Não enviar dados individuais dos participantes a ferramentas generativas sem uma nova avaliação de finalidade, bases legais, segurança e autorização cabível.
