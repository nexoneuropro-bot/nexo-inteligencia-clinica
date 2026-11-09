# NEXO · Conhecendo Meu Momento
## Especificação consolidada para integração ao projeto existente | versão 4 | 08/11/2026

**Este documento prevalece sobre instruções conflitantes dos kits v1, v2 e v3.** É uma especificação de implementação, não uma autorização para coleta de dados clínicos reais, nem validação científica de instrumento novo.

### 1. Propósito inegociável
O percurso é oferecido **somente depois de contato humano inicial e encaminhamento do profissional**, com decisão voluntária e tempo escolhido pelo participante. Finalidades: auto-observação, qualificação do vínculo, conhecimento do contexto biopsicossocial, preparação para a entrevista e investigação de barreiras à continuidade voluntária do cuidado. Não procura acelerar sessões, economizar tempo clínico a qualquer custo, criar diagnóstico, reter participantes por pressão ou substituir a escuta. A IA é ferramenta de organização e apoio ao julgamento profissional; não é um segundo clínico. Nenhum conteúdo analítico é devolvido automaticamente ao participante.

### 2. Ordem do percurso e experiências
1. Convite individual / código de acesso validado no servidor e vínculo com profissional responsável; não presumir anonimato quando houver identificador recuperável.
2. **Consentimento inicial real**, em linguagem simples e acessível (leitura e voz): finalidade, voluntariedade, instrumentos de rastreio utilizados (identificação disponível antes do aceite), limites do percurso, tratamento de dados, direitos, retenção, acesso do profissional, devolutiva humana, segurança e canais de contato. Separar autorizações de cuidado/encaminhamento e eventual pesquisa. Não fazer pesquisa pré-marcada ou compulsória. No piloto, consentimento é somente demonstrativo.
3. Perfil sucinto: nome/pseudônimo, confirmação de faixa etária adulta, idade/faixa, identidade de gênero, escolaridade, situação de trabalho/estudo, região se relevante. Cada campo deve ter finalidade declarada e opção "prefiro não informar" se não essencial; não coletar CPF, RG, endereço completo ou demais dados desnecessários por padrão. Perfil não se converte em previsão de diagnóstico.
4. Verificação do **ambiente e privacidade**: onde está, se sente privacidade, opção de parar e voltar, escolha de silêncio/áudio. Nunca disparar som automaticamente. Se sem privacidade, oferecer saída respeitosa.
5. Preferências de interação: texto, ouvir/tocar e, após avaliação de privacidade, responder por voz com revisão de transcrição. Personagem opcional e neutro (ex.: Clara, Bento, nenhum), sem alegar identidade ou credenciais reais. Escolha não é variável para inferência psicopatológica.
6. Breve escuta narrativa / análise funcional: o que aconteceu, em que contextos, o que a pessoa procura alcançar ao pensar/agir, e consequências percebidas. A pessoa pode deixar perguntas sem resposta. Não dizer que resposta é certa ou errada; não oferecer reforço avaliativo.
7. Escalas **PHQ-9 (9 itens)** e **GAD-7 (7 itens)**: usar versão brasileira verificada, período de **últimas 2 semanas**, respostas 0/1/2/3, sem mudar redação, pontuação ou ordem por conveniência. Sem siglas, escores ou categorias em destaque na tela da pergunta; identificação e metodologia disponíveis no consentimento e ajuda. Não chamar teste de prova.
8. Complementos *não pontuáveis* por domínio, apenas com propósito clínico e opcionais. Ex.: PHQ03 > 0 → distinguir dificuldade para iniciar o sono, despertar, dormir muito, padrão misto ou indefinido; PHQ05 > 0 → distinguir perda de apetite, aumento, misto ou indefinido. Não recalcular o PHQ-9 por estes complementos nem inferir causa.
9. Perguntas biopsicossociais breves e relevantes, incluindo rede de apoio, contexto laboral, moradia/financeiro se a finalidade justificar, condições e cuidado de saúde **somente se relatadas ou perguntadas de forma consentida**. Não exigir informações sensíveis excessivas.
10. Conclusão **sem resultado ao participante**: agradecer e informar que o profissional conversará sobre as respostas. Não mostrar pontuação, faixa de gravidade, hipótese DSM, testes sugeridos ou sumário interpretativo individualizado. O consentimento, a ajuda e a participação podem ser encerrados a qualquer momento.

