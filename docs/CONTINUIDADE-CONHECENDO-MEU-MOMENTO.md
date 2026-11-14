# Conhecendo Meu Momento — continuidade

**Estado atual em 08/11/2026: bateria, infraestrutura privada e ensaio real concluídos na prévia.** O titular cadastrou a própria passkey. PHQ-9 e GAD-7 foram respondidos com dados sintéticos, gravados no D1 cifrado e lidos pela área autenticada com totais 13/7; o serviço confirmou o aviso neutro por e-mail. Cron diário configurado e testado, sem URL pública. O uso começa em `/nexo-profissional/` para criar convites a `/conhecendo-meu-momento/responder/`. O estado detalhado está em `MOMENTO-BATERIA-FONTES-E-ATIVACAO.md`. Todo o restante deste documento registra a entrega HISTÓRICA da Fase 1: não usar seus bloqueios antigos para desativar ou refazer a implementação atual.

Registro histórico da Fase 1: a demonstração permanece separada do fluxo clínico atual.

## Finalidade e decisões do titular

Projeto gratuito da NEXO, sem financiamento informado, para melhorar acesso e preparação da conversa profissional, inclusive atendimentos online. O profissional conversa antes, esclarece a proposta, recebe o aceite e encaminha convite individual. O titular confirmou `nexoneuropro@gmail.com` como destinatário administrativo e pediu resolver convites, acesso e envio no próprio projeto. Não usar serviços pagos nem infraestrutura improvisada. Instrumentos e dados reais continuam sujeitos às salvaguardas do briefing; não ativar pontuação ou diagnóstico nesta fase.

## Base conferida

- Site existente em `outputs/nexo`, Astro 7.3.8 estático, TypeScript e Three.js. Cloudflare Pages; ramificação publicada `feat/experiencia-imersiva`.
- HEAD remoto conferido: `a58584b1a0dc0a02aa8aaba1391a31da5a733651`, árvore `6155749c9e60f72b89b662b07e9172a1744cd4b9`.
- Checkout principal tem alterações anteriores importantes; não fazer reset, limpeza ou commit indiscriminado.
- Checkout de publicação anterior: `outputs/nexo-publicacao-revistas-20261020`, árvore igual à publicada, sem node_modules. O commit local tem história diferente: publicar com o parent remoto correto, sem force.
- `nexo_codex_kit/` não estava no remoto consultado. Os dois arquivos foram recuperados do pacote local `NEXO_HTML_e_Comando_Codex.zip`; o briefing é byte a byte igual ao anexo do titular e foi lido integralmente. O HTML foi lido como referência de fluxo, sem executar seus scripts.
- Conversa compartilhada consultada apenas para contexto. NÃO copiar seu relato pessoal ou respostas de saúde para o projeto.
- O único serviço de envio encontrado é editorial: `functions/api/editorial-sharing.js`. O status público retornou `enabled:false`, `mode:demo`, destinatário NEXO. Ele não oferece convites clínicos, autenticação profissional nem armazenamento clínico. Não reaproveitar sua API para respostas clínicas.

## Arquivos já escritos nesta execução

- Referências em `nexo_codex_kit/`.
- `src/data/momento-demo.ts`: perfis e quatro perguntas com alternativas fictícias fechadas.
- `src/lib/momento-demo.ts`: estado em memória, validação por lista permitida, síntese determinística sem pontuação.
- `src/lib/momento-features.mjs`: configuração fechada; o build rejeita ativar funcionalidades clínicas por flag.
- `src/components/MeuMomento.astro` e `src/styles/meu-momento.css`: interface premium acessível com consentimento, perfil, privacidade, preferências, perguntas e síntese.
- `src/layouts/MomentoLayout.astro`, páginas `src/pages/conhecendo-meu-momento/index.astro`, `demonstracao.astro`, `visao-tecnica.astro`.
- `src/layouts/Layout.astro`: prop `privateExperience`, noindex permanente e sem som ambiente nessas rotas.
- `astro.config.mjs`: headers no-store/noindex/no-referrer e connect-src none para a demonstração; guarda de configuração.
- `.env.example`: flags seguras.
- `scripts/test-momento-demo.mjs`: testes do modelo. Os agentes salvaram os arquivos, mas atingiram limite de uso antes de concluir a verificação final.
- `src/scripts/meu-momento.ts`: controlador concluído, com estado apenas em memória, aceite, seis etapas, revisão, pausa, limpeza, exportação voluntária de exemplo e leitura por vozes locais. Não usa envio, gravação de áudio ou interpretação por IA.
- `src/components/ExperienceFooter.astro`: acesso ao recurso a partir do rodapé existente. Verificadores agora reconhecem as três novas rotas sem colocá-las no sitemap.

