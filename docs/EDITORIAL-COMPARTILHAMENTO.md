# Compartilhamento editorial — ativação condicional

Estado em 18/10/2026: o titular informou que concluiu o cadastro no Resend. O cadastro, por si só, não ativa o envio. A interface permanece desativada por padrão e só libera consentimento e confirmação quando o endpoint informa configuração completa e a versão de privacidade esperada. Esta implementação e seus testes não configuram credenciais, não ativam o servidor e não enviam e-mails reais.

## Serviço candidato e limites

O adaptador utiliza a API transacional Resend, por HTTPS, sem dependência de SDK. A documentação oficial prevê `POST https://api.resend.com/emails`, corpo com `from`, `to`, `subject` e `text`, e chave de idempotência com validade de 24 horas. A página de preços consultada em 18/10/2026 oferece plano gratuito com limite diário de 100 mensagens; o titular deve conferir a quota mensal e as condições da conta antes da adesão. Não foi ativada cobrança excedente, contratação, conta ou alteração de DNS/domínio.

Fontes: [API de envio](https://resend.com/docs/api-reference/emails/send-email), [idempotência](https://resend.com/docs/dashboard/emails/idempotency-keys), [preços e limites](https://resend.com/pricing).

## Rotas e bloqueios

- `GET /api/editorial-sharing/status`: informa `enabled`, `mode`, destinatário, versão da política e prazo. Não informa chaves nem o motivo específico de uma configuração secreta faltar.
- `POST /api/editorial-sharing`: aceita somente a origem HTTPS exata do projeto de prévia configurado, conteúdo JSON com até 8 KiB, consentimento específico e maioridade declarada. Não há CORS liberado para outros sites.
- A interface consulta a disponibilidade somente depois da devolutiva e do clique em “Sim, desejo compartilhar”. Essa consulta é um GET sem respostas, perfil ou parâmetros pessoais. Erro, ausência de rota, indisponibilidade ou versão de privacidade divergente mantêm o envio bloqueado. O POST só é preparado após maioridade confirmada e consentimento específico não pré-marcado.

Qualquer requisito ausente deixa o endpoint desativado. Variáveis exclusivamente no servidor, nunca em `PUBLIC_*`, HTML, arquivos versionados ou logs:

| Nome | Condição de futura ativação |
| --- | --- |
| `EDITORIAL_SHARING_ENABLED` | `true` somente após autorização de ativação |
| `EDITORIAL_PRIVACY_APPROVED` | `true` após revisão da finalidade, base legal, transparência e condições de tratamento |
| `EDITORIAL_RETENTION_PROCEDURE_APPROVED` | `true` somente após existir procedimento operacional de exclusão, incluindo e-mail e provedor |
| `EDITORIAL_RECIPIENT` | Endereço aprovado: `nexoneuropro@gmail.com` |
| `EDITORIAL_MAIL_FROM` | Remetente autorizado e verificável do provedor; não há padrão inventado |
| `RESEND_API_KEY` | Segredo válido, com menor privilégio necessário |
| `EDITORIAL_RATE_HMAC_SECRET` | Segredo aleatório de pelo menos 32 caracteres, independente da chave de e-mail |
| `EDITORIAL_SHARES` | Binding de Workers KV separado e com acesso restrito |
| `EDITORIAL_ALLOWED_ORIGIN` | Opcional; padrão `https://nexo-previa-20261014.pages.dev`; aceita apenas esse projeto Pages e seus subdomínios de implantação |

Essas flags registram decisões reais e não devem ser preenchidas como formalidade. Nenhum valor secreto real acompanha o código.

## Contrato do pedido

Lista exata de campos: `editionSlug`, `quizId`, `quizVersion`, `context` (`personal` ou `company`), `result`, `adultConfirmed: true`, `consent`, e os opcionais `pseudonym`, `ageRange`, `uf`. Ausência dos opcionais equivale a “Leitor anônimo” / “Não informado”. Não se pede nome real, telefone, e-mail do leitor, CPF, endereço ou nome da empresa.

`consent` exige `accepted: true`, `version: "2026-10-18-v1"`, `id` UUID v4 e `givenAt` ISO UTC. A manifestação deve ter ocorrido nas últimas 24 horas, com tolerância de até cinco minutos de relógio adiantado. Sua geração deve resultar de uma ação do leitor após o resultado e após a apresentação das condições específicas. Um checkbox genérico ou pré-marcado não cumpre esse contrato.

`result` contém apenas `fragments`, com um fragmento por tema: `themeId`, `observation`, `nextStep`. Os textos só são aceitos se corresponderem exatamente à devolutiva autoral permitida na versão do quiz. O servidor deriva títulos e ordem a partir de `src/data/editorial-quizzes.ts`; não aceita texto livre de resultado, perguntas/opções originais, mapa de respostas, pontuações ou classificações inventadas. O validador inicial atende às perguntas de escolha única da demonstração; novas edições ou saídas compostas exigirão revisão explícita da allowlist, sem ampliar silenciosamente a coleta.

Faixas aceitas: não informar, 18–24, 25–34, 35–44, 45–54 e 55+. Qualquer declaração de menoridade ou ausência da confirmação de 18 anos ou mais impede o envio. O exercício e a leitura continuam acessíveis independentemente de compartilhar.

Os campos opcionais ficam apenas na memória da página e não são acrescentados ao armazenamento de sessão das respostas. A confirmação mantém o mesmo UUID, data e corpo em novas tentativas de uma solicitação sem alterações. Mudanças no perfil ou na devolutiva exigem uma nova confirmação. Enquanto aguarda a rede, a interface bloqueia alterações que fariam a confirmação divergir do corpo enviado. Um erro ou timeout não é tratado como sucesso; o leitor continua podendo copiar/salvar a devolutiva. O retorno de aceitação mostra o identificador e explica que a chegada à caixa de destino não foi verificada. Fechar o painel ou apagar escolhas locais não é apresentado como revogação de um compartilhamento anterior.

**Mesmo sem respostas brutas, a devolutiva pode revelar informações pessoais e permitir inferências sensíveis.** Pseudônimo não significa anonimização. Não está autorizada uma análise de saúde, seleção de empregados, publicidade ou ampliação da finalidade por este código. A revisão de privacidade deve decidir se o envio do texto por e-mail é aceitável; se não for, o adaptador deverá mudar para mera notificação e consulta protegida antes da ativação.

## Segurança, idempotência e confirmação

Campos extras, saídas alteradas, consentimento expirado, identificador reutilizado com corpo diferente, UF inválida, pseudônimo com marcação ou cabeçalhos e pedidos fora de origem são rejeitados. Nenhuma credencial, payload ou erro do provedor é registrado em logs pela aplicação.

O rate limit usa o IP fornecido pela infraestrutura Cloudflare apenas em memória para produzir um digest HMAC limitado à janela de uma hora. O IP bruto e o user agent não entram no KV de resultados nem no e-mail. O contador técnico expira em uma hora. Trata-se de pseudonimização de segurança, não de coleta anônima. Logs operacionais próprios da hospedagem e dos fornecedores precisam de revisão separada.

O limite inicial é cinco tentativas por janela de hora e digest. Workers KV tem consistência eventual e não oferece contador/lock transacional: esse controle é uma defesa básica, não uma garantia contra concorrência distribuída. Antes da captação real, avaliar Rate Limiting/Durable Object e cotas do provedor; manter gastos excedentes desabilitados e configurar alertas. [Documentação de consistência do KV](https://developers.cloudflare.com/kv/concepts/how-kv-works/).

UUID de consentimento e digest HMAC do corpo canônico impedem reutilização com conteúdo diferente durante a retenção. O servidor grava estado pendente antes do contato externo e envia uma chave estável ao Resend. Repetição já aceita não gera outra chamada. Falha de rede mantém estado não confirmado; nova tentativa usa a mesma chave e o mesmo corpo. Após a janela de 24 horas, um estado ambíguo exige conferência administrativa; não ocorre reenvio automático. A idempotência do provedor complementa o KV, cuja consistência eventual não deve ser confundida com bloqueio atômico.

Resposta de sucesso significa apenas **aceitação pela API do provedor**, comprovada pelo identificador retornado. Não comprova chegada à caixa, leitura ou conclusão clínica. Erros não exibem confirmação falsa e não impedem o leitor de guardar sua devolutiva local.

## Retenção e exclusão: responsabilidades distintas

Registros de consentimento, perfil opcional e saída educativa no KV expiram no máximo 90 dias após a primeira recepção. Repetições não ampliam esse prazo. Contadores técnicos expiram em uma hora. Não há rota pública para listar registros.

**A expiração do KV NÃO apaga mensagens do Gmail, cópias encaminhadas, lixeira, exports, backups nem registros do Resend.** Não se promete exclusão automática desses ambientes. O responsável deverá definir procedimento de acesso restrito, eliminação até 90 dias, tratamento de cópias/backups e atendimento a revogação/exclusão em `nexoneuropro@gmail.com`, documentando limites legais e técnicos. A aprovação desse procedimento é um bloqueio de ativação independente. O prazo do provedor precisa ser confirmado contratualmente; sua página pública não substitui essa revisão.

## Testes executáveis, sem transmissão real

`node scripts/test-editorial-sharing.mjs` usa KV em memória e função de rede simulada. Verifica configuração parcial, origem, tipo/tamanho do corpo, menoridade, consentimento, campos excessivos, saída manipulada, payload mínimo de e-mail, digest/expirações, replay, conflito, erro do provedor e falha de armazenamento. `node scripts/test-editorial-sharing-client.mjs` testa o contrato fechado do status, GET sem corpo pessoal, a allowlist do cliente contra o validador real do servidor, maioridade/consentimento, estabilidade do pedido em retries e rejeição de confirmações ausentes ou divergentes. Os testes não usam credenciais e não enviam e-mail.

Antes de ativar: revisão de privacidade e segurança, procedimento de retenção completo, remetente/provedor confirmados, bindings/segredos no servidor, quotas, consentimento final e teste real restrito autorizado. Nenhuma dessas etapas foi presumida como aprovada por a infraestrutura estar escrita ou pelo titular ter criado a conta.
