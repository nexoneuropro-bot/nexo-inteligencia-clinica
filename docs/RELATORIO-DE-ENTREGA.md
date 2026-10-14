# NEXO — primeira versão navegável

Data: 14/10/2026. Entrega para avaliação, sem implantação definitiva.

## Checklist e evidências

| Critério | Implementação e evidência | Limite da validação |
| --- | --- | --- |
| Projeto no GitHub | Código organizado em Astro, TypeScript, CSS e Three.js; remoto configurado para o repositório informado. | O resultado do envio e o commit são informados na entrega em chat. |
| Home completa | Onze seções principais, navegação compartilhada, rodapé e 12 rotas solicitadas. | Revisão visual humana pendente. |
| Abertura X | Partículas 3D, conexões, pulso, formação do X, conceitos e três caminhos; introdução de aproximadamente 3,8 s de reprodução visível. | Não houve confirmação visual do WebGL neste dispositivo. |
| Experiência interativa | Três dimensões selecionáveis, oito categorias de reflexões, botão de próxima ideia e jornada em diálogo com quatro pontos de partida. | Funcionamento revisado no código; interação real no navegador pendente. |
| Identidade e imagens | Paleta do briefing, tipografia editorial local, marca provisória do kit, fotos reais otimizadas, favicon, manifesto e cartões sociais. | Aprovação da identidade e do uso público das fotos pendente. |
| Serviços | Psicoterapia, avaliação neuropsicológica com laudo quando cabível, interface psiquiátrica opcional e consultoria organizacional. | Revisão técnica pelos profissionais antes da publicação. |
| SEO e acesso | HTML estático, títulos/descrições próprios, OG/Twitter, sitemap/robots, cabeçalhos, links reais, alternativas textuais e movimento reduzido. | A prévia tem `noindex`; sitemap vazio e canonical ausente são intencionais. Indexação somente após aprovação. |
| Build | O build Astro gera as 12 rotas e a página 404. Verificação estática de rotas, links e recursos sem falhas. | Não equivale a medição de Core Web Vitals. |
| Prévia | Servidor local para o site compilado. Desktop: `http://127.0.0.1:4321/`. Acesso por rede local depende da interface, rede e firewall. | Não é hospedagem pública. Revisar no celular e computador. |
| Relatório | Este documento, README, implantação, inventário do kit e fontes oficiais de validação. | Dados institucionais e profissionais ainda precisam de confirmação. |

## Estrutura

```text
src/
  components/         Marca e ícone de navegação
  data/               Textos das páginas e biblioteca editorial
  layouts/            HTML comum, metadados, navegação e rodapé
  pages/              Home, páginas internas, 404, sitemap e robots
  scripts/            Cena 3D e interações voluntárias
  styles/             Design system e composição responsiva
public/
  brand/              Propostas de marca fornecidas e versão com margens ajustadas
  images/             Retratos WebP reais
  fonts/              Fontes locais e licenças
references/kit/        Kit original integral, fora da pasta pública
scripts/              Execução do Astro e verificação do build
docs/                 Entrega, implantação, inventário e fontes
dist/                 Site compilado (gerado por pnpm build; ignorado no Git)
```

## Verificações realizadas

- Leitura dos 55 arquivos do kit, incluindo documentação, configuração e manifesto; inspeção das referências originais, recortes, marcas e retratos. Nenhum arquivo declarado ausente.
- Inventário: 48 de 50 hashes conferem. Dois documentos receberam complementos sobre a equipe sem atualizar seus hashes. A pasta 08 contém os quatro arquivos adicionais sem hashes no manifesto.
- TypeScript/Astro: `pnpm check`, sem erros nos arquivos da aplicação.
- `pnpm build`: geração estática concluída. Há um aviso de tamanho no módulo Three.js, que é carregado progressivamente somente na home.
- Configuração indexável também compilada separadamente em diretório de trabalho: sitemap com 12 URLs, canonicals presentes e ausência do cabeçalho noindex verificados, sem publicar nem alterar a prévia.
- `pnpm verify`: 12 rotas solicitadas e 13 HTMLs incluindo 404; títulos, descrições, idioma, H1, landmarks, destinos locais e âncoras conferidos; sem falhas.
- Revisão de marcação: sem IDs duplicados, referências ARIA quebradas ou imagens sem alternativa textual. Menu inclui alternativa sem JavaScript.
- Contraste calculado para as combinações principais e textos corrigidos: 5,32:1 a 6,77:1 nos textos pequenos examinados; 7,80:1 a 14,01:1 nas combinações de foco examinadas.
- Resposta HTTP 200 nas 12 rotas solicitadas, via servidor local; resposta 200 também no endereço da interface de rede local.

