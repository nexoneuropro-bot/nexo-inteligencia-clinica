# NEXO · Conhecendo Meu Momento
## ESPECIFICAÇÃO MESTRA DE INTEGRAÇÃO NO SITE (Codex)
Versão: 1.0 | Data de consolidação: 08/11/2026 | Idioma: pt-BR
**Status:** produto em definição e demonstração; não lançar coleta clínica real antes de revisão técnico-ética e implantação de segurança. Este documento é o contexto autocontido das decisões tomadas com o responsável pelo NEXO. Não é necessário buscar o histórico do ChatGPT.

## 0. ORDEM DE EXECUÇÃO E ECONOMIA DE CRÉDITOS (OBRIGATÓRIO)
Você, Codex, deve operar NO REPOSITÓRIO JÁ EXISTENTE do site NEXO, sem recriar site, trocar framework, reestilizar a home, instalar SaaS pago ou construir infraestrutura desnecessária. Siga a sequência:
1. Inspecione `package.json`, árvore `src/`, rotas, componentes, estilos, integrações e configurações de deploy. No histórico do projeto já foram estudados Astro com páginas pré-renderizadas, Three.js sob demanda e Cloudflare Pages; **confirme o estado REAL do repositório**, não presuma que a arquitetura antiga é a atual.
2. Faça um diagnóstico BREVE: o que existe, o que pode ser reutilizado, alterações previstas, riscos/bloqueios. Responda com poucas linhas e prossiga com a implantação segura do MVP autorizado, sem debates longos ou perguntas dispensáveis.
3. Reaproveite tokens de design, componentes, navegação, responsividade e SEO. Acrescente a rota integrada **`/conhecendo-meu-momento`** ou equivalente do roteador atual, com `noindex` para conteúdo de participantes e páginas privadas. Link público do site pode explicar o recurso, mas a experiência de preenchimento será acessível SOMENTE por convite individual.
4. Consulte o HTML `NEXO_Conhecendo_Meu_Momento_v4.html` entregue junto com este documento como REFERÊNCIA DE UI, FLUXO E TOM. Não copie seus avisos de protótipo como se fossem termos jurídicos finais; não copie dados demonstrativos para produção. O HTML é estático e não aplica escalas, não persiste informações, não autentica profissionais.
5. Implemente primeiro interface e fluxo seguros, com dados simulados. Se infraestrutura adequada não existir, entregue **modo demonstrativo explícito, sem coleta/persistência real de saúde** e uma lista de bloqueios para ativação de produção. Jamais simule banco seguro, vigilância humana ou escalas validadas.
6. Execute build/lint/testes existentes, testes adicionais essenciais e informe apenas arquivos alterados, rota, resultados e bloqueios. Evite mudanças fora do escopo, respostas extensas, múltiplos frameworks ou refatoração global.
7. Use dependências já instaladas e recursos gratuitos quando factíveis. Não usar APIs pagas de IA, voz ou analytics para o MVP. Sem exposição de segredos no frontend.

## 1. VISÃO, LIMITES E NÃO NEGOCIÁVEIS
**Produto:** NEXO · Conhecendo Meu Momento (conceito alternativo interno: Primeira Escuta).
**Marca:** Nexo Inteligência Clínica, domínio `nexoneuro.com.br`, responsável técnico Gabriel Batista, psicólogo/neuropsicólogo, CRP 06/176184. Público inicial: adultos (18+) já encaminhados pelo profissional após conversa prévia, podendo incluir atendimento social e terapia breve. Acesso gratuito.
**Objetivo:** organizar uma experiência pessoal sobre bem-estar, cotidiano e relações; facilitar autoconhecimento, pré-entrevista e qualidade do encontro clínico; não automatizar psicoterapia, consulta, avaliação psicológica, diagnóstico, laudo nem decisão clínica.
**Acordo ético:** IA é ferramenta de apoio à organização/explicação, não um profissional; devolutiva clínica pertence a psicólogo humano, e o participante encaminhado tem direito à conversa de devolutiva pelo fluxo informado, sem promessa de monitoramento 24h.
**Nunca mostrar à pessoa:** números de PHQ/GAD como troféus, semáforos, “você tem depressão”, classificações de gravidade como identidade, respostas “corretas”, recompensas, gráficos comparativos de pessoas, hipótese DSM conclusiva.
**NÃO ocultar instrumentos:** nomes PHQ-9/GAD-7, natureza, período de referência, uso, limitações e dados tratados devem estar disponíveis antes do aceite, em seção expansível “Que perguntas usamos e por quê?”; podem voltar na metodologia ao final. Na tela de cada pergunta, NÃO mostrar siglas nem “as perguntas são autorais/demonstrativas”, salvo em material de desenvolvimento não exibido ao participante. Respeitar escolha consciente do participante sem criar efeito de prova.

