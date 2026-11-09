# NEXO · Estudo social padrão
## Acessibilidade no pós-pandemia e seus reflexos sociais: percepções, barreiras e evidências
**Versão:** 2026-11-v1 · **Finalidade:** social, gratuita, sem fins lucrativos · **Responsável:** profissional habilitado e autenticado na NEXO.

### Pergunta de pesquisa
Quais barreiras de acesso a serviços, tecnologias, oportunidades e participação social são relatadas por pessoas adultas convidadas ao estudo, e como suas percepções retrospectivas se diferenciam de evidências observáveis?

### Desenho e variáveis
Estudo exploratório, transversal, por conveniência, com 14 perguntas autorais de múltipla escolha, sem pontuação diagnóstica:

- **A01–A08:** experiência autorrelatada de dificuldades nos últimos 12 meses (atendimento de saúde, apoio psicológico, inclusão digital, acessibilidade remota, mobilidade, serviços públicos, participação econômica e convivência).
- **B01–B04:** comparação *subjetiva* com o período anterior à pandemia, com opção explícita de não saber comparar.
- **C01–C02:** fonte principal de opiniões e comportamento autorrelatado de verificação de informações.

**Importante:** experiência autorrelatada é informação válida sobre vivência, mas **não é, por si só, evidência independente** de prevalência populacional ou causalidade. As respostas dos blocos B e C expressam percepções, não prova de impacto causal da COVID-19. Não se utiliza a palavra "pós-pandemia" para inferir que cada dificuldade começou na pandemia.

### Inclusão, liberdade de escolha e vulnerabilidade
Adultos com 18 anos ou mais, residentes no Brasil. Participação gratuita e voluntária. Não vincular convite à manutenção de atendimento ou recebimento de benefício. A pessoa pode pular itens, recusar, encerrar e usar o código individual para retirada de sua resposta. Nenhum dado nominal, endereço, CPF, telefone, áudio ou dado clínico do atendimento é transferido. Não há contatos automáticos com pacientes. A indicação após HDs no painel é apenas uma *pergunta contextual* diante de impacto funcional e **não estabelece elegibilidade nem exclusão de outras pessoas**.

### Aplicação supervisionada
Profissional autenticado no painel cria o estudo-padrão após indicar o enquadramento ético, fundamentar e confirmar responsabilidade. Compartilha link do estudo separadamente do acolhimento. A pessoa visualiza objetivo, finalidade, direito de recusa, contato e consentimento específico, antes de perguntas. Versão do instrumento e do consentimento fica registrada com a resposta. Os itens não têm escore clínico nem devolutiva diagnóstica. O link é token de estudo público, não convite pessoal.

### Informação, privacidade e retenção
Cloudflare Pages + D1 com criptografia AES-GCM e controle profissional por passkey. A participação não entra no prontuário. O sistema permite apenas acesso aos resultados **agregados**: sem tabela para menos de 10 participantes e distribuição suprimida quando houver contagem positiva entre 1 e 4 numa categoria. As respostas individuais não aparecem na interface do pesquisador. Retenção limitada pela data de expiração do pack, com máximo técnico de 81 dias; retirada antecipada por código individual. Depois, revisão da política de backup. Criar novo instrumento/estudo para nova coleta, não prolongar silenciosamente o prazo.

### Regras de interpretação
1. Mostrar amostra efetiva `n`, período de campo e percentual de não resposta. Não publicar célula individual, mesmo com amostra pequena.
2. Não tratar amostragem voluntária na NEXO como representativa da população brasileira.
3. Não interpretar diferença entre relatos e estatísticas nacionais como contradição direta: instrumentos, populações e métodos diferem.
4. Não atribuir diferenças à pandemia sem desenho apropriado e evidência independente.
5. Identificar as limitações de lembrança retrospectiva, seleção voluntária, acesso digital necessário para responder, ausência de ponderação amostral e sub-representação de pessoas desconectadas.
6. Triangular, quando pertinente, com indicadores oficiais **comparáveis e atualizados**, claramente identificando ano, faixa etária e método.
7. Não criar HDs ou diagnósticos a partir das respostas sociais; hipóteses clínicas não são dados desta pesquisa.

### Fontes públicas para cotejo (não copiar itens de terceiros)
- **Cetic.br / CGI.br. TIC Domicílios 2025:** indicadores de acesso, dispositivos, habilidades digitais e uso de serviços. https://cetic.br/pt/pesquisa/domicilios/indicadores/
- **Cetic.br / CGI.br. TIC Domicílios 2025:** publicação de resultados e método amostral. https://cetic.br/pt/pesquisa/domicilios/publicacoes/
- **IBGE. PNAD Contínua:** indicadores de acesso à internet, educação e participação no mercado de trabalho. https://www.ibge.gov.br/estatisticas/
- **Resolução CNS nº 510/2016:** apreciação ética e hipóteses de não registro/apreciação aplicáveis ao método concreto. https://conselho.saude.gov.br/resolucoes/2016/Reso510.pdf
- **LGPD nº 13.709/2018:** tratamento de dados pessoais, inclusive quando a coleta social não é vinculada a atendimento. https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm

### Operação no site
**Página profissional:** `/nexo-profissional/`, em "NEXO · Pesquisa social gratuita". **Página de resposta:** `/pesquisa-social/responder/` (link de estudo com token em fragmento). **Retirada:** `/pesquisa-social/retirar/`.

O estudo só fica operacional se a migração `migrations/0003_momento_research.sql` estiver aplicada no D1 e `NEXO_RESEARCH_ENABLED=true` estiver configurado pelo responsável após validação. As permissões já existentes dos instrumentos não precisam ser solicitadas novamente, mas versões remotas e direitos de reproduzir instrumentos externos não devem ser presumidos. O questionário padrão é **autoral** e por isso não depende de licença de escala alheia.

**Estado técnico:** código preparado para revisão e publicação pela branch clínica. Não confundir teste sintético/compilação com implantação da migração, habilitação de produção ou coleta efetiva.
