# Bateria PHQ-9 e GAD-7 — implementação e ativação

Atualizado em 8 de novembro de 2026. Instrumentos confirmados pelo titular: somente PHQ-9 e GAD-7. O pedido atual autoriza construir a operação clínica; não apresentar somente as quatro perguntas autorais como bateria.

## Conteúdo e versões

- PHQ-9: nove itens e pergunta funcional sem soma adicional, redação da cópia identificada como Pfizer PHQ9P, Português do Brasil, 2005. Fonte: https://multiculturalmentalhealth.ca/wp-content/uploads/2019/07/PHQ-9-Portuguese.pdf . SHA-256: `6626567aac7063e2104b0f4d835aa9ca25d22b577a239452f9f64519cdc7f0ab`.
- GAD-7: sete itens, redação Pfizer reproduzida no anexo B, página impressa 62, do protocolo SES Sergipe/Funesa de 2024: https://www.funesa.se.gov.br/wp-content/uploads/2025/03/protocolo-clinico-terapeutico-digital-final.pdf . SHA-256: `925a9c8cb1a013dfc2cb5d06df1c501192ac681a81c14d1d3f401e39b82b98f7`. A pergunta adicional de impacto no código é contextual, separada do instrumento e da pontuação.
- Ambos preservam duas semanas, ordem e alternativas 0–3. Não foi criada tradução nova. Os identificadores do código descrevem a fonte transcrita; não afirmam validação da interface digital ou de aplicação oral.
- O PDF GAD7.pdf disponibilizado no site do autor Moreno foi inspecionado e excluído: diz uma semana e usa outras alternativas. Não misturar essa versão com regras de duas semanas.
- Direitos: comunicado do detentor Pfizer de 21/07/2010 informa disponibilização sem restrição de copyright e sem custo; o anexo B também declara reprodução permitida. https://www.pfizer.com/news/press-release/press-release-detail/pfizer_to_offer_free_public_access_to_mental_health_assessment_tools_to_improve_diagnosis_and_patient_care
- Evidência brasileira GAD-7: MORENO, A. L. et al. Factor structure, reliability, and item parameters of the Brazilian-Portuguese version of the GAD-7 questionnaire. Temas em Psicologia, v. 24, n. 1, p. 367–376, 2016. DOI: https://doi.org/10.9788/TP2016.1-25 . Não copiar as referências bibliográficas divergentes impressas no protocolo estadual como se tivessem sido verificadas.
- Regras técnicas conferidas em https://www.hiv.uw.edu/page/mental-health-screening/phq-9 e https://www.hiv.uw.edu/page/mental-health-screening/gad-7 . O briefing define faixas e casos de teste; não há diagnóstico automático, recomendação por limiar, escore combinado ou preenchimento de ausentes com zero.

## Arquitetura implementada

Astro existente e Cloudflare Pages Functions; D1 isolado; conteúdo clínico cifrado AES-256-GCM com vínculo autenticado ao ID; segredos fora do repositório. Passkey profissional com verificação do usuário, cadastro inicial autorizado por código ao e-mail administrativo confirmado. Convites aleatórios de uso único, armazenados como hash e fornecidos fora da URL. Cookies HttpOnly/Secure/SameSite=Strict; CSRF e origem exata; validação e recálculo no servidor; auditoria por recurso; revogação; recibo e reenvio idempotente; falha de e-mail diferenciada de falha de gravação.

O participante acessa `/conhecendo-meu-momento/responder/` com código entregue pelo profissional após o primeiro contato. A sequência inclui consentimento e maioridade, perfil opcional, privacidade, quatro perguntas de contexto, PHQ-9, impacto, GAD-7 e contexto funcional, revisão e confirmação de envio. As siglas ficam no consentimento/metodologia, fora do cabeçalho das perguntas. Não há escores ou faixas na síntese do participante.

O profissional acessa `/nexo-profissional/`, cadastra a própria passkey, cria/revoga convites e lê respostas e resultados técnicos autenticados. Resend é usado somente para código administrativo e aviso neutro de nova resposta a `nexoneuropro@gmail.com`. Não enviar conteúdo clínico por e-mail comum.

## Configuração real necessária, sem novas contas pagas