## 2. IDENTIDADE VISUAL E TOM
- Conservar site e marca existentes. Padrão NEXO: editorial contemporâneo, marfim/off-white, azul profundo/petróleo, cobre suave, espaços equilibrados, títulos serifados, corpo sans-serif legível, cenas humanas afetivas em fade quando úteis; sofisticado sem parecer laboratório, quiz escolar ou aplicativo de jogos.
- Mobile-first (360px e acima) e desktop; contrastes acessíveis; sem ilustração carregada que concorra com as perguntas; imagens otimizadas e não essenciais à compreensão.
- Linguagem pt-BR curta, humana, sem infantilizar. Acolhimento sem elogiar respostas. Proibido: “acertou!”, “boa resposta!”, “nota”, “nível grave” na devolutiva leiga. Confirmar neutro: “Resposta registrada”.
- Gamificação mínima: sensação discreta de percurso, possibilidade de pausa e retorno; sem “PERGUNTA 1 DE 4” dominante, contagem avaliativa, competição, prêmio ou desempenho.
- Preferir personagens ILUSTRADOS ORIGINAIS, opção de voz/narrador feminino/masculino/sem personagem, escolhidos por conforto, não usados como marcador diagnóstico. Inspirações internas podem ser ciência (Skinner) e literatura (Clarice Lispector), mas no MVP evitar retrato/nome/voz que sugira endosso ou representação real sem revisão de direitos e adequação.

