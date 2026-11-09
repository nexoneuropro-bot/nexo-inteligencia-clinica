# NEXO · Ativação controlada dos instrumentos complementares internos

Este módulo **ainda não está liberado na prévia publicada**. Permanece no PR #12, porque a migração `migrations/0002_momento_instrumentos.sql` altera a estrutura da base clínica. Publicar o código antes de aplicar a migração pode quebrar os convites originais. Não executar sem acesso autorizado e backup.

## O que o código do PR #12 já implementa

- Psicólogo autenticado seleciona PHQ-9 ou GAD-7 para um registro existente, com finalidade revisada, modalidade (sessão/entre sessões), validade, revisão clínica e revisão explícita de segurança quando necessária.
- Backend cria convite individual de uso único, com código separado do URL e vínculo com o registro original.
- Participante abre a página interna `/conhecendo-meu-momento/instrumento/`, confirma consentimento, responde no próprio ritmo, pode pular, pausar e retomar **na mesma aba**; sair ou fechar sem confirmar não envia dados.
- Resultado é pontuado com motor de rastreio existente, criptografado e associado ao registro original no banco clínico. Psicólogo vê respostas, impacto e comparação descritiva.
- Histórico permite acompanhar convites, resultados e revogar convites ainda não respondidos.
- Não há interpretação diagnóstica automatizada, envios espontâneos ou publicação de respostas em outro site.

## Limitações que não podem ser ocultadas

- O **acervo de instrumentos adicionais do ChatGPT Site temporário não foi recuperado**. Por isso somente PHQ-9 e GAD-7 aparecem como opções reais. A interface de importação de packs é ferramenta **local de revisão** e não ativa novas escalas automaticamente.
- É preciso conferir versão, idioma, licença, normas, adequação profissional e modalidade antes de habilitar cada instrumento novo. Não basta copiar textos de formulário ou citar ISI.
- A função de pausa mantém o rascunho na aba aberta, não promete retomada após fechar navegador. Para retomada persistente será necessário protocolo seguro e consentido de rascunhos clínicos.
- Os testes sintéticos e de navegador não substituem aplicação da migração nem ensaio real autenticado e controlado após implantação.
- O NEXO não monitora crises 24 horas por dia. Resposta positiva/ausente relacionada a morte/autolesão exige avaliação humana oportuna.

## Ordem correta para liberar a prévia

1. Realizar **backup verificado** do banco clínico de prévia no provedor autorizado, conferindo dados e retenção existentes.
2. Revisar migração `0002_momento_instrumentos.sql` e relações com os registros originais, índices e expiração.
3. Aplicar a migração **apenas** na base de prévia, pela ferramenta autorizada do responsável pelo banco, e conferir colunas `instrument_id`, `source_submission_id`, `administration_mode` em `momento_invites`, e tabela `momento_instrument_results`.
4. Integrar PR #12 ao ramo `feat/experiencia-imersiva` e verificar publicação externa.
5. Usando conta profissional autenticada e perfil **sintético**, testar: selecionar instrumento → criar código → abrir a página interna → consentir → responder → confirmar → ler resultado no painel → revogar outro convite não utilizado.
6. Conferir se convites de acolhimento anteriores continuam funcionando, se nenhum e-mail inclui dados clínicos e se o registro complementar é acessível apenas ao profissional.
7. Só depois de aprovação explícita clínica e de privacidade considerar uso real. `main` e domínio de produção permanecem intocados.

## O que falta para TODOS os packs do Site temporário

Solicitar ao projeto-fonte a exportação **somente das definições** (identificadores, versões, questões autorizadas, alternativas, regras de pontuação, condições de aplicação e direitos), sem registros de pacientes, seguindo `docs/NEXO_MIGRACAO_ESCALAS_SITE_TEMPORARIO.md`. Confrontar cada pack com normas e direitos antes de migrar a aplicação para o NEXO.

**Não usar o ChatGPT Site temporário como banco de respostas clínicas.** O objetivo final é um domínio, um banco protegido, rastreios complementares e acompanhamento longitudinal pelo profissional.