## Validações já concluídas

- 13 testes do modelo passaram; consentimentos independentes, campos facultativos, dados desconhecidos rejeitados, recusa de privacidade, perguntas puladas sem zero, síntese fiel e configuração fechada.
- Astro check: 98 arquivos, zero erros, avisos ou hints.
- Build da prévia: 26 páginas; verificadores institucional e editorial passaram, sem falhas. Somente os 21 arquivos desta integração são copiados para o checkout de publicação, preservando revistas e serviços já publicados.
- Navegador com CSP restritiva: bloqueio antes do aceite, perfil integralmente omitido, privacidade recusada com pausa, retomada e privacidade parcial com áudio desabilitado, quatro perguntas com uma pulada, síntese descritiva, revisão de escolhas, encerramento e recarregamento. Nenhum erro no console. Conferência móvel 390 × 844 sem excesso de largura.

## Próximos passos concretos

1. Concluir publicação e confirmar o commit e as três URLs na prévia existente. Script de cópia e manifesto em `work/prepare_momento_publication.py` e `work/momento-publication-manifest.json`, fora do site.
2. Implementar a fase clínica conforme as exigências do briefing: autenticação forte do profissional; autorização por registro; convites aleatórios com hash, expiração, uso único e proteção de tentativas; consentimento versionado e revisão de políticas; armazenamento criptografado com retenção/descarte; auditoria, backup e teste de restauração; aplicação dos instrumentos somente após revisão da versão e modalidade.
3. Integrar o Resend ao fluxo clínico apenas para avisos neutros ao destinatário confirmado. A seção 6.5 do briefing proíbe conteúdo clínico em e-mail comum: respostas ficam em área profissional autenticada. Não alterar o serviço editorial para receber dados clínicos.
4. Testar a infraestrutura com casos inteiramente sintéticos, incluindo negação de acesso cruzado, expiração/reutilização de convite, revogação, exportação/exclusão, falha de envio e descarte de dados. Nenhum participante real antes da validação.

## O que o usuário não deve precisar repetir

O recurso deve ficar no site atual, ser premium, gratuito e servir à comunidade. O atendimento humano será online; o convite vem depois da conversa inicial e do aceite. O destinatário administrativo é o e-mail já confirmado. A falta de backend é uma tarefa de implementação, não uma obrigação de o titular descobrir uma plataforma externa. Não oferecer diagnósticos automáticos, coleta aberta ou uma falsa confirmação de envio para abreviar o trabalho. Não dizer que a fase clínica está pronta enquanto estes controles não existirem.

## Limites que não devem virar mensagens enganosas

Sem estado em localStorage/sessionStorage/cookies, conteúdo de saúde em URL/log, texto livre na demonstração, envio fictício, autenticação simulada ou promessa de monitoramento. Apenas vozes locais pt-BR, se disponíveis, sob clique. PHQ-9/GAD-7 acessíveis antes do aceite e na metodologia, fora do cabeçalho de perguntas. A visão técnica usa caso fictício independente.

## Relato de experiência do titular

O titular pediu encaminhar à equipe de produto o efeito social dos limites de créditos e a necessidade de continuidade durável. Um relato separado está em `work/FEEDBACK-NEXO-CONTINUIDADE.md`, fora dos arquivos publicados. Não afirmar que foi enviado sem confirmação de um canal oficial.