## 3. JORNADA DE PARTICIPANTE (ORDEM DEFINITIVA)
### Etapa A | Convite e acolhimento, ANTES de qualquer coleta
- Link com token individual aleatório, de uso limitado e expiração configurável, associado ao profissional; verificar token no servidor quando houver backend. Não colocar dados de saúde no URL nem aceitar somente código adivinhável. Evitar exposição a buscadores; tela genérica para token inválido, sem revelar pessoas.
- Abertura sugerida: “Um espaço para falar sobre você. Não existem respostas certas ou erradas. Vamos organizar algumas experiências para conversar melhor no seu próximo encontro.”
- Mostrar finalidade, responsável/canal, funcionamento, uso eventual de instrumentos padronizados de rastreio, seus nomes e limites de maneira consultável, custos (gratuito), quem pode acessar, retenção, direitos, possibilidade de pausa, riscos, segurança/urgência e devolutiva humana. Texto simples e opção de ouvir ANTES de aceitar.
- Confirmar maioridade (18+) ou interromper fluxo informando que a versão atual é adulta.
- Consentimentos independentes, não pré-marcados: (1) ciência/participação no acolhimento e tratamento de dados conforme base legal e política aplicável; (2) PESQUISA: somente se houver protocolo/aprovação e finalidade definidos. Antes disso oferecer apenas “Quero receber informações sobre estudos futuros”, também opt-in e sem autorização de reutilização de respostas. Recusa de pesquisa não impede atendimento.
- Registrar versão/idioma/documento/data do aceite e separadamente o aceite/recusa de pesquisa, quando houver backend seguro. Não tratar pseudônimo como anonimização.
### Etapa B | Perfil sociodemográfico leve
- Nome ou pseudônimo; confirmar que convite pode ser identificável pelo profissional.
- Idade (ou faixa etária para pesquisa; ver necessidade clínica); gênero (opções inclusivas + prefiro não informar), escolaridade (incluindo sem escolarização formal, níveis incompletos/completos), situação atual trabalho/estudo, região aproximada (não endereço completo) e rede de apoio em pergunta posterior se clinicamente pertinente.
- Preferir campos facultativos quando não necessários; “prefiro não informar”; validar adequação e não solicitar CPF, RG, geolocalização, telefone, renda, religião, etnia, sexualidade ou histórico detalhado por padrão. Campos adicionais só com justificativa explicitada. Aplicar minimização de dados.
### Etapa C | Ambiente e privacidade IMEDIATAMENTE ANTES das perguntas pessoais
- “Onde você está neste momento?” [em casa / trabalho ou estudo / lugar público ou compartilhado / outro / prefiro não informar].
- “Você sente que tem privacidade para responder com tranquilidade?” [sim / mais ou menos / não agora].
- Se “não”: pausa/saída digna; explicar como retomar com segurança se houver mecanismo real; não forçar. Se “mais ou menos”: oferecer texto silencioso, fones e opção de adiar. Nunca ativar som ou microfone automaticamente.
- Perguntar modo preferido: ler e tocar; ouvir e tocar; ouvir e responder falando (somente quando STT implementado com confirmação e garantias de privacidade). Perguntar acessibilidade funcional, não inferir alfabetização, capacidade ou diagnóstico.
### Etapa D | Preferência de interlocução e início da conversa
- Avatar opcional, voz preferida independente da aparência. Opção sem personagem. Deixar claro: recurso de apresentação, não psicólogo/terapeuta nem pessoa real.
- Primeiro perguntas autorais de análise funcional, uma por vez, com linguagem cotidiana, sobre antecedente/situação, pensamentos e sentimentos, comportamentos, consequências percebidas, impacto e prioridades para a consulta. Combinar perguntas opcionais abertas com alternativas acessíveis, sem perguntas indutoras.
- Ex.: “O que tem ocupado seus pensamentos?”, “Quando costuma acontecer?”, “Como isso mexe com seu dia?”, “O que você gostaria de conversar com o profissional?”. Permitir pular não essenciais.
### Etapa E | Questionários de rastreio (quando liberados)
- PHQ-9 e GAD-7: somente versões brasileiras verificadas para população/modalidade, condições legais e técnicas revisadas pelo responsável. Não inventar novas traduções nem afirmar validação de fala por IA. Não reescrever itens, opções, ordem ou período de **duas semanas**; não juntar perguntas autorais no escore.
- Respostas fechadas 0,1,2,3 e regras de pontuação determinísticas, versão do instrumento registrada. Não realizar pontuação com LLM. Se algum item não respondido, sinalizar “incompleto/não calculado”, sem substituir por zero ou extrapolar total sem regra validada.
- PHQ-9: 9 itens, total 0–27; faixas técnicas 0–4 mínima, 5–9 leve, 10–14 moderada, 15–19 moderadamente grave, 20–27 grave. GAD-7: 7 itens, total 0–21; 0–4 mínima, 5–9 leve, 10–14 moderada, 15–21 grave. **Faixas são intensidade dos sintomas no rastreio, não diagnóstico**.
- PHQ-9 item 9 com resposta >0: acionar fluxo de segurança aprovado e avaliação humana oportunamente; não assumir iminência automática nem ignorar casos com escore total baixo. Sinais de risco em narrativa também exigem tratamento adequado; sem inferir segurança porque item 9 =0. Quando não houver serviço de acompanhamento em tempo real, declarar limitação e orientar serviço apropriado (em urgência no Brasil SAMU 192; CVV 188 é escuta, não atendimento emergencial). Não enviar alerta com dados sensíveis por email desprotegido. O fluxo de risco é bloqueador de go-live.
### Etapa F | Síntese humana e próximo encontro
- Para participante: síntese factual e acolhedora fiel às respostas, sem escores visíveis por padrão, sem adjetivos de gravidade, sem diagnóstico, sem identidade patologizante. Explicar o que contou, temas que deseja discutir e que o profissional fará devolutiva; acesso transparente aos instrumentos e dados próprios segundo direitos e política aplicável. Direito de conversa humana com responsável conforme fluxo previamente explicado.
- Não gerar “motivação” genérica desconectada. Em caso de sofrimento intenso, priorizar segurança e acesso humano. Recursos suaves de autocuidado podem aparecer como opcionais, não substitutos de cuidado.
- Botões: “Guardar/baixar minha síntese” (somente se formato seguro), “Levar para o próximo encontro”, “Como minhas respostas foram organizadas?”, “Pedir ajuda/contato profissional”, “Revisar”. Não afirmar envio/agenda se serviço não existir.