### 3. Acessibilidade e comunicação
- WCAG 2.2 AA como alvo; teclado, foco, leitores de tela, contraste, fontes legíveis, alvos táteis grandes, instruções sem jargão.
- Uma pergunta por vez. Sem "Pergunta 1 de 4", porcentagens clínicas, frases avaliativas, timer nem gamificação por pontos. Progresso discreto não competitivo é aceitável.
- Leitura em voz alta sob ação explícita; opção de repetir. Voz não deve fazer comentários clínicos nem alterar os itens padronizados.
- Implementação de reconhecimento de fala apenas após auditoria de dados e consentimento específico para serviço de transcrição; permitir correção da transcrição antes de confirmar resposta.
- Falar com respeito inclusive diante de silêncio, pausa ou recusa.

### 4. Respostas, ausências e interrupções: todos são informações, mas não diagnósticos
Registrar **separadamente**, com minimização: `question_presented`, `answer_confirmed`, `explicit_skip`, `optional_clarification_presented`, `clarification_answered`, `clarification_skipped`, `voluntary_pause`, `voluntary_resume`, `voluntary_end`, `session_completed`, `technical_disconnect` (quando tecnicamente fundamentado), `expired_without_completion` (motivo desconhecido), `safety_exit`.

Armazenar em área protegida: `session_id` pseudonimizado, `referral_id`, `question_id`, `event_type`, timestamp, versão do instrumento, modo de resposta, posição no fluxo, com política de retenção. Valores das respostas vão a coleção clínica separada, nunca a analytics ou e-mail. **Abandono em determinado item é apenas dado temporal/de percurso, não demonstra que a pergunta provocou o abandono.** Incluir no painel: "pausa/abandono nesta etapa; causas indeterminadas; explorar com acolhimento se pertinente". Distinguir explicitamente `não perguntado`, `apresentado sem resposta`, `prefiro não responder`, `pausa solicitada`, `desconexão identificada`, `sessão expirada` e `negou sintoma`.

Não usar duração de resposta, identidade de gênero, avatar, voz ou escolaridade como indicadores automáticos de transtorno. Para estudos de abandono, descrever método e limites de interpretação, sem inferências causais indevidas. O sistema deve permitir **retomada segura** quando autorizado; consentimento e respostas parciais sujeitos à LGPD e política explícita.

### 5. Rastreios: contrato objetivo
PHQ-9: itens 9 × valores 0..3, soma válida somente com **todos os nove itens respondidos**; faixa 0..27 e estratificação para uso **profissional**: 0–4, 5–9, 10–14, 15–19, 20–27. **Não diagnosticar** com pontuação. Item PHQ09 > 0 ou relato independente de autoagressão/ideação de morte aciona **orientação de segurança humana aprovada**, não escore automático de risco ou promessa de vigilância. Item 9 = 0 não exclui risco futuro.

GAD-7: itens 7 × valores 0..3, soma somente com **todos os sete itens respondidos**; faixa 0..21 e estratificação profissional: 0–4, 5–9, 10–14, 15–21. Impacto funcional do PHQ-9 é item adicional, não integra somatório. Itens ausentes permanecem `null` e os totais são **incompletos**, nunca substituídos por zero. Não inferir doença a partir dos totais e não estabelecer automaticamente medicação ou encaminhamento compulsório.

**Fonte-base de redação e metadados:** arquivo `NEXO_BANCO_INSTRUMENTOS_REFERENCIA_v2.json`, originalmente referenciado aos formulários pt-BR PHQ Screeners e SES/SE (GAD-7). A equipe profissional deve rever versão, direitos de reprodução, população e modalidade de administração **antes da liberação clínica**.

