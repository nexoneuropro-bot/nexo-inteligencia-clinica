# NEXO · Migração completa das escalas do Site temporário

**Origem declarada pelo responsável:** `https://nexo-acolhimento.azureplum16.chatgpt.site/painel`

**Situação:** link não acessível a esta integração na sessão de 09/11/2026. O catálogo real **não foi recuperado**. Não afirmar que determinada escala existe nessa origem. A biblioteca NEXO já aceita metadados locais até 70 entradas, mas a aplicação e o retorno de novas escalas ainda precisam de conteúdo, direitos, revisão clínica, implementação no backend e testes.

## Ação única no projeto original, sem publicar nada

Abra o Site original por **ChatGPT → Sites → selecione o Site → Editar**, ou em **Work/Codex** com acesso ao projeto de origem, e envie exatamente esta instrução:

> Quero migrar com segurança TODO o acervo de escalas e instrumentos deste projeto para o NEXO Inteligência Clínica, cujo backend clínico está hospedado separadamente. INSPECIONE SOMENTE o código e as tabelas de DEFINIÇÕES de instrumentos, nunca os registros de pacientes. NÃO faça deploy, não crie link público, não execute a aplicação clínica e não consulte/cop ie respostas de participantes. Gere arquivos para download privado:
>
> 1. `nexo-escalas-inventario.json`: enumere **todos** os instrumentos efetivamente existentes, sem inventar, com identificador, título, sigla, construto, autores, referência, idioma, versão, faixa etária/público, duração estimada, quantidade de itens, modalidade (presencial/remoto/ambos/desconhecida), tipo (rastreio, entrevista, diário, teste), direitos/licença, evidência e informação de aplicabilidade. Não marque SATEPSI favorável sem confirmação documental atualizada. Inclua inclusive escalas incompletas, inativas ou ainda experimentais com seu estado real.
> 2. `nexo-escalas-definicoes-privadas.json`: apenas para instrumentos cujos itens possam ser legitimamente usados/migrados. Preserve integralmente texto português autorizado, alternativas, saltos, período de referência, reversões, tratamento de não resposta, cálculo, pontuação, pontos de corte e interpretação original, distinção entre escore e impacto funcional, fontes e limitações. Caso falte direito para distribuir itens, informe a necessidade de licença, sem reproduzir o texto.
> 3. `nexo-escalas-mapa-tecnico.md`: mostre os arquivos e funções do código que implementam renderização, pontuação, armazenamento, convites, autorização e exportação de resultados de cada instrumento; identifique as funcionalidades inexistentes.
> 4. `nexo-catalogo-metadados-v1.json`: converta os instrumentos para o formato do NEXO abaixo; escolha somente domínios reconhecidos e use `nao-informado` quando a modalidade não puder ser confirmada. Este catálogo não contém perguntas nem dados de pacientes.
>
> Use EXCLUSIVAMENTE dados do projeto relativos à DEFINIÇÃO das escalas. Não exporte nomes, pseudônimos, e-mails, telefone, IP, IDs de participantes, códigos de convites, prontuários, resultados, áudios, logs, respostas individuais, cookies, credenciais, segredos ou tokens. Não gere exemplos de registros clínicos. Remova identificadores pessoais inadvertidos e indique qualquer parte do código que misture definições com dados de participantes. Se não puder exportar os arquivos, explique o bloqueio e produza um inventário técnico sem dados sensíveis.
>
> Não altere a interface, as tabelas nem o banco e NÃO publique uma nova versão.

Modelo de `nexo-catalogo-metadados-v1.json`:
```json
{
  "schema": "nexo-catalogo-metadados-v1",
  "instruments": [
    {
      "id": "id_real_do_instrumento",
      "name": "Nome exato do instrumento",
      "domains": ["humor"],
      "modality": "nao-informado",
      "version": "versão declarada",
      "source": "fonte original",
      "rights": "situação de direitos"
    }
  ]
}
```

Valores permitidos em `domains`: `humor`, `ansiedade`, `sono`, `funcionamento`, `autocritica`, `atencao`, `vinculos`, `alimentacao`, `apoio-social`. São categorias **operacionais para seleção preliminar**, não propriedades psicométricas validadas. Para outros construtos, ampliar o contrato do catálogo com versionamento e validação antes de importar.

## Regras de migração NEXO, após receber os arquivos

1. Conferir o inventário completo contra o código-fonte e os registros de DEFINIÇÃO do projeto, sem consultar participantes.
2. Distinguir **instrumento verdadeiro** de formulário educativo ou autoral; não rotular como teste psicológico validado sem evidência.
3. Confirmar licença, titularidade, SATEPSI (quando aplicável), público, idioma, validade das normas, direitos de reprodução e modalidade remota. Bloquear uso clínico quando a situação estiver pendente.
4. Implementar cada instrumento habilitado no **backend clínico próprio do NEXO**, com versionamento, validação estrita e pontuação determinística. Não enviar dados clínicos ou receber formulários em ChatGPT Sites.
5. Permitir ao profissional escolher:
   - **Durante a sessão**, com explicações e apoio presencial;
   - **Entre encontros**, com convite individual consentido, expiração, acesso restrito e privacidade;
   - **Não aplicar agora**, sem penalização ou interpretação.
6. Participante escolhe alternativas, texto (quando o instrumento permite), leitura acessível e ditado local somente onde apropriado; pode indicar preferir conversar depois nas perguntas autorais. Respeitar regras oficiais dos testes padronizados: não adicionar opções ou alterar enunciados e escores sem fundamento metodológico.
7. Guardar versão do instrumento, modalidade, horário, conclusão/pausa/recusa, respostas, resultado e revisão humana no registro clínico seguro. Não enviar detalhes por e-mail. **Nenhum envio automático é autorizado por um escore ou HD.**
8. Segurança: conteúdo de morte/autolesão positivo ou ausente no rastreio exige esclarecimento humano conforme protocolo; não programar instrumento eletivo como substituto de avaliação de segurança. O portal não oferece vigilância 24h.
9. Beta: preservar autonomia de horários (inclusive à noite), opção de pausas/retomada e ausência de pressão temporal artificial. Duração estimada deve ser informada, mas não funcionar como prazo para desempenho. Evitar sensação de prova e manter linguagem acolhedora.
10. Feedback qualitativo da experiência deve ser **opcional, minimizado e separado da resposta clínica**. Um relato isolado de acolhimento, descanso ou melhor sono representa percepção subjetiva, não demonstra eficácia clínica nem causalidade.

## Critérios de aceite

- Todos os instrumentos da origem estão inventariados, inclusive bloqueados e incompletos.
- Nenhum instrumento clínico é disponibilizado sem revisão e direitos aplicáveis.
- Recomendação explicável com dados de origem, hipótese exploratória, momento sugerido e limites.
- Convites separados por instrumento, com consentimento, revogação, prazo e aplicação apenas na modalidade autorizada.
- Resultados chegam com fidelidade ao painel autenticado; paciente pode continuar sem aceitar novos instrumentos.
- Os testes automatizados usam exclusivamente situações sintéticas.
- A experiência permanece acessível, acolhedora, responsiva e tranquila para usuários noturnos.