## 4. SEPARAÇÃO INTRANSIGENTE DE RESULTADOS
**Participante:** linguagem de autocuidado/autoconhecimento; citações originais e delicadas, sem frase ficticiamente atribuída a pensadores; qualquer pontuação ou dado técnico solicitado explicitamente deve ter mecanismo de acesso adequado, sem confundir transparência com tela de placares.
**Profissional autenticado:** painel separado, com RBAC (controle de acesso real no servidor); convite/status; perfil com campos não informados identificados, respostas originais e transcrição revisada, respostas item a item, totais, faixas e data/versão, impacto funcional, matriz biopsicossocial com quatro eixos: biológico, psicológico, social e funcional. Diferenciar fato declarado, inferência e hipótese. Incluir timeline e status devolutiva apenas se implementados de verdade.
**Relatório técnico:** chamar “Síntese de acolhimento e rastreio – apoio à entrevista”. NÃO “laudo psicológico”, “diagnóstico”, “protocolo de tratamento” ou “parecer clínico automatizado”. Exige revisão/assinatura profissional para qualquer documento formal posterior.
**DSM-5-TR:** na visão técnica, exibir apenas checklist de aspectos para exploração pelo profissional (tempo, distribuição de sintomas, impacto funcional, episódios anteriores, substâncias, sono, condições clínicas e diferenciais). Não transcrever critérios proprietários extensos, não criar código CID/DSM e não afirmar diagnóstico por algoritmo. Hipóteses somente com justificativa, fonte e confirmação pelo profissional.
**Regras de decisão:** jamais automatizar encaminhamento compulsório por limiar de score; avaliar risco, funcionalidade e contexto humano. Nunca inferir falha farmacológica apenas por escore alto; não tratar disparidade PHQ/GAD como “perfil puro” validado. Não usar RDo, índice de risco ou "carga alostática" como score autoral sem estudo.

## 5. MATRIZ BIOPSICOSSOCIAL (DADOS E LÓGICA)
- Eixo biológico: sono, apetite, energia, condições médicas declaradas, medicação/substâncias apenas quando necessário e com linguagem não acusatória.
- Eixo psicológico: situações disparadoras, preocupações, pensamentos repetitivos, padrões de resposta, estratégias de enfrentamento e relevância dos valores.
- Eixo social: rede de apoio, relações, trabalho/estudo, condições de acesso a cuidados e estressores sociais se a pessoa desejar informar.
- Eixo funcional (transversal): impacto, capacidades preservadas, rotina, reforçadores positivos, prioridades e proteção.
- Analítica funcional exploratória: antecedente → resposta → consequências imediatas e posteriores → hipóteses de função; nunca deduzir função comportamental de resposta isolada.
- Regras derivadas sempre estruturadas como “perguntar/explorar” e nunca “concluir”. Ex.: sono PHQ item 3 alto => “investigar padrão de sono e outros fatores”; PHQ/GAD altos em uso de medicamentos => “considerar história de tratamento”, sem prescrever ou afirmar falha; dificuldades socioeconômicas => não psicopatologizar.

