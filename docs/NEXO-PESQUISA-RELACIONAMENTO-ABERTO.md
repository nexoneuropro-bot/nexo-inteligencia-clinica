# NEXO · O que pensamos? / Relacionamento aberto
**Projeto de pesquisa social exploratória, revisão humana. Versão de código 12/11/2026.**

## Pergunta de investigação
O que pessoas adultas residentes no Brasil compreendem pela expressão “relacionamento aberto” e quais diferenças de significado podem aparecer entre os perfis sociodemográficos dos respondentes?

A pesquisa NÃO mede acerto/erro, adesão, aceitação, disposição para viver o modelo ou “competência” dos participantes. A literatura científica é usada **depois** das respostas para contextualizar o debate, não para induzir definições no formulário.

## Percurso
- Página: `/pesquisa/relacionamento-aberto/`.
- Três questões abertas, nesta ordem: associação espontânea, significado, funcionamento imaginado.
- Só depois: idade, UF, escolaridade, gênero, orientação sexual, situação afetiva, tipo de território e familiaridade prévia. Todas opcionais, incluindo “prefiro não informar”. **Orientação sexual é dado sensível**: o preenchimento exige autorização específica, separada do consentimento geral.
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
4. Documentar finalidade, decisão ética aplicável e base legal específica da pesquisa. O projeto não cria parecer ou dispensa ética automaticamente. A orientação sexual foi mantida a pedido do pesquisador como variável opcional, com autorização própria e hipótese comparativa exploratória. É necessária análise específica de necessidade, base legal e riscos de identificação indireta na revisão ética antes da coleta. Conferir participação voluntária, direitos, aviso de privacidade e contato.
5. Testar com relatos FICTÍCIOS: coleta fechada; três perguntas; voz local; perfis opcionais; validação de consentimento; receber; consultar sob passkey; negar sem sessão; obter recibo; excluir; purgar; simular indisponibilidade.
6. Somente após confirmação real de todos os requisitos, configurar no ambiente de produção:
   - `NEXO_RELATIONSHIP_RESEARCH_ENABLED=true`
   - `NEXO_RELATIONSHIP_RESEARCH_REVIEWED=true`
   - `NEXO_RELATIONSHIP_RESEARCH_ETHICS_REFERENCE` = referência textual concreta à decisão ética documentada (mín. 20 caracteres). Se dispensado do CEP, usar nota interna real de enquadramento CNS 510/2016 art. 1º p.u. I, com data/responsável e justificativa; não inventar número de parecer.
   - `NEXO_RELATIONSHIP_RESEARCH_OPEN_UNTIL` = data ISO futura de encerramento da coleta
   As flags do acolhimento clínico são independentes. Não alterar `NEXO_DEMO_ONLY` para contorná-las.
7. Confirmar `GET /api/pesquisa-relacionamento/status` com `open:true` **no domínio publicado** e uma submissão sintética de ponta a ponta, retirando-a antes de divulgar o link.

## Identificação da responsabilidade científica e RCLE (revisão 12/11/2026)
- **Pesquisador responsável informado pelo titular:** Gabriel Alves Batista, psicólogo, CRP 06/176184. NEXO Inteligência Clínica, nexoneuro.com.br.
- **Natureza:** estudo científico qualitativo, exploratório, de escuta dos significados populares. A análise e a interpretação cabem a profissionais; IA não lê ou codifica respostas individuais.
- **RCLE para participantes:** texto integral no início da página /pesquisa/relacionamento-aberto/; cópia imprimível em /pesquisa/relacionamento-aberto-termo/ com opção de imprimir/salvar PDF pelo navegador. Versão `nexo-relacionamento-aberto-consent-2026-11-12-v3`.
- **Contato institucional disponível na aplicação:** nexoneuropro@gmail.com. Informar dados de CEP apenas se o estudo for submetido ou a instância for aplicável; jamais inventar vínculo ou parecer. Em caso de enquadramento documentado na dispensa, indicar a base normativa e o contato do responsável.
- **Risco:** classificação preliminar proposta como mínima; arts. 18 e 21 da Resolução CNS 510/2016 disciplinam risco e gradação, enquanto o art. 19 determina precauções e proteção. A gradação definitiva depende de avaliação aplicável.
- **Pesquisa de opinião não identificável:** o art. 1º, parágrafo único, I, da Resolução CNS 510/2016 e o art. 26, I, da Resolução CNS 674/2022 dispensam de registro/avaliação no Sistema CEP/Conep as pesquisas que se enquadrem como opinião pública com participantes não identificáveis. O art. 2º, XIV, da 510 inclui a descrição de sentidos atribuídos a temas. O Ofício Circular Conep 17/2022 exige finalidade exclusivamente descritiva e ausência de possibilidade de identificação desde a coleta. Não é exigível número de parecer CEP quando o projeto estiver efetivamente enquadrado na dispensa; isso não elimina responsabilidade técnica, protocolo interno, consentimento e LGPD. Com três relatos livres associados a oito campos opcionais de perfil, especialmente orientação sexual, a ausência de identificação indireta não está demonstrada automaticamente. Documentar a decisão fundamentada com os critérios abaixo; em dúvida substantiva, consultar instância de ética competente antes da coleta.
- **LGPD:** fundamentar e registrar base jurídica efetivamente aplicável, incluindo as hipóteses para dado sensível do art. 11. O dado orientação sexual tem consentimento específico no formulário; consentimento para participação não substitui avaliação de base legal do tratamento. O enquadramento `órgão de pesquisa` (art. 7º, IV) não deve ser presumido sem conferência da natureza e constituição da instituição; dados eventualmente sensíveis dependem de análise adicional do art. 11.
- **Retenção:** a aplicação define até 81 dias **por resposta**, não 81 dias para o ciclo inteiro da pesquisa. O Worker programado elimina registros expirados da tabela. Documentar o tratamento e descarte de exportações locais, cópias e backups, sem prometer apagamento irreversível não verificado.
- **Ativação condicionada:** `NEXO_RELATIONSHIP_RESEARCH_REVIEWED` requer decisão documentada pelo responsável técnico sobre aplicação da dispensa **ou** apreciação ética cabível, e revisão operacional. `ETHICS_REFERENCE` pode apontar para uma nota interna assinada de enquadramento no art. 1º, parágrafo único, I, se a pesquisa satisfizer as condições; não inventar parecer CEP ou preencher apenas com esta minuta. Se não for possível assegurar a não identificabilidade, não usar a dispensa como atalho.
- **Responsabilidade:** art. 16 da Resolução CFP 10/2005 contempla riscos da pesquisa, participação voluntária, sigilo e proteção. Direitos à assistência e indenização dependem das disposições aplicáveis, não são substituídos pela declaração de risco mínimo.

