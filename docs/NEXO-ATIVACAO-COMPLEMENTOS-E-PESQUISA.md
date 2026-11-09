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

## Autorizações anteriores e finalidade social sem fins lucrativos

**Não reiniciar procedimentos de autorização já realizados.** O NEXO foi concebido para acolhimento gratuito e projetos de investigação social não lucrativos. O responsável informou autorizações anteriores para essa finalidade; conservar o histórico e não tratá-las como inexistentes. O acervo original `NEXO_BANCO_INSTRUMENTOS_REFERENCIA_v2.json` já identifica fonte, versão e as notas de reprodução de PHQ-9 e GAD-7, incluindo a informação de que os formulários indicam dispensa de permissão de reprodução. Esses instrumentos permanecem integrados.

A curadoria dos **outros instrumentos** é individual: registrar quais autorizações já existem, sem pedir novamente as mesmas, e conferir somente documentação de versão, idioma, modalidade online e condições que não estiverem demonstradas. Não supor que a autorização de um instrumento se estende aos demais.

## Pesquisa social sem fins lucrativos e cuidados distintos

**Permissão de uso do instrumento**, **consentimento/base legal para tratar dados pessoais** e **enquadramento ético da pesquisa** são dimensões diferentes. A ausência de fins lucrativos não invalida as autorizações já concedidas; tampouco constitui, isoladamente, dispensa de apreciação ética.

As Resoluções CNS nº 510/2016 e nº 674/2022 preveem situações específicas de não submissão ao Sistema CEP/Conep, como pesquisa de opinião pública com participantes não identificáveis e utilização exclusiva de informações já agregadas sem reidentificação. Conferir o enquadramento de **cada método**: registros clínicos vinculáveis, dados sensíveis de saúde e contato por convite profissional não são automaticamente equivalentes a levantamentos de opinião pública não identificáveis. Quando houver necessidade de apreciação ética, registrar o parecer/protocolo correspondente; quando houver dispensa aplicável, registrar os fundamentos sem inventar um parecer.

A versão de software publicada neste momento **não implementa autorização automática para uso secundário em pesquisa de dados recolhidos durante o acolhimento clínico**. Uma pesquisa concreta exige escopo, informação ao participante, processo de consentimento ou outra base legítima adequada, segurança e retenção conforme a finalidade. Eventual recusa não impede atendimento. Dados individuais não podem ser transferidos do fluxo assistencial para pesquisa por mero clique administrativo.

As autorizações já declaradas devem ser vinculadas à **versão e modalidade efetivamente aplicada**, sem extrapolação. A orientação CFP de 16/10/2026 distingue aplicação informatizada de aplicação remota/online para testes psicológicos. Não classificar automaticamente todo rastreio como teste psicológico privativo; conferir seu enquadramento técnico.

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