## 6. ACESSIBILIDADE, ÁUDIO E VOZ
- WCAG 2.2 AA como meta; HTML semântico, labels reais, focus visível, navegação por teclado, radio groups, mensagens aria-live com parcimônia, contraste, ajuste de fontes, leitura de tela, responsive sem overflow e opção de reduzir movimento.
- Text-to-speech sob demanda (`speechSynthesis` pt-BR apenas se disponível). Botões separados: ouvir, repetir, pausar/parar. Voz configurável sem prometer fidelidade ou disponibilidade em todos navegadores. Não iniciar áudio por padrão.
- Speech-to-text só após avaliação de segurança, consentimento específico sobre captura/processamento de áudio, compatibilidade e revisão da transcrição. Enquanto indisponível: indicar honestamente “recurso em desenvolvimento”; jamais botão enganoso. Não armazenar áudio bruto por padrão.
- Testar aplicação oral padronizada (tempo, entonação neutra e equivalência) antes de usar os resultados como escalas aplicadas nessa modalidade; leitura narrada de orientações autorais é menos restrita.
- Não pedir que personagem “interprete” resposta em tempo real; não oferecer elogios ou reforço diferencial que interfira no rastreio.

## 7. SEGURANÇA, DADOS, ACESSO E ÉTICA
- Antes de ligar coleta real: definir controlador, finalidades, base legal aplicável inclusive dados sensíveis, operadores, canal direitos, política de retenção/descarte, processo de incidentes, avaliação de risco e revisão por responsável. Não supor que consentimento é sempre única base legal; pesquisar e assistência são finalidades distintas.
- Banco/backend seguro se já disponível; se não existir, **não coletar dados clínicos**. Não gravar PHQ/GAD, respostas narrativas ou tokens em URL, localStorage, sessionStorage, trackers, cookies de analytics, console, logs de erro, e-mail em claro ou APIs externas de IA sem avaliação.
- HTTPS, autenticação forte de profissional, autorização por recurso, convites aleatórios de alta entropia com hash e expiração, rate limit, proteção anti-enumeração, CSRF/XSS, validação no servidor, mínimo privilégio, RLS se suportado, criptografia adequada, segredos no ambiente, auditoria de leitura/alteração, backup e restauração testados (quando houver dados reais).
- Participante pode ser pseudônimo, mas vínculo via token/cadastro permite reidentificação; nunca escrever “anônimo” nesse caso. Não realizar pesquisa com dados de saúde sem protocolo e enquadramento ético definidos. Análises agregadas apenas quando autorizadas, com minimização e cautela com pequenos grupos.
- Não incorporar serviço de analytics ou publicidade que vaze páginas e parâmetros sensíveis; adicionar `noindex`, `no-store` e cabeçalhos adequados nas rotas privadas.
- Avisos ao profissional, se implementados: só mensagem neutra (“Há nova resposta no NEXO”), sem identidade ou conteúdo clínico por e-mail comum. Não assumir acompanhamento contínuo ou canal de crise sem equipe/escala definida.
- Informar data e versão do consentimento; retenção configurável e políticas de exclusão/exportação. Nunca prometer anonimato, criptografia, monitoramento ou persistência que não existam.

## 8. PESQUISA SEM CONFUNDIR COM CUIDADO
- O encaminhamento para conversa não torna dados automaticamente utilizáveis em estudo científico. Consentimento para cuidado e participação em pesquisa são separados e com possibilidade de recusa, quando apropriado.
- Sem protocolo de pesquisa final: texto “Desejo ser informado(a) sobre possível pesquisa futura”; isso NÃO autoriza uso das respostas coletadas.
- Com protocolo final, criar TCLE próprio (objetivos, voluntariedade, riscos/benefícios, sigilo, dados, retirada, contatos e devolutiva), sujeito à tramitação ética aplicável. Não afirmar “aprovado por CEP” até haver aprovação real.
- Para futura caracterização do público: faixa etária, identidade de gênero, escolaridade, região ampla, trabalho/estudo, modalidade de resposta e completude, com minimização. Características como raça/cor, renda, deficiência etc. somente se justificadas no protocolo e com salvaguardas; nunca coletar por padrão.
- Um objetivo empírico futuro é comparar compreensão/autonomia/modalidade de acesso (ler/ouvir/falar) e experiência percebida. Isso não é validação psicométrica do instrumento autoral por si só.