1. Criar D1 `nexo-momento-clinico-previa` na conta existente e aplicar `migrations/0001_momento.sql` no banco vazio. Vincular a Pages Functions como `NEXO_CLINICAL_DB`.
2. Configurar segredos independentes: `NEXO_CLINICAL_ENCRYPTION_KEY` (base64 de 32 bytes), `NEXO_CLINICAL_TOKEN_SECRET` (32 bytes ou mais). O segredo `RESEND_API_KEY` já está salvo no Pages; não recriá-lo nem revelá-lo. Definir `NEXO_CLINICAL_MAIL_FROM` com remetente autorizado no Resend. Para o endereço proprietário da conta, o remetente de teste autorizado pode ser usado se o provedor confirmar essa condição; não inventar domínio verificado.
3. Definir origem exata `NEXO_CLINICAL_ORIGIN=https://nexo-previa-20261014.pages.dev`. Rever protocolo, privacidade, fornecedores/transferência, retenção e plano gratuito antes de marcar as respectivas flags como aprovadas. Não marcar aprovações clínicas/jurídicas automaticamente.
4. Implantar o Worker diário de `infra/momento-retention/`, com a mesma associação D1; sem rota pública, sem chave de criptografia. Cron 06:17 UTC (03:17 na Bahia). Executar manutenção inicial e testar recuperação em banco separado antes de receber dados reais.
5. O acesso ativo encerra em 81 dias. Expurgo diário e histórico D1 Free de até sete dias reservam margem dentro do planejamento total de até 90 dias. Sem manutenção confirmada em 25 horas, o fluxo clínico fecha. Incidentes ou mudança de plano exigem intervenção/revisão; não prometer expurgo físico durante falha arbitrária da infraestrutura.
6. Ativar o runtime e confirmar primeiro com registro inteiramente sintético, inclusive leitura autenticada, aviso neutro, repetição de envio, revogação e descarte. O titular deve concluir a criação da própria passkey no dispositivo; essa etapa não pode ser simulada por um agente.

## Estado da configuração em 08/11

A sessão Cloudflare foi retomada. Uma falha do controle do navegador foi recuperada reinicializando a sessão CUA; não é bloqueio permanente. Foi criado o banco D1 vazio `nexo-momento-clinico-previa`, ID `50035115-3e88-435c-9561-35e6f866fad1`, região ENAM, plano com limites rígidos gratuitos. A migração foi aplicada com sucesso pelo console. A associação `NEXO_CLINICAL_DB` foi salva no projeto Pages.

O titular confirmou especificamente nesta execução: autorizar associação, criação/salvamento dos dois segredos e rotina de exclusão gratuita; aprovar a ativação dos dois instrumentos para adultos convidados após os testes sintéticos, conforme o protocolo e a privacidade preparados. Não pedir novamente essas autorizações, o destinatário ou a composição da bateria.

Os segredos `NEXO_CLINICAL_ENCRYPTION_KEY` e `NEXO_CLINICAL_TOKEN_SECRET` foram gerados aleatoriamente e salvos como segredos no Pages, sem copiar seus valores para arquivos, logs ou chat. O segredo `RESEND_API_KEY` preexistente foi preservado. As sete variáveis de configuração clínica foram salvas; o remetente de teste é `NEXO <onboarding@resend.dev>`, limitado ao endereço proprietário da conta Resend já confirmado. A origem é somente a prévia pages.dev. Não alteramos DNS ou domínio definitivo.

Ainda verificar nesta execução: implantar e testar o Worker diário, publicar o código revisado, confirmar status real da API e envio do código administrativo, e o titular cadastrar a própria passkey no dispositivo. Depois realizar o ensaio de envio e leitura inteiramente sintético. Não afirmar que o link está pronto para pacientes antes dessas verificações.

Validação de código já realizada: 38 testes passaram (modelo, todos os totais/faixas, incompletos, criptografia, autenticação, convites, CSRF, revogação, idempotência, auditoria, expiração e falha de e-mail), Astro check com 112 arquivos e zero erros/avisos/hints; build com 29 páginas; verificadores institucional e editorial sem falhas. O prazo ativo foi reduzido a 81 dias após revisão de segurança para reservar margem até o máximo planejado de 90 dias incluindo cópias técnicas.

## Segurança clínica para revisão pelo responsável

A finalidade é preparação de entrevista para adultos convidados, sem pesquisa/decisão trabalhista. A aplicação dos instrumentos é por leitura/toque; não afirmar equivalência de narração automática. Item 9 positivo gera orientação imediata de busca de apoio, sinalização técnica independente da soma e exige avaliação humana; zero não atesta segurança. Não há monitoramento contínuo. O responsável deve definir a revisão das respostas e a devolutiva, o fluxo de intercorrências, os direitos dos participantes e a guarda assistencial aplicável antes de liberar convites reais.