### 6. Matriz psicossocial e raciocínio clínico, somente profissional
O motor cria um **quadro de evidências auditável**, não um diagnóstico. Cada pista contém: domínio, evidência direta com `question_id` e valor/texto, temporalidade, dados que contradizem, dados ausentes, hipóteses alternativas e perguntas sugeridas à entrevista. Exibir somente quando houver suporte específico; caso contrário: "dados insuficientes".

Domínios candidatos, sem inferência automática de transtornos: humor e interesse; sono e ritmos; apetite/energia; preocupação; concentração/executivas; manifestações traumáticas explicitamente relatadas; pensamentos intrusivos e comportamentos neutralizadores explicitamente relatados; variação episódica de humor e redução de necessidade de sono explicitamente relatadas; interação social e medo de avaliação quando diretamente referidos; fatores clínicos, uso de substâncias e contexto social quando documentados. Não inferir TEA, TDAH, TOC, transtornos bipolares, neurocognitivos ou outros quadros de desconforto social ou ruminação isolados.

DSM-5-TR funciona como **referência de investigação profissional**, com apontamento de critérios ainda não investigados, curso/duração/prejuízo/contexto/diferenciais; não gerar códigos ou frases diagnósticas. Sem probabilidades ou rankings de doenças. Revisão manual de todas as pistas, com histórico da decisão profissional. Não reproduzir extensamente material protegido.

**Testes oficiais:** sugerir primeiramente *construtos e procedimentos possíveis*; nomes específicos só quando catálogo curado tiver versão, população, finalidade, normas, tipo de aplicação, status SATEPSI verificado com fonte e data. Catálogo vazio no piloto até validação. Profissional decide quando e se utilizar instrumentos.

### 7. Acesso e entrega ao profissional
- **Área autenticada** já existente em `/nexo-profissional/` (confirmar estrutura atual): somente profissionais autorizados podem ver conteúdos de saúde. Não disponibilizar acesso por URL previsível ou "modo profissional" sem sessão válida.
- Lista de convites/participações: código e pseudônimo, status (não iniciado, em curso, pausa declarada, incompleto, concluído), data, última etapa conhecida, retorno/contato humano (sem pressupor evasão).
- Visão de caso: metadados e consentimentos, respostas originais, matriz biopsicossocial, PHQ/GAD item a item, complementos de sono/apetite, escores apenas se completos, impacto, registros de pausa, pistas de investigação com evidência e lacunas, campos de revisão do psicólogo.
- PDF **preparatório**, não laudo, com carimbo "Documento de apoio à entrevista; requer revisão humana"; possibilidade de corrigir notas profissionais sem alterar respostas originais; trilha de auditoria.
- Notificação por e-mail **genérica**, sem dado de saúde ou identificação sensível no assunto/corpo/anexo. O profissional entra no painel seguro para ver dados. Não enviar logs clínicos a analytics de publicidade ou IA externa.
- Registrar que a devolutiva humana foi realizada, com data e observações pertinentes, sem gerar texto conclusivo automaticamente.

### 8. Confiabilidade, ética, segurança e pesquisa
- Não habilitar coleta de dados reais sem autenticação, autorização por papel, proteção em trânsito e repouso, gestão de segredos, política de retenção/exclusão, exportação e direitos do titular, termo de privacidade e teste de segurança. Garantir que a pessoa saiba se não existe monitoramento 24h.
- Separar finalidade de cuidado de eventual uso em pesquisa; não tornar pesquisa condição de acesso. Submeter projeto a avaliação ética pertinente antes de alegar coleta de pesquisa aprovada.
- Segurança: qualquer resposta/relato de autoagressão/ideação de morte abre uma orientação de busca de apoio humano, adequada à gravidade, sem classificador de risco ou promessa de monitoramento. Em emergência: procurar urgência/SAMU 192; CVV 188 para apoio emocional. Fluxo profissional deve seguir protocolo aprovado pelo responsável e não confiar só em algoritmo.
- Metadados de abandono são dados de saúde associados ao percurso; coleta, finalidade, retenção e consentimento devem ser tratados com cuidado igual ou superior aos demais.
- Proibir serviços pagos, LLM externo ou envio de dados a terceiros sem revisão expressa. Não treinar modelos com respostas dos usuários por padrão.

