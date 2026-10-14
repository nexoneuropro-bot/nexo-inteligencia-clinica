# NEXO Inteligência Clínica

Prévia institucional em português brasileiro, construída com Astro, TypeScript, CSS e Three.js. O projeto entrega uma home navegável e onze páginas internas estáticas. A publicação no domínio definitivo depende de aprovação expressa.

## Executar localmente

Requisitos: **Node.js 22.12.0 ou superior** e **pnpm**. As versões resolvidas das dependências ficam registradas em `pnpm-lock.yaml`.

Na pasta do projeto:

```powershell
pnpm install --frozen-lockfile
Copy-Item .env.example .env
pnpm dev
```

Abra o endereço mostrado no terminal, normalmente `http://127.0.0.1:4321`. O servidor fica disponível apenas na máquina local por padrão. Caso a porta esteja ocupada, use o endereço informado pelo Astro.

Para verificar e visualizar a saída estática:

```powershell
pnpm check
pnpm build
pnpm verify
pnpm preview
```

`check` verifica os tipos e os arquivos Astro; `build` gera `dist/`; `verify` executa as verificações automatizadas do projeto; `preview` serve o resultado do build. A prévia de produção também usa o endereço indicado no terminal. Execute novamente o build depois de alterar código ou variáveis de ambiente.

## Experiência implementada

- Home com o X como elemento central, cena progressiva em Three.js, partículas e conexões; alternativa visual leve quando a cena não pode ser executada.
- Introdução curta, controles de exploração e respeito à preferência por movimento reduzido.
- Dimensões biopsicossociais interativas, perguntas editoriais e jornadas distintas para pessoas e organizações.
- Conteúdo principal e navegação disponíveis no HTML estático, com páginas reais de serviços, profissionais, editorial, contato e privacidade.
- Contatos contextualizados via WhatsApp e telefone. Nenhum envio automático de mensagens ou formulário sem integração configurada.
- Tipografia local, estilos responsivos, foco visível e metadados próprios por página.

As interações são convites à reflexão: não realizam testes psicológicos, diagnósticos ou pontuações de saúde mental. Não há analytics nesta prévia. O `sessionStorage` guarda apenas se a introdução já foi vista ou pulada na sessão; não armazena respostas ou dados clínicos. As reflexões variam aleatoriamente, sem guardar escolhas.

## Organização dos arquivos

```text
nexo/
├── public/                 # Fontes, retratos e recursos de identidade
├── references/kit/         # Kit original de referências e documentação
├── src/
│   ├── components/         # Elementos reutilizáveis
│   ├── data/               # Textos de páginas, reflexões e contatos
│   ├── layouts/            # Estrutura semântica e metadados
│   ├── pages/              # Home, rotas internas e arquivos de descoberta
│   ├── scripts/            # Cena Three.js e interações progressivas
│   └── styles/             # Sistema visual e composição responsiva
├── scripts/                # Verificações do HTML gerado
├── docs/
│   ├── FONTES-E-VALIDACOES.md
│   └── IMPLANTACAO.md
├── .env.example
├── astro.config.mjs
├── package.json
└── pnpm-lock.yaml
```

Os textos institucionais ficam em `src/data/pages.ts`; as reflexões e os contatos, em `src/data/reflections.ts`. Novos conteúdos devem passar por revisão humana antes de serem divulgados como aprovados ou assinados por profissionais.

## Rotas

`/`, `/para-voce/`, `/psicoterapia/`, `/avaliacao-neuropsicologica/`, `/integracao-psiquiatrica/`, `/para-sua-empresa/`, `/riscos-psicossociais-nr1/`, `/nossa-abordagem/`, `/profissionais/`, `/psicologia-em-pauta/`, `/contato/` e `/politica-de-privacidade/`.

## Prévia, SEO e domínio

`PUBLIC_INDEXABLE=false` é o padrão da prévia. Apenas o valor literal `true` habilita a indexação e os endereços canônicos. `PUBLIC_SITE_URL` deve conter a origem HTTPS autorizada quando houver produção. O domínio pretendido é `nexoneuro.com`; sua titularidade e disponibilidade não são presumidas.

`noindex` é uma instrução para buscadores e não restringe o acesso ao site. Uma prévia confidencial precisa de controle de acesso na hospedagem.

A implantação está descrita em [docs/IMPLANTACAO.md](docs/IMPLANTACAO.md). O destino GitHub informado é [nexoneuropro-bot/nexo-inteligencia-clinica](https://github.com/nexoneuropro-bot/nexo-inteligencia-clinica); esse endereço, por si só, não confirma conexão local nem envio de commits.

## Revisões e limites desta entrega

Os textos são rascunhos para revisão institucional. Registros, títulos, RQE e identificação dos responsáveis precisam ser conferidos antes da publicação. O kit de referências foi fornecido e está preservado em `references/kit/`; seus retratos reais foram integrados à prévia. O uso público das fotografias ainda depende de aprovação. A marca provisória, os favicons e os recursos de compartilhamento também foram integrados para avaliação local e aguardam aprovação final. Artigos aprovados ainda precisam ser fornecidos.

Também precisam de confirmação as condições de atendimento, os dados do controlador, a política definitiva de privacidade, a operação da hospedagem e os requisitos técnicos da oferta empresarial. O e-mail sugerido não é tratado como operacional.

Consulte [docs/FONTES-E-VALIDACOES.md](docs/FONTES-E-VALIDACOES.md) para as fontes consultadas e os pontos de validação. As verificações automatizadas não equivalem a auditoria clínica, jurídica, de segurança ou de acessibilidade. As metas de LCP, INP e CLS do briefing ainda exigem medição em ambiente real, especialmente em dispositivos móveis; não representam resultados já comprovados.

Próximas etapas: revisar a prévia em desktop e celular, aprovar identidade e conteúdo, concluir as validações profissionais e operacionais e só então autorizar a implantação definitiva.