## Limitação da verificação no navegador

A política de segurança do navegador rejeitou o acesso automatizado à prévia local. Não foi tentado contorno desse bloqueio. Assim, capturas de tela, interação real, teclado, leitores de tela, reflow, zoom, WebGL e tamanhos desktop/mobile ainda precisam de revisão no navegador. A análise de código e contraste não certifica WCAG.

Não foram medidos LCP, INP ou CLS. Os limites de desempenho do briefing permanecem metas, não resultados comprovados. O módulo Three.js pesa aproximadamente 185 KB com gzip na compilação inicial; fica fora do conteúdo HTML e do JavaScript das páginas internas. O valor final pode variar com alterações da cena.

## Aprovações e dados pendentes

1. Aprovar composição visual, proposta de marca, ícones e cartões sociais. O kit tem um estudo original com N e propostas posteriores com X; ambas as famílias foram preservadas.
2. Confirmar uso público dos retratos e conferir CRP, CRM, títulos e RQE nos conselhos. Nenhum registro individual foi apresentado como verificado.
3. Aprovar textos, escopo de serviços e fluxo interdisciplinar. Psiquiatria é opcional quando indicada após acolhimento e anamnese; documentos e atribuições permanecem próprios de cada profissão.
4. Informar cidade/endereço, modalidades, horários, identificação institucional, controlador/canal de privacidade e demais dados aplicáveis. A política de privacidade é rascunho.
5. Confirmar domínio e titularidade, acesso à Cloudflare e configuração de DNS. O e-mail sugerido não é divulgado como operacional.
6. Fornecer/revisar artigos com autoria e referências. A área editorial anuncia temas em preparação, sem artigos ou aprovações fictícias.
7. Revisar desktop/mobile e desempenho no ambiente final; autorizar expressamente a implantação definitiva.

## Execução

Requisitos: Node.js 22.12 ou superior e pnpm. Usar o lockfile entregue.

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

Para verificar e abrir a versão estática:

```powershell
pnpm check
pnpm build
pnpm verify
pnpm preview
```

Para servir a prévia também à rede local, após o build:

```powershell
pnpm preview --host 0.0.0.0
```

No celular conectado à mesma rede, use o IPv4 do computador com a porta indicada. Não é necessário publicar o domínio definitivo. Redes isoladas ou firewall podem impedir o acesso; nenhuma configuração de proteção foi alterada.

Leia `IMPLANTACAO.md` antes de configurar Cloudflare Pages. Manter `PUBLIC_INDEXABLE=false` na prévia; a produção exige aprovação e `PUBLIC_INDEXABLE=true` no build autorizado.

## Compatibilidade de desenvolvimento

Astro 7.3.8 com Vite 8.3.4 neste Windows/pnpm apresentou carregamento incorreto de três módulos CommonJS. A configuração inclui um adaptador seletivo, exclusivo do modo de desenvolvimento no Windows, para carregá-los por URLs nativas. Ele usa a API experimental `Environment.fetchModule` do Vite; ao atualizar Astro/Vite, revalidar ou remover esse adaptador. O comando real de desenvolvimento e a home foram confirmados com HTTP 200 após a correção. A barra de ferramentas de desenvolvimento está desabilitada. O build estático não usa esse adaptador.

TypeScript foi fixado em 6.0.3 porque o verificador Astro instalado ainda não suporta TypeScript 7. As versões diretas e o lockfile foram fixados. O wrapper de execução desabilita a telemetria do Astro e evita gravar configuração fora do projeto.