### 9. Integração técnica: escopo e economia de créditos
- Site publicado tem rotas conhecidas no histórico de trabalho: `/conhecendo-meu-momento/responder/` e `/nexo-profissional/`. São referências, **não** prova da estrutura do repositório. Antes de alterar, inspecionar o projeto em disco.
- Preservar cabeçalho, cores e estrutura do site; integrar a experiência como módulo, sem reescrever layout global, configuração de hospedagem ou outros percursos.
- Adicionar contratos e testes automáticos primeiramente; depois interface e painel. O protótipo HTML v5 é apenas referência navegável, não código de produção.
- Reaproveitar autenticação, banco, sistema de convites e notificações se realmente existirem. Se não existirem, não improvisar persistência de dados clínicos em `localStorage`, URL, console, logs de navegação, e-mail ou ferramentas genéricas.
- **Prioridade P0:** consentimento, fluxo e acessibilidade, itens e respostas fiéis, evento de pausa, nenhum resultado ao participante, painel sintético. **Prioridade P1:** integração segura do backend, profissional autenticado, logs clínicos e rotina de revisão. **Prioridade P2:** catálogo de testes verificado, estudos éticos e acessibilidade de voz avançada.
- Em caso de falta de infraestrutura P1, parar em modo `DEMO_ONLY`, listar bloqueios concretos e não publicar coleta clínica real.

### 10. Critérios de aceite antes da produção
1. Perguntas visíveis sem siglas, pontuações, notas ou rótulos; identificação das escalas consultável no consentimento antes do aceite.
2. Participante adulto encaminhado, opção de pseudônimo, consentimentos separados, privacidade verificada, pausa e recusa sem pressão.
3. Exatamente 9 itens PHQ e 7 GAD; tempo de referência correto; alternativas 0..3; cálculos determinísticos; `null` nunca tratado como 0.
4. Complemento PHQ03 e PHQ05 **não entra no total** e distingue sentidos opostos.
5. Evasão: pausa, saída voluntária, abandono de causa desconhecida e falha técnica não são a mesma coisa; painel não explica o motivo com certeza.
6. Nunca mostrar resultados ou hipóteses ao participante; conclusão é confirmação simples e encaminhamento à devolutiva humana.
7. Sem dados pessoais em e-mail, URL ou log aberto. Profissional só vê caso por autenticação/autorização.
8. Hipóteses clínicas são pistas auditáveis com origem e lacunas, sem conclusões DSM nem testes "SATEPSI aprovados" não verificados.
9. Todos os testes com casos sintéticos: PHQ13/GAD7, itens faltantes, PHQ09>0, PHQ03>0, PHQ05>0, pausa, retomada, privacidade insuficiente.
10. Antes de qualquer uso clínico ou pesquisa: revisão profissional, técnica, jurídico-LGPD e, quando pertinente, ética em pesquisa.

### 11. Referências técnicas para revisão no release
- PHQ Screeners, Brazilian Portuguese PHQ-9 (endereço no banco JSON).
- GAD-7 em português brasileiro (referência no banco JSON), confirmar forma exata e equivalência de administração.
- Conselho Federal de Psicologia: SATEPSI, documentação da avaliação psicológica e regulamentação vigente; consultar **versão e data atual**.
- DSM-5-TR (APA), material de referência profissional, inclusive atualizações vigentes; não reproduzir extensa redação protegida.
- LGPD, orientações ANPD para dados pessoais sensíveis, regulamentação de pesquisa, e WCAG 2.2.

**Resultado esperado:** paciente acolhido no próprio ritmo, profissional melhor informado, nenhuma decisão clínica automatizada, e um percurso cujo eventual abandono ajuda a fazer perguntas melhores sem rotular nem culpar quem o interrompeu.
