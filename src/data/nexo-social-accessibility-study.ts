/** Questionário autoral NEXO. Sem diagnóstico, pontuação psicológica ou dados identificáveis. */
export const DEFAULT_RESEARCH_PACK={
  "id": "nexo_acessibilidade_pos_pandemia",
  "name": "NEXO · Acessibilidade no pós-pandemia e seus reflexos sociais",
  "version": "2026-11-v1",
  "language": "pt-BR",
  "source": "Questionário autoral NEXO · estudo social gratuito",
  "rights": "Instrumento autoral NEXO para pesquisa social não comercial sob responsabilidade profissional",
  "audience": "Adultos de 18 anos ou mais, participação voluntária",
  "mode": "remoto",
  "instructions": "Responda com base na sua própria experiência. As perguntas A tratam de dificuldades vividas nos últimos 12 meses; as perguntas B são comparações subjetivas com o período anterior à pandemia; as C investigam como opiniões são formadas. Você pode marcar 'Prefiro não responder'. Nenhuma resposta é considerada diagnóstico, prova de causalidade ou avaliação de competência.",
  "referencePeriod": "Últimos 12 meses para A; lembrança comparativa pré-pandemia para B; hábitos gerais para C.",
  "scoringNotes": "Questionário autoral exploratório, não validado como escala psicológica. Sem pontuação individual, cortes clínicos, diagnósticos ou inferência causal. Análise descritiva por frequências, com supressão de células pequenas; cotejar com dados IBGE, TIC e demais fontes públicas em relatório separado.",
  "questions": [
    {
      "id": "A01",
      "prompt": "Nos últimos 12 meses, você teve dificuldade para marcar ou realizar consultas, exames ou outros atendimentos de saúde?",
      "help": "Considere espera, custo, distância, transporte ou canais de marcação.",
      "choices": [
        {
          "id": "nunca",
          "label": "Não tive essa dificuldade",
          "value": null
        },
        {
          "id": "as-vezes",
          "label": "Tive essa dificuldade algumas vezes",
          "value": null
        },
        {
          "id": "frequente",
          "label": "Tive essa dificuldade com frequência",
          "value": null
        },
        {
          "id": "nao-se-aplica",
          "label": "Não se aplica à minha realidade",
          "value": null
        },
        {
          "id": "prefiro-nao-responder",
          "label": "Prefiro não responder",
          "value": null
        }
      ]
    },
    {
      "id": "A02",
      "prompt": "Nos últimos 12 meses, você teve dificuldade para conseguir apoio psicológico ou de saúde mental quando precisou?",
      "help": "Se não buscou ou não precisou, marque 'Não se aplica'.",
      "choices": [
        {
          "id": "nunca",
          "label": "Não tive essa dificuldade",
          "value": null
        },
        {
          "id": "as-vezes",
          "label": "Tive essa dificuldade algumas vezes",
          "value": null
        },
        {
          "id": "frequente",
          "label": "Tive essa dificuldade com frequência",
          "value": null
        },
        {
          "id": "nao-se-aplica",
          "label": "Não se aplica à minha realidade",
          "value": null
        },
        {
          "id": "prefiro-nao-responder",
          "label": "Prefiro não responder",
          "value": null
        }
      ]
    },
    {
      "id": "A03",
      "prompt": "Nos últimos 12 meses, a falta de internet, dados móveis, aparelho ou habilidades digitais dificultou seu acesso a serviços?",
      "help": "Considere agendamentos, documentos, benefícios e informação.",
      "choices": [
        {
          "id": "nunca",
          "label": "Não tive essa dificuldade",
          "value": null
        },
        {
          "id": "as-vezes",
          "label": "Tive essa dificuldade algumas vezes",
          "value": null
        },
        {
          "id": "frequente",
          "label": "Tive essa dificuldade com frequência",
          "value": null
        },
        {
          "id": "nao-se-aplica",
          "label": "Não se aplica à minha realidade",
          "value": null
        },
        {
          "id": "prefiro-nao-responder",
          "label": "Prefiro não responder",
          "value": null
        }
      ]
    },
    {
      "id": "A04",
      "prompt": "Nos últimos 12 meses, você encontrou barreiras de acessibilidade em sites, aplicativos ou atendimento remoto?",
      "help": "Exemplos: texto difícil, ausência de recursos de leitura, dificuldades de navegação ou atendimento.",
      "choices": [
        {
          "id": "nunca",
          "label": "Não tive essa dificuldade",
          "value": null
        },
        {
          "id": "as-vezes",
          "label": "Tive essa dificuldade algumas vezes",
          "value": null
        },
        {
          "id": "frequente",
          "label": "Tive essa dificuldade com frequência",
          "value": null
        },
        {
          "id": "nao-se-aplica",
          "label": "Não se aplica à minha realidade",
          "value": null
        },
        {
          "id": "prefiro-nao-responder",
          "label": "Prefiro não responder",
          "value": null
        }
      ]
    },
    {
      "id": "A05",
      "prompt": "Nos últimos 12 meses, o custo ou a falta de transporte dificultou seu acesso a serviços, estudo, trabalho ou atividades comunitárias?",
      "help": "Responda sobre sua experiência; não é necessário informar endereço.",
      "choices": [
        {
          "id": "nunca",
          "label": "Não tive essa dificuldade",
          "value": null
        },
        {
          "id": "as-vezes",
          "label": "Tive essa dificuldade algumas vezes",
          "value": null
        },
        {
          "id": "frequente",
          "label": "Tive essa dificuldade com frequência",
          "value": null
        },
        {
          "id": "nao-se-aplica",
          "label": "Não se aplica à minha realidade",
          "value": null
        },
        {
          "id": "prefiro-nao-responder",
          "label": "Prefiro não responder",
          "value": null
        }
      ]
    },
    {
      "id": "A06",
      "prompt": "Nos últimos 12 meses, horários, filas, exigência de documentos ou falta de orientação dificultaram o acesso a serviços públicos?",
      "help": "Considere atendimentos presenciais e digitais.",
      "choices": [
        {
          "id": "nunca",
          "label": "Não tive essa dificuldade",
          "value": null
        },
        {
          "id": "as-vezes",
          "label": "Tive essa dificuldade algumas vezes",
          "value": null
        },
        {
          "id": "frequente",
          "label": "Tive essa dificuldade com frequência",
          "value": null
        },
        {
          "id": "nao-se-aplica",
          "label": "Não se aplica à minha realidade",
          "value": null
        },
        {
          "id": "prefiro-nao-responder",
          "label": "Prefiro não responder",
          "value": null
        }
      ]
    },
    {
      "id": "A07",
      "prompt": "Nos últimos 12 meses, dificuldades financeiras limitaram sua participação em atividades de educação, cultura, lazer ou convivência?",
      "help": "Não solicitamos renda nem informações bancárias.",
      "choices": [
        {
          "id": "nunca",
          "label": "Não tive essa dificuldade",
          "value": null
        },
        {
          "id": "as-vezes",
          "label": "Tive essa dificuldade algumas vezes",
          "value": null
        },
        {
          "id": "frequente",
          "label": "Tive essa dificuldade com frequência",
          "value": null
        },
        {
          "id": "nao-se-aplica",
          "label": "Não se aplica à minha realidade",
          "value": null
        },
        {
          "id": "prefiro-nao-responder",
          "label": "Prefiro não responder",
          "value": null
        }
      ]
    },
    {
      "id": "A08",
      "prompt": "Nos últimos 12 meses, você deixou de participar de atividades sociais por dificuldades de acesso, transporte, custo ou ambiente?",
      "help": "Não é uma pergunta diagnóstica sobre isolamento.",
      "choices": [
        {
          "id": "nunca",
          "label": "Não tive essa dificuldade",
          "value": null
        },
        {
          "id": "as-vezes",
          "label": "Tive essa dificuldade algumas vezes",
          "value": null
        },
        {
          "id": "frequente",
          "label": "Tive essa dificuldade com frequência",
          "value": null
        },
        {
          "id": "nao-se-aplica",
          "label": "Não se aplica à minha realidade",
          "value": null
        },
        {
          "id": "prefiro-nao-responder",
          "label": "Prefiro não responder",
          "value": null
        }
      ]
    },
    {
      "id": "B01",
      "prompt": "Comparando com o período anterior à pandemia de COVID-19, como você percebe hoje o acesso a atendimentos de saúde?",
      "help": "Se não consegue comparar, marque 'Não sei dizer'. A resposta expressa percepção, não prova causalidade.",
      "choices": [
        {
          "id": "melhorou",
          "label": "Melhorou",
          "value": null
        },
        {
          "id": "igual",
          "label": "Permaneceu parecido",
          "value": null
        },
        {
          "id": "piorou",
          "label": "Piorou",
          "value": null
        },
        {
          "id": "nao-sei",
          "label": "Não sei dizer ou não consigo comparar",
          "value": null
        },
        {
          "id": "prefiro-nao-responder",
          "label": "Prefiro não responder",
          "value": null
        }
      ]
    },
    {
      "id": "B02",
      "prompt": "Comparando com o período anterior à pandemia, como você percebe hoje o acesso a oportunidades de estudo ou trabalho?",
      "help": "Considere também a possibilidade de mudanças por motivos não relacionados à pandemia.",
      "choices": [
        {
          "id": "melhorou",
          "label": "Melhorou",
          "value": null
        },
        {
          "id": "igual",
          "label": "Permaneceu parecido",
          "value": null
        },
        {
          "id": "piorou",
          "label": "Piorou",
          "value": null
        },
        {
          "id": "nao-sei",
          "label": "Não sei dizer ou não consigo comparar",
          "value": null
        },
        {
          "id": "prefiro-nao-responder",
          "label": "Prefiro não responder",
          "value": null
        }
      ]
    },
    {
      "id": "B03",
      "prompt": "Comparando com o período anterior à pandemia, como você percebe hoje sua possibilidade de participar de atividades sociais e comunitárias?",
      "help": "A comparação é opcional e depende da sua memória e experiência.",
      "choices": [
        {
          "id": "melhorou",
          "label": "Melhorou",
          "value": null
        },
        {
          "id": "igual",
          "label": "Permaneceu parecido",
          "value": null
        },
        {
          "id": "piorou",
          "label": "Piorou",
          "value": null
        },
        {
          "id": "nao-sei",
          "label": "Não sei dizer ou não consigo comparar",
          "value": null
        },
        {
          "id": "prefiro-nao-responder",
          "label": "Prefiro não responder",
          "value": null
        }
      ]
    },
    {
      "id": "B04",
      "prompt": "Comparando com o período anterior à pandemia, como você percebe hoje a facilidade para resolver demandas usando serviços digitais?",
      "help": "Melhora ou piora percebida não demonstra, por si só, a causa da mudança.",
      "choices": [
        {
          "id": "melhorou",
          "label": "Melhorou",
          "value": null
        },
        {
          "id": "igual",
          "label": "Permaneceu parecido",
          "value": null
        },
        {
          "id": "piorou",
          "label": "Piorou",
          "value": null
        },
        {
          "id": "nao-sei",
          "label": "Não sei dizer ou não consigo comparar",
          "value": null
        },
        {
          "id": "prefiro-nao-responder",
          "label": "Prefiro não responder",
          "value": null
        }
      ]
    },
    {
      "id": "C01",
      "prompt": "Quando você afirma que um serviço melhorou ou piorou após a pandemia, em que costuma se apoiar principalmente?",
      "help": "Não existe resposta certa. A pergunta ajuda a distinguir observação, opinião e evidência externa.",
      "choices": [
        {
          "id": "fonte-oficial",
          "label": "Informações de órgãos públicos ou pesquisas verificáveis",
          "value": null
        },
        {
          "id": "experiencia-pessoal",
          "label": "Principalmente minha experiência ou de pessoas próximas",
          "value": null
        },
        {
          "id": "redes",
          "label": "Principalmente redes sociais ou aplicativos de mensagens",
          "value": null
        },
        {
          "id": "varias",
          "label": "Uma combinação dessas fontes",
          "value": null
        },
        {
          "id": "nao-sei",
          "label": "Não sei identificar a fonte",
          "value": null
        },
        {
          "id": "prefiro-nao-responder",
          "label": "Prefiro não responder",
          "value": null
        }
      ]
    },
    {
      "id": "C02",
      "prompt": "Quando recebe uma notícia sobre saúde, direitos ou serviços públicos, consegue verificar a origem ou a data antes de compartilhá-la?",
      "help": "Responda de acordo com o que costuma acontecer; não se trata de avaliação de conhecimento.",
      "choices": [
        {
          "id": "sempre",
          "label": "Quase sempre",
          "value": null
        },
        {
          "id": "as-vezes",
          "label": "Algumas vezes",
          "value": null
        },
        {
          "id": "raramente",
          "label": "Raramente ou nunca",
          "value": null
        },
        {
          "id": "nao-sei",
          "label": "Não sei dizer",
          "value": null
        },
        {
          "id": "prefiro-nao-responder",
          "label": "Prefiro não responder",
          "value": null
        }
      ]
    }
  ]
} as const;
export const DEFAULT_RESEARCH_STUDY={
  "title": "Acessibilidade no pós-pandemia e seus reflexos sociais: percepções, barreiras e evidências",
  "objective": "Descrever barreiras percebidas e vivenciadas de acesso à saúde, serviços, oportunidades, tecnologias e participação social, distinguindo experiências, comparação retrospectiva e evidências externas, sem inferir causalidade direta da pandemia.",
  "eligibility": "Participação voluntária de adultos de 18 anos ou mais, residentes no Brasil, incluindo pessoas em situação de vulnerabilidade; sem identificação nominal.",
  "consent": "Você está sendo convidado(a), de forma voluntária, para um estudo social gratuito da NEXO sobre barreiras de acessibilidade e participação no pós-pandemia. Queremos conhecer experiências e percepções sobre serviços, saúde, internet, transporte, trabalho e vida social. A participação é opcional, destinada a pessoas com 18 anos ou mais, leva aproximadamente 5 a 8 minutos e pode ser encerrada sem prejuízo de nenhum atendimento ou serviço. Você pode pular perguntas. Não pedimos nome, CPF, endereço, contato ou dados bancários. As respostas são armazenadas com criptografia para análise descritiva sob supervisão profissional por até 81 dias a partir do cadastro da versão do instrumento, podendo ser descartadas antes. Você receberá um código para solicitar a retirada da resposta ativa sem precisar se identificar. Em vez de diagnósticos, apresentaremos somente resultados agregados, protegendo grupos pequenos. O estudo não permite concluir que a pandemia causou mudanças relatadas. Para dúvidas ou solicitação de retirada, contate nexoneuropro@gmail.com. Ao prosseguir, você declara ter entendido esta finalidade específica e concorda livremente em participar. Recusar não interfere no acolhimento ou em serviços da NEXO.",
  "safetyPlan": "Questionário voluntário, sem perguntas de crise ou diagnóstico. Não há monitoramento clínico em tempo real. Quem necessitar de atendimento imediato deve procurar serviços locais, SAMU 192 e CVV 188, conforme a situação. A recusa não afeta serviços ou acolhimento."
} as const;
