# NEXO · Piloto seguro de acolhimento e banco NR-1
Registro de alterações: 12/11/2026. Branch de validação: `feat/nexo-piloto-seguro-20261112`, originada de `feat/experiencia-imersiva`.

## O que foi adicionado nesta etapa

1. **Relatório reflexivo de respostas salvas**: no painel profissional autenticado, seção "Gerar síntese reflexiva de um arquivo JSON". Aceita a exportação JSON `{record, metadata}` do próprio painel ou um objeto de respostas no mesmo esquema. Valida extensão, limita a 512 KB e recalcula PHQ-9 e GAD-7 a partir de respostas 0–3 (ausências continuam ausentes). Executa `appendIntegratedProfessionalReport`, o mesmo relatório de entrevista, HDs investigativas, limites e recomendações sob revisão humana. Não envia o arquivo a APIs, não cria registro e não salva no D1. Há impressão local em PDF e limpeza na saída do painel.
2. **Emergência acessível**: componente de apoio em todas as páginas do percurso `MomentoLayout`. Fotografia ilustrativa com fade, texto contrastante, números clicáveis e orientação para urgência médica (SAMU 192), apoio emocional (CVV 188), segurança (190) e resgate (193). Não apresenta a NEXO como plantão ou serviço de emergência e funciona sem JavaScript.
3. **Fotografia com fade**: ajuste localizado dos retratos de sessões humanas e faixa institucional para reduzir competição com os textos, sem substituir pessoas/imagens originais.
4. **Banco NR-1 piloto**: rota `/nr1-questionario/` com 16 perguntas autorais em oito dimensões sobre organização e condições de trabalho. As respostas ficam apenas em memória da aba, com resumo descritivo e exportação local opcional. Sem identificação, cadastro, envio, score, classificação ou laudo. A rota de teste está fora de indexação e ligada ao percurso institucional e ao painel.
5. **Reutilização do acervo existente**: PHQ-9/GAD-7 e a biblioteca de instrumentos, estudo social, migrações e dados anteriores não foram alterados/destruídos.

## Limitações relevantes antes de paciente real

Esta mudança no GitHub **não comprova** que o site publicado contém a nova versão, nem que o banco D1, migrações, passkeys, chaves de criptografia, notificações e flags assistenciais estão ativos. O estado de Cloudflare Pages precisa de conferência pelo administrador e os logs não devem conter respostas clínicas.

A importação de JSON permite uma **síntese local para revisão profissional**. Não recupera respostas de um banco remoto automaticamente, não importa um PDF/imagem e não cria vínculo entre arquivo importado e prontuário. Uma exportação salva precisa ser mantida segundo LGPD e política clínica. Nenhum dado real deve ser colocado em ferramenta de testes ou repositório público.

A NR-1 exige avaliação das condições reais e gestão dos fatores de risco psicossociais relacionados ao trabalho, integrada ao GRO/PGR e à NR-17. Um questionário sozinho não comprova conformidade, não substitui AEP ou AET e não deve ser usado para decisões individuais. No piloto não se coletam respostas identificáveis de trabalhadores.

## Roteiro de aceite do piloto

- Executar `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm build`, `pnpm verify` e `node --experimental-strip-types --experimental-sqlite --test scripts/test-momento-*.mjs` na branch de validação. Corrigir falhas antes da integração.
- Conferir que a branch correta foi publicada no Cloudflare Pages, com `PUBLIC_INDEXABLE=false` e cabeçalhos de segurança, proteção contra acesso não autorizado e sem dados de pacientes em ambiente de demonstração.
- Confirmar migrações `0001`, `0002`, `0003` correspondentes ao código, backup, criptografia, autenticação por passkey, CSRF, consentimento e retenção; documentar configurações de ativação sem expor segredos.
- Executar teste completo **com personagem sintético**: profissional cria convite, pessoa acessa, consente, responde (inclusive PHQ-9 item 9 positivo em cenário controlado), pula, pausa, revisa, envia, recebe identificador, profissional autentica, abre síntese, revisa HDs, registra devolutiva, exporta JSON, reimporta, compara relatórios, imprime PDF, limpa dados, revoga e exclui; verificar logs, avisos e expiração.
- Conferir dispositivo móvel, teclado, leitor de tela, redução de movimento e contato de emergência visível em todas as etapas. Não usar imagem como única fonte do número.
- Só autorizar um **paciente real** após aceite clínico da redação, segurança do fluxo de risco, base legal/consentimento, obrigações de tratamento de dados, confirmação operacional do servidor e contingência presencial. Não utilizar o site como atendimento de crise.
- Para a NR-1, testar apenas com respostas fictícias e revisar perguntas com equipe de SST e trabalhadores antes de qualquer coleta organizacional.

## Fontes
- NR-1, MTE: https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/nr-1
- Manual GRO/PGR, MTE: https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/manuais-e-publicacoes/2026/manual_gro_pgr_da_nr_1.pdf/view
- CVV: https://cvv.org.br/ligue-188-3/
- SAMU: https://www.gov.br/saude/pt-br/composicao/saes/samu-192/samu-192
