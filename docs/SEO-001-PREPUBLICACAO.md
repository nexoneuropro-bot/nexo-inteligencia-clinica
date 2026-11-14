# PAC NEXO | SEO 001 — pré-publicação

**Data:** 14/11/2026  
**Situação:** proposta técnica em branch isolada, **sem aprovação para publicação**  
**Domínio pretendido informado:** `nexoneuro.com` (registro, titularidade, DNS e hospedagem ainda não confirmados)

## Objetivo
Tornar as páginas da NEXO mais compreensíveis para pessoas e mecanismos de pesquisa, priorizando **NR-1 / fatores psicossociais relacionados ao trabalho**, **avaliação neuropsicológica** e **psicoterapia breve**. Não há promessa de posição ou tráfego no Google.

## Escopo realizado nesta proposta
- Metadados da home passam a mencionar as três frentes prioritárias; a identidade e o H1 editorial permanecem.
- Rota `/riscos-psicossociais-nr1/`: título e descrição passam a identificar claramente o tema. O texto registra a vigência de 26/05/2026 e mantém cuidados com escopo e responsabilidade profissional.
- Rota `/avaliacao-neuropsicologica/`: título e descrição tornam explícitas as etapas de avaliação, integração e devolutiva.
- Nova rota `/psicoterapia-breve/`: texto explicativo e não prescritivo, sem promessa de resultados ou pacote fixo de sessões.
- Home direciona o serviço destacado de psicoterapia breve à nova página; links internos incluem a nova rota.
- `scripts/verify.mjs` passa a exigir a nova rota e a calcular a quantidade esperada do sitemap a partir da lista de rotas.
- `README.md` e documentação de implantação atualizados para 12 páginas internas.

## Fatos e limites
- O site é feito em Astro e usa saída estática.
- A configuração padrão `PUBLIC_INDEXABLE=false` deve ser mantida durante prévias.
- Não existe confirmação nesta missão de domínio registrado, empresa operando em determinada cidade, Search Console, tráfego orgânico ou desempenho Lighthouse.
- A página de psicoterapia breve é uma **proposta editorial para revisão profissional**, não confirmação automática de oferta, preço ou duração.
- Não substituir orientação profissional, nem apresentar consultoria NR-1 como certificado ou adequação legal automática.

## Validações exigidas antes de qualquer publicação
1. **Profissionais e conteúdo:** revisar nomes, credenciais, títulos, escopo e autorização das imagens; aprovar redação de cada serviço e política de privacidade.
2. **Domínio:** comprovar registro de `nexoneuro.com`, configurar HTTPS e definir versão canônica e redirecionamentos de www.
3. **Hospedagem:** Cloudflare Pages Free é candidata para o site estático; não incluir banco de dados clínicos, credenciais ou informações de pacientes nesse site.
4. **Build e testes:** executar `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm build` e `pnpm verify` com `PUBLIC_INDEXABLE=false`, verificando novas rotas, links, acessibilidade por teclado, responsive e movimento reduzido.
5. **Produção:** somente com autorização, gerar build com `PUBLIC_INDEXABLE=true` e `PUBLIC_SITE_URL=https://nexoneuro.com`; inspecionar sitemap, robots, canonical, dados estruturados e HTTPS.
6. **Mensuração:** cadastrar Search Console, enviar sitemap, validar indexação e acompanhar consultas, impressões e cliques. Avaliar Core Web Vitals em dados reais quando disponíveis.

## Fontes para revisão
- [NR-1 — Ministério do Trabalho e Emprego](https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/nr-1)
- [Google Search Central — títulos nos resultados](https://developers.google.com/search/docs/appearance/title-link)
- [Cloudflare Pages — integração Git](https://developers.cloudflare.com/pages/configuration/git-integration/)
- [Documento interno de implantação](IMPLANTACAO.md)

## Próxima decisão
Revisar o conteúdo editorial da proposta e confirmar condições reais de atendimento. **Não fazer merge, configurar Cloudflare, registrar domínio ou publicar sem autorização separada.**
