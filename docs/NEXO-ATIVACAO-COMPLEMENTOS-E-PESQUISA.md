# NEXO · Complementos clínicos e preparação de pesquisa

Versão técnica: 09/11/2026. Status: **código pronto para revisão, não confundir com implantação/ativação confirmadas**.

## O que foi integrado no repositório

O painel protegido `/nexo-profissional/` apresenta a biblioteca de instrumentos e, quando o servidor estiver habilitado, opções para criar reaplicações clínicas individualizadas de PHQ-9 e GAD-7. A interface é a mesma do site NEXO e não depende da aplicação externa do catálogo.

A página `/conhecendo-meu-momento/complementar/` recebe um código pessoal de uso único, apresenta consentimento **assistencial** próprio, coleta somente o instrumento escolhido, permite pular itens e revisar respostas e confirma o recebimento sem exibir escores ao participante.

O serviço `/api/momento-followups/` utiliza passkey profissional existente, validação de CSRF e origem, convites aleatórios com hash, sessão HttpOnly/Secure/SameSite=Strict própria para complementos, criptografia AES-GCM, vínculo por ID do registro inicial, auditoria e retenção limitada ao tempo restante desse registro. A criação exige justificativa profissional e confirmação explícita de revisão de segurança. Um resultado novo não sobrescreve o original.

A biblioteca cataloga 17 entradas: PHQ-9 e GAD-7 integrados; 11 referências ainda em curadoria; quatro roteiros/procedimentos não padronizados. **Catálogo não é autorização para copiar itens ou aplicar teste.** Somente os dois rastreios existentes têm contrato de pontuação e formulário complementar nesta implementação.

## Publicar sem habilitar coleta nova

- O projeto publica a experiência Astro e a Cloudflare Pages Function no mesmo host já autorizado. Não trocar domínio, branch publicada ou a configuração das chaves do módulo clínico.
- A nova rota responde com indisponibilidade enquanto a migração 0002 não estiver aplicada e `NEXO_FOLLOWUP_ENABLED` não for `true`.
- Nenhuma conta, armazenamento externo, analytics, API generativa ou envio adicional por e-mail foi introduzido.
- Não alterar `NEXO_CLINICAL_PROTOCOL_APPROVED`, `NEXO_CLINICAL_PRIVACY_APPROVED` ou demais aprovações já controladas pelo proprietário para contornar bloqueios.

## Ativação operacional após validação

1. Confirmar branch/commit implantados e fazer backup do banco D1 existente sem abrir seu conteúdo a outros serviços.
2. Em ambiente isolado e com dados sintéticos, aplicar `migrations/0002_momento_followups.sql` após `0001_momento.sql`, validar tabelas, FK/cascade, CSRF, expiração e revogação.
3. Revisar linguagem do consentimento, política de privacidade, direitos de titulares, instruções de emergência, versão pt-BR, direitos e modalidade de aplicação dos instrumentos, incluindo SATEPSI quando cabível.
4. Confirmar aprovação técnica e clínica de reaplicação assistencial, configurar `NEXO_FOLLOWUP_ENABLED=true` na Cloudflare Pages de destino, **sem reutilizar flags como autorização de pesquisa**.
5. Confirmar no painel autenticado, com caso e convites totalmente sintéticos: criar, resgatar, responder, contabilizar, abrir a evolução, revogar, excluir e conferir a retenção. Não usar códigos reais em testes.
6. Somente após aceite documentado, liberar a funcionalidade para uso assistencial.

## Pesquisa futura, separada da assistência

**Esta versão não habilita registro de participantes de pesquisa nem uso secundário automático de dados assistenciais.** Antes de cada estudo: definir pergunta, desenho, população, plano de análise, risco, minimização, armazenamento, descarte, responsáveis, eventual apreciação/parecer do CEP conforme legislação e TCLE específico e voluntário. Incluir número e versão de protocolo aprovados, consentimento específico independente do assistencial e revogação. A recusa de pesquisa nunca bloqueia o acolhimento.

As autorizações de reprodução e uso já declaradas continuam documentadas, mas devem ser vinculadas à versão e **modalidade efetivamente aplicada**, não extrapoladas para todas as escalas. A orientação publicada pelo CFP em 16/10/2026 diferencia aplicação informatizada de aplicação remota/online.

## Limites conhecidos

- Não há integração API autenticada comprovada com o catálogo externo do ChatGPT Sites. A importação do JSON de definições no painel continua local e não habilita publicação de itens não verificados.
- Não há confirmação automática de deploy, aplicação da migração ou acesso ao painel real a partir do GitHub. Verificar o estado da Cloudflare diretamente.
- A política atual mantém os registros clínicos ativos por até 81 dias, com planejamento técnico total de até 90 dias. Não ampliar retenção para pesquisa sem análise e consentimento adequados.
- Resultados e HDs são auxiliares, revisáveis e não diagnósticos automáticos. O profissional é responsável por decidir instrumento, interpretar, abordar segurança e realizar devolutiva humana.
- Em investigação de autoagressão/ideação de morte, uma escala nunca substitui contato humano oportuno, avaliação de segurança e encaminhamento necessário.

## Referências

- CFP, orientação de 16/10/2026: https://site.cfp.org.br/cfp-orienta-psicologas-sobre-o-uso-de-testes-psicologicos-nas-modalidades-informatizada-e-online/
- SATEPSI: https://satepsi.cfp.org.br/
- Lei nº 14.874/2024: https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/lei/l14874.htm
- Decreto nº 12.651/2025: https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/decreto/d12651.htm
- LGPD: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
