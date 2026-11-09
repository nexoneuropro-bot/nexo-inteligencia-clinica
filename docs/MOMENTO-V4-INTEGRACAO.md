# Conhecendo Meu Momento — anexos v4/v5 e identidade visual

Recebidos em 08/11/2026. Os oito arquivos de origem foram preservados integralmente em `nexo_codex_kit/v4/`; os HTML são referências visuais e de fluxo, com dados fictícios. Não são backend nem autorização independente para ampliar coleta clínica. O teste Python que acompanha o pacote foi lido e executado: validação estática e somatórios aprovados.

## Decisão de integração

O comando anexo pede inicialmente P0 em DEMO_ONLY. As novidades dessa especificação são integradas às rotas públicas de demonstração já existentes, sem criar outro site e sem substituir o fluxo clínico real testado. O backend, o D1, as chaves, os convites e a autenticação já existem e devem ser preservados. O estado da ativação clínica está em `MOMENTO-BATERIA-FONTES-E-ATIVACAO.md`.

Antes da publicação foi encontrada uma versão remota mais recente, `0daa387fec298bdca52f4c84fa678cb53f37cc22`, já com complementos clínicos, acolhimento narrativo, síntese profissional integrada, ditado local sob demanda e novos testes. Esses 23 arquivos foram incorporados com conferência de hash e cópias de segurança, preservando as melhorias existentes. A correção visual e o piloto são aplicados sobre essa versão. O consentimento clínico atual é v3; não restaurar o v1 dos registros históricos. O ditado só pode ser oferecido quando o navegador confirma processamento local, sob ação e aceite próprios.

- `/conhecendo-meu-momento/demonstracao/`: experiência demonstrativa, somente memória, sem chamadas de envio, armazenamento de respostas ou resultados ao participante.
- `/conhecendo-meu-momento/visao-tecnica/`: caso sintético fixo, sem leitura das escolhas do visitante; serve para revisar a organização técnica.
- `/conhecendo-meu-momento/responder/` e `/nexo-profissional/`: fluxo clínico já validado, com consentimento, convite e acesso protegido. Não converter estes endereços para demonstração nem desativar a infraestrutura ao ler os anexos históricos.

A redação e a pontuação dos instrumentos reutilizam os módulos existentes e as fontes verificadas. Complementos de sono e apetite são perguntas autorais opcionais; não mudam os itens, a ordem ou as somas. Pistas de entrevista devem indicar origem, lacunas e explicações alternativas, sem classificação diagnóstica, reprodução de critérios DSM ou catálogo de testes alegadamente verificado.

Os eventos de pausa e as demais semânticas do P0 ficam somente em memória. Não habilitar captura automática de respostas parciais, metadados de interrupção ou supostos motivos de abandono no servidor por esta implementação. A versão clínica incorporada permite compartilhamento parcial explícito nas condições de seu próprio consentimento; isso é separado de monitorar silenciosamente o percurso. Qualquer coleta automática futura exige finalidade e consentimento específicos, armazenamento cifrado, retomada e expiração verificadas, controle de acesso e testes dessa nova finalidade.

## Cabeçalho e rodapé

A falha vinha de uma dependência de estilo: `MomentoLayout.astro` usava o cabeçalho e o rodapé compartilhados, mas não importava `experience.css`. A importação foi corrigida no layout comum, cobrindo a apresentação, a demonstração, a visão técnica, a privacidade, o formulário por convite e a área profissional. Não foi criado outro rodapé, alterado o layout global ou adicionado Three.js às páginas clínicas.

Conferência visual local em desktop e celular de 390 pixels: fundo azul profundo, marca, tipografia e disposição dos links recuperados; sem transbordamento horizontal. A navegação e os registros profissionais foram preservados.

## Verificação de 09/11/2026

- 78 testes automatizados aprovados após incorporar a versão remota atual, incluindo o fluxo clínico, síntese profissional, ditado local, pontuação, novos complementos, semântica de ausências, pausa/retomada e isolamento do painel sintético. O workflow existente foi ampliado para incluir todos os testes `test-momento-*.mjs` e as alterações do piloto.
- Astro check: 127 arquivos, zero erros; dois imports/helpers sem uso encontrados na versão remota foram removidos sem alterar comportamento.
- Build de avaliação: 29 páginas; verificadores institucional e editorial aprovados, seis artigos de revisão preservados.
- Build local com configuração de produção: 23 páginas; 15 rotas institucionais indexáveis, canonical/robots/sitemap e navegação aprovados. Os seis artigos ainda sujeitos à aprovação editorial não foram promovidos automaticamente ao modo público.
- Navegador: fluxo demonstrativo percorrido com escolhas fictícias; sono e apetite apresentaram complementos condicionais; pausa exigiu nova conferência de privacidade; encerramento não mostrou pontuação ou interpretação. Exportação real do painel baixada e conferida: somente o caso fixo 13/7, com revisão pendente, sem incorporar a seleção local de revisão.

A prévia permanece com noindex. A preparação técnica não garante posição nos buscadores; indexação do domínio definitivo, Search Console e avaliação de métricas reais dependem da publicação autorizada. O build mantém um aviso preexistente de bundle maior que 500 kB na experiência 3D institucional; não foi carregado WebGL nos formulários privados nem houve promessa de Core Web Vitals medidos.

### Registro de continuidade

Este documento é um registro de integração dos anexos ao sistema existente. Não autoriza pesquisa, envio clínico por e-mail, diagnóstico automatizado, serviços pagos ou mudança do domínio definitivo. Os anexos originais permanecem preservados para comparação; não sobrescrever os contratos de produção com os protótipos HTML.