### Normas consultadas
- Resolução CNS 510/2016: https://bvsms.saude.gov.br/bvs/saudelegis/cns/2016/res0510_07_04_2016.html
- Resolução CNS 674/2022, art. 26: https://bvs.saude.gov.br/bvs/saudelegis/cns/2022/res0674_06_07_2022.html
- Ofício Circular Conep 17/2022: https://www.ufmg.br/bioetica/cep/wp-content/uploads/2022/07/SEI_MS-0027884544-Of%C3%ADcio-Circular-1.html
- Código de Ética CFP 10/2005: https://transparencia.cfp.org.br/wp-content/uploads/sites/16/2024/08/Resolucao-do-Exercicio-Profissional-10-2005-do-Conselho-Federal-de-Psicologia-BR.pdf
- Lei 14.874/2024: https://www2.camara.leg.br/legin/fed/lei/2024/lei-14874-28-maio-2024-795693-norma-pl.html
- Decreto 12.651/2025: https://www2.camara.leg.br/legin/fed/decret/2025/decreto-12651-7-outubro-2025-798105-publicacaooriginal-176652-pe.html
- LGPD, Lei 13.709/2018: https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-normaatualizada-pl.html

## Critérios verificáveis para eventual dispensa de CEP/Conep

A não submissão prevista na Resolução CNS 510/2016, art. 1º, parágrafo único, I, **não é uma regra automática para qualquer pesquisa voluntária, curta ou sem nome**. A equipe deve conservar registro interno datado, assinado pelo responsável técnico, respondendo:

1. A finalidade **única** desta etapa é descrever significados atribuídos à expressão, sem avaliação individual, intervenção clínica, pontuação psicológica ou produção de perfis interpretativos individualizados? Uma futura pesquisa maior será objeto de protocolo próprio?
2. Há impossibilidade prática de identificação do participante **desde o instante da coleta**, considerando trechos livres, possíveis nomes inseridos, idade em faixas, UF, escolaridade, gênero, orientação sexual, situação afetiva e localidade, individualmente ou combinados?
3. A infraestrutura registra IP, user agent, logs, métricas ou outras chaves que poderiam reidentificar os dados? O uso de recibos e contadores de taxa deve ser revisado à luz dessa impossibilidade de identificação.
4. O dado sensível opcional de orientação sexual é necessário, está respaldado por base jurídica adequada (LGPD, art. 11), possui aceite destacado, acesso restrito, política de divulgação agregada e controles que evitem reidentificação de grupos pequenos?
5. O aviso ao participante, registro do consentimento, direito de retirada, retenção, segurança, descarte e contato institucional são verificáveis?

**Decisão:** Se todos os requisitos forem demonstrados, registrar a dispensa de submissão ao Sistema CEP/Conep com base na norma, e não em número de parecer inexistente. Se não forem demonstrados, adaptar a coleta ou buscar a análise ética cabível. Guardar esta decisão separadamente da configuração clínica. Esta seção registra critérios, não certifica que a versão atual do formulário já os atende.

Base normativa: Resolução CNS 510/2016, arts. 1º e 2º, XIV; Resolução CNS 674/2022, art. 26, I; Ofício Circular Conep 17/2022; LGPD, arts. 6º, 7º e 11.

## Justificativa da orientação sexual e não indução

A pergunta é opcional e aparece **somente após as três respostas livres**, sem sugerir que qualquer orientação sexual implique uma representação mais ou menos tradicional. A análise poderá comparar, quando tecnicamente adequado e com tamanho de subgrupos suficiente, diferentes repertórios de significado entre participantes que escolheram fornecer esse dado.

A possibilidade de transformações sociais e mudanças nos direitos LGBTQIA+ influenciarem repertórios culturais é **pergunta para estudos posteriores**, não conclusão do levantamento inicial. Este instrumento não mede atitudes conservadoras, liberalismo ou apoio a relações abertas e, portanto, não sustenta inferências sobre essas características dos respondentes.

A participação independe de responder ao perfil. A variável sensível exige escolha explícita, separada e revogável; registros são cifrados, sujeitos a retenção, controle de acesso e revisão humana. Um resultado agregado por grupos pequenos não pode ser divulgado quando puder facilitar identificação.

A tela inicial usa uma introdução breve com direitos e finalidade essenciais; o RCLE completo permanece acessível e imprimível antes do aceite. A coleta não será ativada até a validação ética e operacional documentada.

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