## 9. ESQUEMA DE DADOS MÍNIMO (SOMENTE QUANDO APROVADO)
Sugestão conceitual, adaptar à estrutura existente:
- `invites`: tokenHash, professionalId, expiresAt, redeemedAt, status, version.
- `participants`: participantId pseudonimizado, displayName opcional, ageOrBand, gender optional, education optional, workStudy optional, region optional.
- `consentEvents`: version, acceptedAt, participantId, purpose, acceptance, locale, source; pesquisa em finalidade separada.
- `sessions`: participantId, startedAt, completedAt, interfaceMode, narratorId, privacyCheck OPTIONAL/ephemeral, status; não persistir localização contextual quando dispensável.
- `answers`: sessionId, instrumentVersion ou authorQuestionVersion, questionId, answerValue, rawNarrative OPTIONAL, status (answered/skipped), timestamp. Sem transformar falta em zero.
- `screeningResults`: sessionId, instrumentId, version, completeFlag, score nullable, band nullable, item9AlertFlag, computedAt; dados não expostos ao paciente por padrão.
- `clinicalReviews`: reviewerId, reviewedAt, notes, followupStatus; sem texto diagnóstico automático.
- `audit`: actorRole, action, targetResource, timestamp, outcome, sem conteúdo clínico em log.
- Tudo com políticas de segregação, retenção e exportação; só armazenar campos efetivamente justificados.

## 10. EXEMPLOS DE MICROCOPY APROVADOS
**Boas-vindas:** “Que bom ter você aqui. Este espaço ajuda a organizar experiências e pensamentos para a conversa com o profissional que encaminhou você. Não existem respostas certas ou erradas.”
**Antes da pesquisa:** “Além do acolhimento, existe a possibilidade de pesquisas futuras. Participar de pesquisa é uma escolha separada e não é necessário para receber o acolhimento.”
**Privacidade:** “Você está em um lugar onde se sente à vontade para responder? Se não, podemos continuar em outro momento.”
**Pergunta:** “Como tem sido o seu descanso nos últimos dias?” (autorais; não substituir por pergunta validada quando o módulo psicométrico estiver ativo).
**Confirmação neutra:** “Resposta registrada.”
**Devolutiva:** “Obrigado por compartilhar um pouco do seu momento. Suas respostas ajudam a organizar assuntos para seu próximo encontro. Elas não definem quem você é. O profissional que encaminhou esta experiência poderá conversar sobre elas com você.”
**Informação metodológica (expansível no aceite):** “Parte das perguntas poderá utilizar instrumentos conhecidos de rastreio de sintomas, como PHQ-9 e GAD-7, que ajudam a organizar observações sobre as duas últimas semanas. Eles não fazem diagnóstico por si só. Saiba mais sobre os instrumentos e seus limites.”
**Evitar:** “Você tem depressão moderada”, “Não se preocupe, vai ficar tudo bem”, “Excelente!”, “Você ganhou 20 pontos”, “Laudo pronto”, “Suas respostas foram enviadas” quando não houve envio.

