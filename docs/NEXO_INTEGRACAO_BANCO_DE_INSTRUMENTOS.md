# NEXO · Contrato pendente para integrar o banco externo de instrumentos

**Estado em 09/11/2026:** integração NÃO conectada. A área profissional já oferece roteiro de primeira entrevista, hipóteses exploratórias e uma minuta selecionável de procedimentos/instrumentos. A ação **Copiar seleção** não persiste nem envia conteúdo clínico; o link externo é apenas navegação sem identificadores. Não declarar que houve agendamento, envio, aplicação ou importação de resultados.

**Painel externo indicado:** https://nexo-acolhimento.azureplum16.chatgpt.site/painel

**Bloqueio atual:** não há API documentada/contrato de autenticação disponível para esse painel. Não inspecionar endpoints privados, não usar credenciais do navegador, não interpolar dados de prontuário em URLs, e-mail, logs ou prompts de outro serviço.

## Experiência-alvo depois de autorização técnica

1. No registro clínico, a pessoa já recebeu consentimento e encaminhamento inicial. O psicólogo revisa o resumo e o roteiro de segurança antes de considerar novos instrumentos.
2. O banco fornece **apenas um catálogo curado**, com id estável, versão, fonte, construto, faixa etária, modalidade, validade da aplicação online, licença, situação SATEPSI (quando teste psicológico), data e revisor da verificação. **Status desconhecido não significa favorável.** O profissional escolhe.
3. A área profissional permite selecionar instrumentos, estabelecer objetivo clínico, data limite, modalidade e justificar a decisão. Não enviar automaticamente por escore.
4. A pessoa aceita separadamente a oferta de instrumento, conhece duração estimada, privacidade, possibilidade de não responder ou fazer junto ao profissional. Nenhum formulário é condição para o acompanhamento.
5. Somente após aceite e revisão, um serviço servidor-servidor cria convite individual de uso único e validade curta; notificação neutra, sem escores, hipóteses ou respostas.
6. O retorno é autenticado e vinculado ao convite por identificador aleatório, sem URLs previsíveis; as respostas são armazenadas e exibidas exclusivamente na área profissional com trilha de acesso e retenção definida.
7. O sistema nunca interpreta recusa como traço psicológico nem apresenta diagnóstico ao participante. A devolutiva é humana.

## Requisitos de integração (a documentar, NÃO são endpoints confirmados)

**Catálogo:** serviço autenticado de leitura de metadados de instrumentos. Registrar versão, editora, status de uso, fontes, copyright, idade/normas, direito de aplicação remota e data da conferência. Instrumento pendente fica apenas como construto a investigar.

**Criar programação:** aceitar um id de encaminhamento aleatório, identificadores de instrumentos previamente verificados, finalidade, modalidade, janela de validade, consentimento e aprovação profissional. Exigir idempotência e escopos mínimos; nunca enviar resultados PHQ-9/GAD-7 nem narrativas por padrão.

**Consultar estado/cancelar:** emitir status com 'rascunho', 'oferecido', 'aceito', 'iniciado', 'concluído', 'recusado', 'expirado', 'revogado'. Distinguir escolha consciente de erro, interrupção e pergunta não apresentada.

**Receber resultado:** callback assinado e autenticado com versionamento e data, ou consulta backend com escopo, criptografia de transporte e repouso, política LGPD, auditoria e retenção pactuada. Nunca depender de script cross-origin na página clínica.

**Segurança:** se o item 9 PHQ-9 for positivo, ausente com preocupação clínica ou houver outro sinal agudo, a programação eletiva não substitui avaliação humana oportuna. Não enviar escala de risco para triagem sem protocolo profissional e sem serviço de resposta.

## Aceite necessário do controlador técnico do banco

Antes de ativar envio real, obter identificação do serviço responsável, documentação de API, mecanismo de autorização, contrato de tratamento de dados, retenção, direitos de titulares, conteúdo/licença e versão de cada instrumento, política de incidentes, ambiente de homologação e testes de autenticação e consentimento. Confirmar com profissional responsável o fluxo de crise e os critérios de elegibilidade.

## Testes obrigatórios antes de produção

- Tentativa de enviar sem consentimento, com instrumento não validado, ou para participante não elegível deve falhar.
- Duplo clique não gera dois convites; revogação retira acesso.
- Links não contêm nome, prontuário, escore, hipótese ou telefone.
- Recusa, pausa, falta de conexão e finalização geram estados distintos.
- Aplicação somente dentro da modalidade autorizada e com o suporte necessário.
- Envio concluído só após confirmação do serviço externo; retorno só após validação criptográfica.
- Resultado aparece apenas no painel profissional, acompanhado de fonte, validade, data e limitações; não em e-mails.
- O sistema não faz diagnóstico nem afirma qualidade SATEPSI sem conferência atualizada.

Referência profissional: Resolução CFP 31/2022 e SATEPSI (https://satepsi.cfp.org.br/).