## 11. IMPLEMENTAÇÃO: FASES, BLOQUEIOS E FEATURE FLAGS
**Fase 1 (FAZER AGORA):** incorporar landing/rota interna responsiva, convite visual demonstrativo, consentimento informativo, perfil, privacidade, modo texto/TTS quando viável, personagem original/sem personagem, 4 perguntas AUTORAIS claramente DEMONSTRATIVAS apenas na documentação de desenvolvimento, síntese genérica baseada nas respostas, página privada/painel técnico MOCK marcado como exemplo e fluxos de erro; testes de UI. Nenhuma gravação/envio clínico real. Remover “PHQ-9/GAD-7” do topo de perguntas. Manter informação técnica acessível no aceite, e no rodapé/ajuda.
**Fase 2 (somente após autorização técnico-ética e backend seguro):** convites reais, autenticação profissional, consentimentos versionados, armazenamento criptografado e controle de acesso, respostas narrativas, aplicação correta de versões validadas das escalas em modalidade adequada, mecanismo seguro para item 9, painel técnico, exportações e devolutiva.
**Fase 3 (após validação):** STT e voz bidirecional com salvaguardas, pesquisa com protocolo quando aplicável, análises agregadas não identificáveis, avaliações de usabilidade/viés/equivalência, recursos avançados; sem serviços pagos sem aprovação expressa.
- Feature flags: `NEXO_DEMO_ONLY=true` por padrão; `NEXO_ENABLE_REAL_SUBMISSIONS=false`; `NEXO_ENABLE_SCALES=false`; `NEXO_ENABLE_STT=false`; `NEXO_ENABLE_RESEARCH=false`; `NEXO_ENABLE_CLINICAL_DASHBOARD=false`; não basta trocar flags sem pré-requisitos verificados.

## 12. TESTES DE ACEITE (CRÍTICOS)
1. Consentimento/informação e maioridade aparecem antes de dados pessoais. Nomes/limites PHQ/GAD consultáveis antes do aceite, não surgem no cabeçalho das perguntas; sem “Pergunta 1 de 4” chamativo.
2. Recusa à pesquisa não bloqueia acolhimento. O simples interesse em pesquisa futura não autoriza reutilização de dados.
3. Perfil inclui pseudônimo, idade, gênero, escolaridade, trabalho/estudo, região; campos sensíveis facultativos e “prefiro não informar”.
4. Privacidade perguntada imediatamente antes da conversa. “Não agora” não força respostas, dá opção segura de saída. Som nunca toca sozinho.
5. Texto, TTS sob demanda, teclado/leitor de tela e layout mobile funcionam; voz por reconhecimento não finge funcionar.
6. Sem placar, medalha, título diagnóstico, comparação social ou interpretação automática ao participante. Personagem não reage diferentemente às respostas.
7. No modo demonstração nenhuma submissão a servidor, armazenamento de saúde, analytics externos ou painel clínico acessível com dados reais.
8. Em futura fase clínica: PHQ-9 [2,1,3,2,3,1,0,1,0] resulta **13**; GAD-7 [1,1,2,2,0,1,0] resulta **7**; item 9 =0 nesse exemplo; score/síntese apenas na visão profissional. Resposta ausente = escala incompleta, nunca zero. Item 9 >0 dispara fluxo aprovado independentemente do total. Para valores impossíveis, rejeitar.
9. Não existe rota ou API que exponha dados clínicos sem autenticação/autorização; negar acesso cruzado entre profissionais e tokens vencidos/forjados.
10. Responsividade, foco, contraste, teclado, leitor de tela, pt-BR, aviso de compatibilidade áudio e mensagens de erro compreensíveis.
11. Rodar testes/build. Relatório final Codex em no máximo ~20 linhas: arquivos, implementado, não implementado, testes, bloqueios para produção e como abrir rota.

## 13. REFERÊNCIAS E ALERTAS DE INTERPRETAÇÃO (CONSULTAR SEM COPIAR INDISCRIMINADAMENTE)
- Conselho Federal de Psicologia, SATEPSI: https://satepsi.cfp.org.br/ e FAQ https://satepsi.cfp.org.br/faq.cfm . Diferença entre instrumentos de rastreio não privativos e testes psicológicos; verificar autorização e modalidade aplicável. A CCAP divulgou nota de 16/10/2026 sobre aplicações informatizadas/online: https://site.cfp.org.br/cfp-orienta-psicologas-sobre-o-uso-de-testes-psicologicos-nas-modalidades-informatizada-e-online/
- CFP, Resolução 06/2019, documentação psicológica: https://site.cfp.org.br/wp-content/uploads/2019/09/Resolu%C3%A7%C3%A3o-CFP-n-06-2019-comentada.pdf . “Laudo” exige processo e autoria profissional, não pode ser gerado automaticamente como documento definitivo.
- LGPD/ANPD, dados e bases legais: https://www.gov.br/anpd/pt-br/acesso-a-informacao/perguntas-frequentes e segurança: https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-sobre-seguranca-da-informacao-para-agentes-de-tratamento-de-pequeno-porte ; pesquisa: https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-tratamento-de-dados-pessoais-para-fins-academicos-e-para-a-realizacao-de-estudos-e-pesquisas
- CNS Resoluções 466/2012 e 510/2016 conforme tipo de pesquisa: https://www.gov.br/conselho-nacional-de-saude/pt-br/atos-normativos/resolucoes/2012/resolucao-no-466.pdf/view e https://www.gov.br/conselho-nacional-de-saude/pt-br/atos-normativos/resolucoes/2016/resolucao-no-510.pdf/view . Verificar tramitação ética vigente, não presumir isenção.
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- PHQ-9: https://www.hiv.uw.edu/page/mental-health-screening/phq-9 ; disponibilização pública original Pfizer: https://www.pfizer.com/news/press-release/press-release-detail/pfizer_to_offer_free_public_access_to_mental_health_assessment_tools_to_improve_diagnosis_and_patient_care . Verificar versão em português, equivalência e adequação antes de ativar.
- DSM-5-TR: referência clínica profissional licenciada. Não reproduzir texto proprietário de forma extensa nem usar DSM para classificação automática.

## 14. RASTRO DAS DECISÕES DESTA CONVERSA (PARA O CODEX NÃO PRECISAR LER TUDO)
1. A origem foi uma discussão de reflexão pessoal, PHQ-9/GAD-7 e análise funcional, que mostrou valor de organizar dados antes do encontro. A IA foi explicitamente posicionada como parceira de ideias, nunca terapeuta ou responsável clínica.
2. Usuário definiu produto gratuito, socialmente acessível, voltado ao NEXO e a pessoas encaminhadas, inclusive com baixa escolaridade; personagens e texto/áudio para reduzir sensação de prova.
3. Acolhimento vem antes da coleta de sintomas; consentimento vem ANTES dos dados pessoais; perfil sociodemográfico (pseudônimo, idade, gênero, escolaridade, trabalho/estudo, região) vem em seguida; privacidade e local de resposta antes da parte íntima.
4. Usuário reiterou que exibir PHQ-9/GAD-7 e avisos “perguntas autorais e demonstrativas” ACIMA de cada pergunta desviava atenção e estimulava busca por respostas certas. Em V4 isso foi retirado da tela de perguntas; informações técnicas ficam no consentimento (acessíveis, mas discretas) e material complementar.
5. Pessoa não recebe rótulo, grau de gravidade como identidade ou indicação terapêutica automática; recebe síntese positiva, respeitosa, realista, com acesso ao profissional para devolutiva. Profissional tem a matriz técnica, escores e hipóteses a verificar.
6. Proposta Gemini de matriz biopsicossocial foi aceita COMO ESTRUTURA, não como algoritmos de diagnóstico ou encaminhamento compulsório; riscos automáticos e relação causal direta foram expressamente corrigidos.
7. Pesquisa tem consentimento próprio e não pode ser pré-requisito do acolhimento; dados coletados devem ser minimizados, protegidos e consentimentos rastreáveis.
8. Modo demonstração existente em `NEXO_Conhecendo_Meu_Momento_v4.html` é apenas visual, sem escalas ou backend; este documento orienta integração incremental e segura, evitando retrabalho/créditos.

### SAÍDA ESPERADA DO CODEX
Entregar uma rota integrada funcional no site atual (fase 1), identidade visual coerente, fluxo navegável de consentimento → perfil → privacidade → modalidade/avatar → perguntas demonstrativas → síntese, opção de TTS quando disponível, painel profissional demonstrativo claramente isolado, testes básicos e lista curta de bloqueios de produção. **Não publicar captura de respostas reais e não habilitar escalas reais/armazenamento real sem os pré-requisitos.**
