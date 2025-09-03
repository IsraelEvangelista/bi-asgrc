# Ficha de Acompanhamento de Indicador de Risco  
## Aba 1 — Instruções de Preenchimento

### 1) Escopo da aba
Orientar o preenchimento da ficha, padronizando campos, formatos e regras para que análises e agentes de IA processem os dados com consistência.

### 2) Padrões de dados (para humanos e agentes IA)
- Convenção de nomes: `snake_case` (sem acentos).
- Tipos: `string | integer | decimal | percent | date | datetime | boolean | enum | reference | computed | group_info`.
- Datas: `YYYY-MM-DD`. Horários: `HH:MM:SS`.
- Percentuais: decimais (ex.: 0.075 = 7,5%).
- Listas: separar por `;` (ponto e vírgula).
- Enum: usar exatamente os rótulos descritos.
- Cálculos: declarar em pseudocódigo curto, determinístico.

---

## Cabeçalho da Aba

**Objetivo da Ficha de Risco**  
Fornecer uma descrição detalhada do evento de risco, acompanhar a evolução das ações mitigatórias e dos indicadores de desempenho e registrar as lições aprendidas e as alterações e atualizações pertinentes.

**Observação**  
As ações mitigatórias sugeridas e os indicadores propostos devem ser específicos, mensuráveis e atingíveis, visando a redução da probabilidade e do impacto do risco e a avaliação da eficácia das medidas implementadas.

**Metadados**  
- **versao**: _preencher_  
- **data_versao**: _YYYY-MM-DD_  
- **responsavel**: _nome/cargo/setor_

---

## Parte 1 — Informações do Evento de Risco

### 1.1 Visão geral
Campos e orientações para caracterizar o evento, relacioná-lo à estratégia/processos e registrar avaliação inerente, residual e resposta.

### 1.2 Grupos de campos
- **Identificação e contexto**  
  `evento_de_risco`, `responsavel_pelo_risco`, `classificacao_do_risco`
- **Vínculos e referências**  
  `objetivos_estrategicos_relacionados`, `natureza_do_risco`, `categoria_subcategoria`, `macroprocesso_relacionado`, `processo_relacionado`
- **Impactos organizacionais**  
  `impacta_a_imagem`, `areas_impactadas`, `entregas_impactadas`, `valores_impactados`
- **Avaliação de risco — Inerente**  
  `impacto_inerente`, `probabilidade_inerente`
- **Avaliação de risco — Residual**  
  `impacto_residual`, `probabilidade_residual`, `criticidade`
- **Resposta ao risco e relações**  
  `resposta_ao_evento_de_risco`, `eventos_de_risco_relacionados`
- **Fatores e consequências**  
  `principais_fatores_de_risco`, `principais_consequencias`
- **Mitigação e indicadores**  
  `acoes_mitigatorias`, `indicadores_de_risco`, `fatores_de_risco_mitigados`, `mitiga_i_ou_p`

### 1.3 Campos detalhados (descrições curtas)
- **evento_de_risco** (`string`) — Nome do evento conforme Portfólio de Riscos.  
- **responsavel_pelo_risco** (`string`) — Cargo e setor responsáveis por acompanhamento/monitoramento/comunicação.  
- **classificacao_do_risco** (`enum`) — `Interno` | `Externo`.  
- **objetivos_estrategicos_relacionados** (`reference`) — Objetivos do Planejamento Estratégico (lista).  
- **natureza_do_risco** (`reference`) — Natureza conforme Dicionário de Riscos.  
- **categoria_subcategoria** (`reference`) — Categoria/Subcategoria conforme Dicionário de Riscos.  
- **macroprocesso_relacionado** (`reference`) — Macroprocesso(is) associado(s) (lista).  
- **processo_relacionado** (`reference`) — Processo(s) associado(s) (lista).  
- **impacta_a_imagem** (`boolean`) — Indicar se há impacto reputacional.  
- **areas_impactadas** (`string`) — Áreas impactadas (lista).  
- **entregas_impactadas** (`string`) — Entregas impactadas (lista).  
- **valores_impactados** (`string`) — Valores impactados (ex.: Receita, Multas, Opex) (lista).  
- **impacto_inerente** (`enum[1..5]`) — 1 Muito Baixo · 2 Baixo · 3 Moderado · 4 Alto · 5 Muito Alto.  
- **probabilidade_inerente** (`enum[1..5]`) — 1 Muito Baixa · 2 Baixa · 3 Moderada · 4 Alta · 5 Muito Alta.  
- **impacto_residual** (`enum[1..5]`) — Após mitigação.  
- **probabilidade_residual** (`enum[1..5]`) — Após mitigação.  
- **criticidade** (`computed`) — `matriz_risco(impacto, probabilidade)` conforme política (5x5).  
- **resposta_ao_evento_de_risco** (`enum`) — `Evitar/Eliminar` | `Mitigar/Minimizar` | `Compartilhar` | `Aceitar`.  
- **eventos_de_risco_relacionados** (`reference`) — Outros eventos do portfólio (lista).  
- **principais_fatores_de_risco** (`string`) — Causas/fatores que podem materializar o risco (lista).  
- **principais_consequencias** (`string`) — Efeitos da materialização (lista).  
- **acoes_mitigatorias** (`string`) — Formato sugerido: `acao | responsavel | prazo` (lista).  
- **indicadores_de_risco** (`string`) — `indicador | formula | meta | frequencia` (lista).  
- **fatores_de_risco_mitigados** (`integer[]`) — Números dos fatores mitigados (da lista anterior).  
- **mitiga_i_ou_p** (`enum`) — `I` (Impacto) | `P` (Probabilidade) | `I e P`.

### 1.4 Bloco JSON — Parte 1 (machine-readable)
```json
{
  "parte": "Informacoes do Evento de Risco",
  "campos": [
    { "nome": "evento_de_risco", "tipo": "string", "obrigatorio": false, "observacoes": "Conforme Portfólio de Riscos" },
    { "nome": "responsavel_pelo_risco", "tipo": "string", "obrigatorio": false },
    { "nome": "classificacao_do_risco", "tipo": "enum", "enum_valores": ["Interno", "Externo"] },

    { "nome": "objetivos_estrategicos_relacionados", "tipo": "reference", "referencia": "planejamento_estrategico.objetivos", "lista": true },
    { "nome": "natureza_do_risco", "tipo": "reference", "referencia": "dicionario_de_riscos.naturezas" },
    { "nome": "categoria_subcategoria", "tipo": "reference", "referencia": "dicionario_de_riscos.categorias_subcategorias" },
    { "nome": "macroprocesso_relacionado", "tipo": "reference", "referencia": "cadeia_de_valor.macroprocessos", "lista": true },
    { "nome": "processo_relacionado", "tipo": "reference", "referencia": "cadeia_de_valor.processos", "lista": true },

    { "nome": "impacta_a_imagem", "tipo": "boolean" },
    { "nome": "areas_impactadas", "tipo": "string", "lista": true },
    { "nome": "entregas_impactadas", "tipo": "string", "lista": true },
    { "nome": "valores_impactados", "tipo": "string", "lista": true },

    { "grupo": "avaliacao_inerente", "tipo": "group_info", "descricao": "Antes de mitigar" },
    { "nome": "impacto_inerente", "tipo": "enum", "enum_valores": [1,2,3,4,5] },
    { "nome": "probabilidade_inerente", "tipo": "enum", "enum_valores": [1,2,3,4,5] },

    { "grupo": "avaliacao_residual", "tipo": "group_info", "descricao": "Após mitigar" },
    { "nome": "impacto_residual", "tipo": "enum", "enum_valores": [1,2,3,4,5] },
    { "nome": "probabilidade_residual", "tipo": "enum", "enum_valores": [1,2,3,4,5] },

    { "nome": "criticidade", "tipo": "computed", "regra_calculo": "matriz_risco(impacto, probabilidade)" },

    { "nome": "resposta_ao_evento_de_risco", "tipo": "enum", "enum_valores": ["Evitar/Eliminar", "Mitigar/Minimizar", "Compartilhar", "Aceitar"] },
    { "nome": "eventos_de_risco_relacionados", "tipo": "reference", "referencia": "portfolio_de_riscos.eventos", "lista": true },

    { "nome": "principais_fatores_de_risco", "tipo": "string", "lista": true },
    { "nome": "principais_consequencias", "tipo": "string", "lista": true },

    { "nome": "acoes_mitigatorias", "tipo": "string", "lista": true, "formato_sugerido": "acao | responsavel | prazo" },
    { "nome": "indicadores_de_risco", "tipo": "string", "lista": true, "formato_sugerido": "indicador | formula | meta | frequencia" },
    { "nome": "fatores_de_risco_mitigados", "tipo": "integer[]", "lista": true },
    { "nome": "mitiga_i_ou_p", "tipo": "enum", "enum_valores": ["I", "P", "I e P"] }
  ]
}
```

---

## Parte 2 — Recomendações de Ações Mitigatórias

### 2.1 Visão geral
Esta parte registra o **plano de ação mitigatória**, seu **prazo base (linha de base)**, eventuais **reprogramações**, **status de execução**, **evidências** e os **impactos** decorrentes de atrasos ou alterações.

> Regra de baseline: **`prazo_implementacao` é a linha de base e não deve ser alterado**. Reprogramações devem usar `novo_prazo`, sempre acompanhadas de justificativa, data, responsável, diferença para a linha de base e impacto associado.

---

### 2.2 Grupos de campos
- **Planejamento da ação**  
  `acoes_mitigatorias`, `prazo_implementacao`
- **Reprogramação de prazo (quando houver)**  
  `novo_prazo`, `justificativa_observacao`, `data_da_alteracao`, `responsavel_alteracao`, `prazo_execucao_relacao_linha_de_base`, `impacto_da_alteracao`
- **Status e execução**  
  `situacao`, `impacto_do_atraso_ou_nao_implementacao`, `percentual_implementado`
- **Evidências**  
  `descricao_da_evidencia`  

---

### 2.3 Campos detalhados
- **acoes_mitigatorias** (`string`, lista) — Descrever as ações mitigatórias sugeridas e **aprovadas pelo Diretor da área**.  
  _Formato sugerido:_ `acao | responsavel | prazo_previsto` (repetir por item).

- **prazo_implementacao** (`date`, **linha de base**) — Data em que a(s) ação(ões) será(ão) implementada(s).  
  _Observação:_ **não alterar** após definido; use `novo_prazo` para reprogramações.

- **novo_prazo** (`date`, opcional) — Novo prazo quando houver reprogramação.  
  _Observação:_ ao preencher, **obrigatoriamente** informar `justificativa_observacao`, `data_da_alteracao`, `responsavel_alteracao`, `prazo_execucao_relacao_linha_de_base` e `impacto_da_alteracao`.

- **situacao** (`enum`) — Estado atual da ação:  
  `Implementada` | `Em implementação` | `Não implementada`.  
  _Regras de consistência:_  
  - `Implementada` ⇒ `percentual_implementado = 1.0` e **exigir** `descricao_da_evidencia`.  
  - `Em implementação` ⇒ `0 < percentual_implementado < 1.0`.  
  - `Não implementada` ⇒ `percentual_implementado = 0`.

- **justificativa_observacao** (`string`) — Justificativa do atraso ou da não implementação e observações relevantes à execução.

- **impacto_do_atraso_ou_nao_implementacao** (`string`) — Descrever o impacto para a Companhia caso a ação esteja atrasada ou não seja implementada.

- **percentual_implementado** (`percent`) — Percentual de conclusão da ação.  
  _Padrão:_ decimais entre `0.0` e `1.0` (ex.: `0.75` = 75%). Se a planilha usar `%` entre `0` e `100`, normalizar para `0–1` nos cálculos.

- **descricao_da_evidencia** (`string`) — Após a conclusão, descrever **detalhadamente a evidência** e **onde pode ser encontrada**.

- **alteracao_realizada** (`string`) — Descrever detalhadamente a alteração efetivada (ex.: mudança de prazo, escopo, sequência de tarefas).

- **data_da_alteracao** (`date`) — Data em que a alteração foi registrada.

- **responsavel_alteracao** (`string`) — Responsável pela alteração.

- **prazo_execucao_relacao_linha_de_base** (`integer`, unidade: **dias**) — Diferença entre `novo_prazo` e `prazo_implementacao`.  
  _Cálculo sugerido:_ `date_diff(novo_prazo, prazo_implementacao, dias)` (positivo = atraso; negativo = adiantamento).

- **impacto_da_alteracao** (`string`) — Descrever detalhadamente o impacto da alteração realizada para a Companhia.

---

### 2.4 Regras de validação e dependências (resumo)
1. **Baseline imutável:** após definido, `prazo_implementacao` não pode ser editado.  
2. **Se `novo_prazo` for preenchido:** exigir `justificativa_observacao`, `data_da_alteracao`, `responsavel_alteracao`, `prazo_execucao_relacao_linha_de_base` e `impacto_da_alteracao`.  
3. **Coerência status × percentual:**  
   - `Implementada` ⇒ `percentual_implementado = 1.0` e `descricao_da_evidencia` obrigatório.  
   - `Não implementada` ⇒ `percentual_implementado = 0`.  
4. **Atraso sem implementação:** se `novo_prazo` > hoje **ou** `prazo_implementacao` vencido e `percentual_implementado < 1.0`, exigir `impacto_do_atraso_ou_nao_implementacao`.  

---

### 2.5 Bloco JSON — Parte 2 (machine-readable)
```json
{
  "parte": "Recomendacoes de Acoes Mitigatorias",
  "campos": [
    { "nome": "acoes_mitigatorias", "tipo": "string", "lista": true, "obrigatorio": true, "observacoes": "Aprovadas pelo Diretor da area" },

    { "nome": "prazo_implementacao", "tipo": "date", "obrigatorio": true, "linhabase": true, "imutavel": true },

    { "nome": "novo_prazo", "tipo": "date", "obrigatorio": false, "dependencias_obrigatorias_se_preenchido": ["justificativa_observacao", "data_da_alteracao", "responsavel_alteracao", "prazo_execucao_relacao_linha_de_base", "impacto_da_alteracao"] },

    { "nome": "situacao", "tipo": "enum", "enum_valores": ["Implementada", "Em implementacao", "Nao implementada"], "obrigatorio": true },

    { "nome": "justificativa_observacao", "tipo": "string", "obrigatorio": false },

    { "nome": "impacto_do_atraso_ou_nao_implementacao", "tipo": "string", "obrigatorio": false, "regra_validacao": "exigir quando houver atraso ou situacao = 'Nao implementada' ou percentual_implementado < 1.0 com prazo vencido" },

    { "nome": "percentual_implementado", "tipo": "percent", "min": 0.0, "max": 1.0, "obrigatorio": true },

    { "nome": "descricao_da_evidencia", "tipo": "string", "obrigatorio": false, "regra_validacao": "exigir quando situacao = 'Implementada'" },

    { "nome": "alteracao_realizada", "tipo": "string", "obrigatorio": false },

    { "nome": "data_da_alteracao", "tipo": "date", "obrigatorio": false },

    { "nome": "responsavel_alteracao", "tipo": "string", "obrigatorio": false },

    { "nome": "prazo_execucao_relacao_linha_de_base", "tipo": "integer", "unidade": "dias", "obrigatorio": false, "regra_calculo": "date_diff(novo_prazo, prazo_implementacao, dias)" },

    { "nome": "impacto_da_alteracao", "tipo": "string", "obrigatorio": false }
  ],
  "regras": [
    "prazo_implementacao e imutavel apos definido; usar novo_prazo para reprogramacoes",
    "se novo_prazo preenchido, exigir justificativa_observacao, data_da_alteracao, responsavel_alteracao, prazo_execucao_relacao_linha_de_base e impacto_da_alteracao",
    "coerencia: Implementada => percentual_implementado = 1.0 e descricao_da_evidencia obrigatoria; Nao implementada => percentual_implementado = 0"
  ]
}
```

---

## Parte 3 — Indicadores dos Eventos de Risco

### 3.1 Visão geral
Registra os **KRIs** do evento de risco a serem implementados pelo **Responsável pelo Risco**, com apoio da **Gestão de Riscos**, bem como **linha de base de implementação**, **reprogramações**, **status** e **impactos**.

> Regra de baseline: **`prazo_implementacao` é a linha de base do indicador e não deve ser alterado**. Reprogramações devem ser feitas via `novo_prazo`, sempre com justificativa, data, responsável, diferença em relação à linha de base e impacto da alteração.

---

### 3.2 Grupos de campos
- **Definição do KRI**  
  `indicador_do_evento_de_risco`
- **Planejamento do indicador**  
  `prazo_implementacao`
- **Reprogramação de prazo (quando houver)**  
  `novo_prazo`, `justificativa_observacao`, `data_da_alteracao`, `responsavel_alteracao`, `impacto_da_alteracao`
- **Status e impactos**  
  `situacao`, `impacto_da_nao_implementacao`

---

### 3.3 Campos detalhados
- **indicador_do_evento_de_risco** (`string`, lista) — Listar os KRIs a implementar.  
  _Ex.:_ “% indisponibilidade mensal (min)”, “Nº incidentes críticos (mês)”.

- **prazo_implementacao** (`date`, **linha de base**) — Data-alvo de implementação do(s) indicador(es).  
  _Observação:_ **não alterar**; use `novo_prazo` para reprogramações.

- **novo_prazo** (`date`, opcional) — Novo prazo quando houver reprogramação.  
  _Obrigatório, se preenchido:_ `justificativa_observacao`, `data_da_alteracao`, `responsavel_alteracao` e `impacto_da_alteracao`.

- **situacao** (`enum`) — Estado do indicador:  
  `Implementado` | `Em implementação` | `Não implementado`.

- **justificativa_observacao** (`string`) — Motivo de não implementação e/ou observações relevantes.

- **impacto_da_nao_implementacao** (`string`) — Impacto para a Companhia caso o indicador não seja implementado.

- **alteracao_realizada** (`string`) — Descrever a alteração feita no indicador, no prazo de implementação e/ou no status.

- **data_da_alteracao** (`date`) — Data do registro da alteração.

- **responsavel_alteracao** (`string`) — Responsável por efetivar/registrar a alteração.

- **impacto_da_alteracao** (`string`) — Descrever o impacto da alteração realizada para a Companhia.

---

### 3.4 Regras de validação e dependências (resumo)
1. **Baseline imutável:** após definido, `prazo_implementacao` não pode ser editado.  
2. **Se `novo_prazo` for preenchido:** exigir `justificativa_observacao`, `data_da_alteracao`, `responsavel_alteracao` e `impacto_da_alteracao`.  
3. **Status coerente:** `Não implementado` ⇒ exigir `impacto_da_nao_implementacao`.  
4. **Datas no padrão:** `YYYY-MM-DD`.

---

### 3.5 Bloco JSON — Parte 3 (machine-readable)
```json
{
  "parte": "Indicadores dos Eventos de Risco",
  "campos": [
    { "nome": "indicador_do_evento_de_risco", "tipo": "string", "lista": true, "obrigatorio": true },

    { "nome": "prazo_implementacao", "tipo": "date", "obrigatorio": true, "linhabase": true, "imutavel": true },

    { "nome": "novo_prazo", "tipo": "date", "obrigatorio": false,
      "dependencias_obrigatorias_se_preenchido": ["justificativa_observacao", "data_da_alteracao", "responsavel_alteracao", "impacto_da_alteracao"] },

    { "nome": "situacao", "tipo": "enum", "enum_valores": ["Implementado", "Em implementacao", "Nao implementado"], "obrigatorio": true },

    { "nome": "justificativa_observacao", "tipo": "string", "obrigatorio": false },

    { "nome": "impacto_da_nao_implementacao", "tipo": "string", "obrigatorio": false,
      "regra_validacao": "exigir quando situacao = 'Nao implementado'" },

    { "nome": "alteracao_realizada", "tipo": "string", "obrigatorio": false },
    { "nome": "data_da_alteracao", "tipo": "date", "obrigatorio": false },
    { "nome": "responsavel_alteracao", "tipo": "string", "obrigatorio": false },
    { "nome": "impacto_da_alteracao", "tipo": "string", "obrigatorio": false }
  ]
}
```

---

## Parte 4 — Lições Aprendidas

### 4.1 Visão geral
Consolida o problema observado, a lição aprendida e as sugestões para próximos ciclos/projetos de gestão de riscos, garantindo melhoria contínua e padronização das boas práticas.

### 4.2 Campos detalhados
- **descricao_do_problema** (`string`) — Descrever detalhadamente a situação-problema que gerou a lição aprendida.
- **licao_aprendida** (`string`) — Descrever a lição e como aplicá-la (o que manter, evitar ou padronizar).
- **sugestoes_para_projetos_seguintes** (`string`, lista) — Sugerir ações/recomendações aplicáveis aos próximos ciclos/projetos de gestão de riscos.

### 4.3 Boas práticas de conteúdo
- Seja **específico, mensurável e acionável** (o que, onde, quando, quem).
- Indique **processos/unidades** de aplicação e **janela temporal**.
- Aponte **responsáveis recomendados** ou **papéis** quando fizer sentido.
- Evite generalidades (“melhorar comunicação”); prefira instruções verificáveis.

### 4.4 Bloco JSON — Parte 4 (machine-readable)
```json
{
  "parte": "Licoes Aprendidas",
  "campos": [
    { "nome": "descricao_do_problema", "tipo": "string", "obrigatorio": true },
    { "nome": "licao_aprendida", "tipo": "string", "obrigatorio": true },
    { "nome": "sugestoes_para_projetos_seguintes", "tipo": "string", "lista": true, "obrigatorio": false }
  ]
}
```

---

# Aba 2 — Ficha do Evento de Risco (Preenchimento da Parte 1)

## 2.1 Objetivo
Registrar os **dados do evento de risco** e seus **vínculos** (estratégia/processos), além das avaliações **inerente** e **residual**, com listas de **fatores**, **consequências**, **ações mitigatórias** e **indicadores** relacionados.

---

## 2.2 Layout (espelhando a planilha)

### 2.2.1 Bloco “Cabeçalho da Parte I — Informações do Evento de Risco”
- Coluna esquerda / direita (pareado):
  - `evento_de_risco` | `responsavel_pelo_risco`
  - `classificacao_do_risco` | `objetivos_estrategicos_relacionados`
  - `natureza_do_risco` | `categoria_subcategoria`
  - `macroprocesso_relacionado` | `processo_relacionado`
  - `impacta_a_imagem` | `areas_impactadas`
  - `entregas_impactadas` | `valores_impactados`

### 2.2.2 Blocos de avaliação (tabelas 3 colunas)
- **Avaliação Inerente**: `impacto_inerente` | `probabilidade_inerente` | `criticidade_inerente`
- **Avaliação Residual**: `impacto_residual` | `probabilidade_residual` | `criticidade_residual`

### 2.2.3 Campos adicionais (linha única)
- `resposta_ao_evento_de_risco`
- `eventos_de_risco_relacionados`

### 2.2.4 Tabelas de listas
1) **Principais Fatores de Risco**
   - Colunas: `numero` | `fator`
2) **Principais Consequencias**
   - Colunas: `numero` | `consequencia`
3) **Acoes Mitigatorias**
   - Colunas: `numero` | `acao_mitigatoria` | `fatores_de_risco_mitigados` | `mitiga_i_ou_p`
4) **Indicadores de Risco**
   - Colunas: `numero` | `indicador_de_risco` | `fatores_de_risco_mitigados` | `mitiga_i_ou_p`

> Observação: prazos e reprogramações **não** ficam nesta aba; estão nas Abas “Parte 2” (ações) e “Parte 3” (indicadores).

---

## 2.3 Dicionário de campos (formas de preenchimento)

### Identificação e vínculos
- **evento_de_risco** (`string`) — Nome conforme Portfólio de Riscos.  
- **responsavel_pelo_risco** (`string`) — Cargo/setor responsável por acompanhamento/monitoramento/comunicação.  
- **classificacao_do_risco** (`enum`) — `Interno` | `Externo`.  
- **objetivos_estrategicos_relacionados** (`reference`, lista `;`) — Objetivos do Planejamento Estratégico.  
- **natureza_do_risco** (`reference`) — Natureza conforme Dicionário de Riscos.  
- **categoria_subcategoria** (`reference`) — Categoria/Subcategoria conforme Dicionário de Riscos.  
- **macroprocesso_relacionado** (`reference`, lista `;`) — Macroprocesso(s) associado(s).  
- **processo_relacionado** (`reference`, lista `;`) — Processo(s) associado(s).  
- **impacta_a_imagem** (`boolean`) — Indica se há impacto reputacional.  
- **areas_impactadas** (`string`, lista `;`) — Áreas impactadas.  
- **entregas_impactadas** (`string`, lista `;`) — Entregas impactadas.  
- **valores_impactados** (`string`, lista `;`) — Ex.: Receita; Multas; Opex.

### Avaliação de risco
- **impacto_inerente** (`enum[1..5]`) — 1 Muito Baixo · 2 Baixo · 3 Moderado · 4 Alto · 5 Muito Alto.  
- **probabilidade_inerente** (`enum[1..5]`) — 1 Muito Baixa · 2 Baixa · 3 Moderada · 4 Alta · 5 Muito Alta.  
- **criticidade_inerente** (`computed`) — `matriz_risco(impacto_inerente, probabilidade_inerente)`.

- **impacto_residual** (`enum[1..5]`) — Pós-mitigação.  
- **probabilidade_residual** (`enum[1..5]`) — Pós-mitigação.  
- **criticidade_residual** (`computed`) — `matriz_risco(impacto_residual, probabilidade_residual)`.

### Resposta e relacionamentos
- **resposta_ao_evento_de_risco** (`enum`) — `Evitar/Eliminar` | `Mitigar/Minimizar` | `Compartilhar` | `Aceitar`.  
- **eventos_de_risco_relacionados** (`reference`, lista `;`) — Outros eventos do portfólio.

### Listas estruturadas
- **principais_fatores_de_risco** (tabela):
  - `numero` (`integer`), `fator` (`string`).
- **principais_consequencias** (tabela):
  - `numero` (`integer`), `consequencia` (`string`).
- **acoes_mitigatorias** (tabela):
  - `numero` (`integer`),
  - `acao_mitigatoria` (`string`) — Sugerido: `acao | responsavel | prazo_previsto`,
  - `fatores_de_risco_mitigados` (`integer[]`) — Referenciam `principais_fatores_de_risco.numero`,
  - `mitiga_i_ou_p` (`enum`) — `I` | `P` | `I e P`.
- **indicadores_de_risco** (tabela):
  - `numero` (`integer`),
  - `indicador_de_risco` (`string`) — Sugerido: `indicador | formula | meta | frequencia`,
  - `fatores_de_risco_mitigados` (`integer[]`) — Referenciam `principais_fatores_de_risco.numero`,
  - `mitiga_i_ou_p` (`enum`) — `I` | `P` | `I e P`.

---

## 2.4 Regras de consistência
1. **Enums fechados:** usar exatamente os rótulos indicados.  
2. **Listas:** separar múltiplos itens por `;`.  
3. **Criticidades:** sempre calculadas pela **mesma matriz 5×5** da política.  
4. **Referências de mitigação:** `fatores_de_risco_mitigados` devem apontar para números válidos em **Principais Fatores de Risco**.  
5. **Sem prazos aqui:** prazos/base e reprogramações das ações/indicadores ficam nas Abas específicas (Partes 2 e 3).  
6. **Coerência residual:** valores residuais não podem ser **maiores** que os inerentes, salvo exceção justificada em auditoria (se surgir esse caso, registrar na Aba de *Lições*).

---

## 2.5 Bloco JSON — Aba 2 (machine-readable)
```json
{
  "sheet": "Aba 2 - Ficha do Evento de Risco",
  "grupos": {
    "cabecalho_parte_1": [
      {"nome":"evento_de_risco","tipo":"string"},
      {"nome":"responsavel_pelo_risco","tipo":"string"},
      {"nome":"classificacao_do_risco","tipo":"enum","enum_valores":["Interno","Externo"]},
      {"nome":"objetivos_estrategicos_relacionados","tipo":"reference","lista":true,"referencia":"planejamento_estrategico.objetivos"},
      {"nome":"natureza_do_risco","tipo":"reference","referencia":"dicionario_de_riscos.naturezas"},
      {"nome":"categoria_subcategoria","tipo":"reference","referencia":"dicionario_de_riscos.categorias_subcategorias"},
      {"nome":"macroprocesso_relacionado","tipo":"reference","lista":true,"referencia":"cadeia_de_valor.macroprocessos"},
      {"nome":"processo_relacionado","tipo":"reference","lista":true,"referencia":"cadeia_de_valor.processos"},
      {"nome":"impacta_a_imagem","tipo":"boolean"},
      {"nome":"areas_impactadas","tipo":"string","lista":true},
      {"nome":"entregas_impactadas","tipo":"string","lista":true},
      {"nome":"valores_impactados","tipo":"string","lista":true}
    ],
    "avaliacao_inerente": [
      {"nome":"impacto_inerente","tipo":"enum","enum_valores":[1,2,3,4,5]},
      {"nome":"probabilidade_inerente","tipo":"enum","enum_valores":[1,2,3,4,5]},
      {"nome":"criticidade_inerente","tipo":"computed","regra_calculo":"matriz_risco(impacto_inerente, probabilidade_inerente)"}
    ],
    "avaliacao_residual": [
      {"nome":"impacto_residual","tipo":"enum","enum_valores":[1,2,3,4,5]},
      {"nome":"probabilidade_residual","tipo":"enum","enum_valores":[1,2,3,4,5]},
      {"nome":"criticidade_residual","tipo":"computed","regra_calculo":"matriz_risco(impacto_residual, probabilidade_residual)"}
    ],
    "resposta_e_relacoes": [
      {"nome":"resposta_ao_evento_de_risco","tipo":"enum","enum_valores":["Evitar/Eliminar","Mitigar/Minimizar","Compartilhar","Aceitar"]},
      {"nome":"eventos_de_risco_relacionados","tipo":"reference","lista":true,"referencia":"portfolio_de_riscos.eventos"}
    ],
    "tabela_principais_fatores_de_risco": {
      "colunas": [
        {"nome":"numero","tipo":"integer"},
        {"nome":"fator","tipo":"string"}
      ]
    },
    "tabela_principais_consequencias": {
      "colunas": [
        {"nome":"numero","tipo":"integer"},
        {"nome":"consequencia","tipo":"string"}
      ]
    },
    "tabela_acoes_mitigatorias": {
      "colunas": [
        {"nome":"numero","tipo":"integer"},
        {"nome":"acao_mitigatoria","tipo":"string"},
        {"nome":"fatores_de_risco_mitigados","tipo":"integer[]","referencia":"tabela_principais_fatores_de_risco.numero"},
        {"nome":"mitiga_i_ou_p","tipo":"enum","enum_valores":["I","P","I e P"]}
      ]
    },
    "tabela_indicadores_de_risco": {
      "colunas": [
        {"nome":"numero","tipo":"integer"},
        {"nome":"indicador_de_risco","tipo":"string"},
        {"nome":"fatores_de_risco_mitigados","tipo":"integer[]","referencia":"tabela_principais_fatores_de_risco.numero"},
        {"nome":"mitiga_i_ou_p","tipo":"enum","enum_valores":["I","P","I e P"]}
      ]
    }
  }
}
```

---

# Aba 3 — Acompanhamento das Ações Mitigatórias (Parte 2)

## 3.1 Objetivo
Registrar e acompanhar a execução das **ações mitigatórias**: linha de base de prazo, reprogramações, status, impacto de atrasos e evidências; além do **histórico de revisões**.

---

## 3.2 Cabeçalho
- **nome_do_evento_de_risco** (`string`) — Referência ao evento.
- **area_responsavel** (`string`) — Área/Unidade responsável pela ação.

---

## 3.3 Tabela principal — Plano e andamento das ações
**Colunas (ordem do layout):**
1. **numero** (`integer`) — Identificador sequencial da ação.
2. **acao_mitigatoria** (`string`) — Descrição da ação (sugestão: `acao | responsavel | escopo`).
3. **prazo_implementacao** (`date`, **linha de base, imutável**) — Data-alvo original.
4. **novo_prazo** (`date`, opcional) — Data reprogramada (se houver).
5. **situacao** (`enum`) — `Implementada` | `Em implementação` | `Não implementada`.
6. **justificativa_observacao** (`string`) — Justificativa do atraso/não implementação e observações.
7. **impacto_do_atraso_ou_nao_implementacao** (`string`) — Efeitos do atraso/não execução.
8. **percentual_implementado** (`number`) — Percentual concluído **0–100** (na planilha).  
   *Regra para agentes:* normalizar para `0–1` quando usado em cálculo.
9. **descricao_da_evidencia** (`string`) — Evidência e local onde pode ser verificada (obrigatória se `situacao = Implementada`).

---

## 3.4 Tabela secundária — Histórico de revisões
**Colunas (ordem do layout):**
1. **numero** (`integer`) — Identificador sequencial da revisão.
2. **alteracao_realizada** (`string`) — O que foi alterado (prazo/escopo/sequência etc.).
3. **data_da_alteracao** (`date`) — Data do registro da alteração.
4. **responsavel_alteracao** (`string`) — Responsável pela alteração.
5. **prazo_execucao_relacao_linha_de_base** (`integer`, **dias**) — Diferença entre `novo_prazo` e `prazo_implementacao`.  
   *Cálculo sugerido:* `date_diff(novo_prazo, prazo_implementacao, dias)` (positivo = atraso; negativo = adiantamento).
6. **impacto_da_alteracao** (`string`) — Impacto organizacional decorrente da alteração.

---

## 3.5 Regras de validação e consistência
- **Baseline imutável:** `prazo_implementacao` não deve ser alterado após definido.
- **Se `novo_prazo` for preenchido:** é obrigatório registrar **justificativa_observacao**, **data_da_alteracao**, **responsavel_alteracao**, **prazo_execucao_relacao_linha_de_base** e **impacto_da_alteracao** (na tabela de revisões).
- **Coerência status × percentual:**
  - `Implementada` ⇒ `percentual_implementado = 100` **e** `descricao_da_evidencia` obrigatório.
  - `Não implementada` ⇒ `percentual_implementado = 0`.
  - `Em implementação` ⇒ `0 < percentual_implementado < 100`.
- **Atraso obrigatório:** se `hoje > prazo_implementacao` e `percentual_implementado < 100`, exigir `impacto_do_atraso_ou_nao_implementacao`.
- **Datas** no padrão `YYYY-MM-DD`.

---

## 3.6 Bloco JSON — Aba 3 (machine-readable)
```json
{
  "sheet": "Aba 3 - Acompanhamento das Acoes Mitigatorias",
  "cabecalho": [
    { "nome": "nome_do_evento_de_risco", "tipo": "string" },
    { "nome": "area_responsavel", "tipo": "string" }
  ],
  "tabela_principal": {
    "colunas": [
      { "nome": "numero", "tipo": "integer" },
      { "nome": "acao_mitigatoria", "tipo": "string" },
      { "nome": "prazo_implementacao", "tipo": "date", "linhabase": true, "imutavel": true },
      { "nome": "novo_prazo", "tipo": "date", "obrigatorio": false },
      { "nome": "situacao", "tipo": "enum", "enum_valores": ["Implementada", "Em implementacao", "Nao implementada"] },
      { "nome": "justificativa_observacao", "tipo": "string", "obrigatorio": false },
      { "nome": "impacto_do_atraso_ou_nao_implementacao", "tipo": "string", "obrigatorio": false },
      { "nome": "percentual_implementado", "tipo": "number", "min": 0, "max": 100 },
      { "nome": "descricao_da_evidencia", "tipo": "string", "obrigatorio": false }
    ]
  },
  "historico_de_revisoes": {
    "colunas": [
      { "nome": "numero", "tipo": "integer" },
      { "nome": "alteracao_realizada", "tipo": "string" },
      { "nome": "data_da_alteracao", "tipo": "date" },
      { "nome": "responsavel_alteracao", "tipo": "string" },
      { "nome": "prazo_execucao_relacao_linha_de_base", "tipo": "integer", "unidade": "dias", "regra_calculo": "date_diff(novo_prazo, prazo_implementacao, dias)" },
      { "nome": "impacto_da_alteracao", "tipo": "string" }
    ]
  },
  "regras": [
    "prazo_implementacao e imutavel (baseline); reprogramacoes via novo_prazo",
    "se novo_prazo for preenchido, registrar justificativa e revisao completa",
    "status coerente com percentual_implementado; evidencia obrigatoria quando Implementada",
    "datas no formato YYYY-MM-DD"
  ]
}
```

---

# Aba 4 — Backup Indicadores (Parte 3)

## 4.1 Objetivo
Registrar o **backlog/backup** dos indicadores (KRIs) do evento de risco, com **situação**, **justificativas/impactos**, **metas** e **parâmetros de tolerância**, além do **histórico de revisões**.  
> Prazos-base e reprogramações dos indicadores continuam documentados na **Aba 3 — Indicadores (Parte 3)**.

---

## 4.2 Cabeçalho
- **nome_do_evento_de_risco** (`string`) — Ex.: “Alcançar tardiamente…”.  
- **area_responsavel** (`string`) — Unidade/área responsável pelo KRI.

---

## 4.3 Tabela principal — Indicadores
**Colunas (ordem do layout):**
1. **numero** (`integer`) — Identificador sequencial do indicador.
2. **indicador_do_evento_de_risco** (`string`) — Nome/definição do KRI.  
   _Sugestão de padrão:_ `indicador | fórmula | fonte_de_dados`.
3. **situacao_do_indicador** (`enum`) — `Implementado` | `Em implementação` | `Não implementado`.
4. **justificativa_observacao** (`string`) — Motivo de não implementação e/ou observações relevantes.
5. **impacto_da_nao_implementacao** (`string`) — Efeitos caso o KRI não seja implantado/medido.
6. **meta_descritiva** (`string`) — Meta em texto (ex.: “≤ 2 incidentes críticos/mês”).
7. **meta_efetiva** (`string`) — Valor-meta efetivo (ex.: “2 incidentes/mês”, “≥ 99,5% disponibilidade”).  
   _Nota:_ manter unidade/operador no texto para espelhar a planilha.
8. **tolerancia** (`string`) — Faixa/critério de tolerância (ex.: “entre 2 e 3 incidentes/mês”).
9. **limite_de_tolerancia** (`string`) — Limite superior/inferior (ex.: “> 3 incidentes/mês = fora da tolerância”).
10. **tipo_de_acompanhamento_1** (`string`) — **Como no layout**: primeiro campo “Tipo de Acompanhamento”.
11. **tipo_de_acompanhamento_2** (`string`) — **Como no layout**: segundo campo “Tipo de Acompanhamento”.  
    ⚠️ **Alerta de duplicidade:** confirmar se um dos campos deve ser “Periodicidade/Frequência” (ex.: diário, semanal, mensal) ou “Modo” (manual/automático). Mantive ambos separados para não perder informação.

> **Dica para agentes IA (sem alterar a planilha):** quando possível, normalizar internamente `meta_efetiva/tolerancia/limite_de_tolerancia` para estrutura `operador | valor | unidade`, mas persistir na planilha exatamente como texto.

---

## 4.4 Tabela secundária — Histórico de Revisões
**Colunas (ordem do layout):**
1. **numero** (`integer`)  
2. **alteracao_realizada** (`string`) — O que mudou (definição/meta/tolerância/tipo de acompanhamento).  
3. **data_da_alteracao** (`date`) — `YYYY-MM-DD`.  
4. **responsavel_alteracao** (`string`) — Quem registrou/validou a alteração.  
5. **impacto_da_alteracao** (`string`) — Efeito organizacional/analítico da mudança.

---

## 4.5 Regras de validação e consistência
- **Status coerente:** `Não implementado` ⇒ exigir `impacto_da_nao_implementacao`.
- **Metas e tolerâncias:** manter **unidades e operadores no texto**; se houver cálculo, documentar na descrição do KRI.  
- **Revisões obrigatórias:** qualquer mudança em meta/tolerância/tipos de acompanhamento ⇒ registrar em **Histórico de Revisões**.  
- **Datas** no padrão `YYYY-MM-DD`.

---

## 4.6 Bloco JSON — Aba 4 (machine-readable)
```json
{
  "sheet": "Aba 4 - Backup Indicadores",
  "cabecalho": [
    { "nome": "nome_do_evento_de_risco", "tipo": "string" },
    { "nome": "area_responsavel", "tipo": "string" }
  ],
  "tabela_principal": {
    "colunas": [
      { "nome": "numero", "tipo": "integer" },
      { "nome": "indicador_do_evento_de_risco", "tipo": "string" },
      { "nome": "situacao_do_indicador", "tipo": "enum", "enum_valores": ["Implementado","Em implementacao","Nao implementado"] },
      { "nome": "justificativa_observacao", "tipo": "string" },
      { "nome": "impacto_da_nao_implementacao", "tipo": "string" },
      { "nome": "meta_descritiva", "tipo": "string" },
      { "nome": "meta_efetiva", "tipo": "string" },
      { "nome": "tolerancia", "tipo": "string" },
      { "nome": "limite_de_tolerancia", "tipo": "string" },
      { "nome": "tipo_de_acompanhamento_1", "tipo": "string" },
      { "nome": "tipo_de_acompanhamento_2", "tipo": "string" }
    ]
  },
  "historico_de_revisoes": {
    "colunas": [
      { "nome": "numero", "tipo": "integer" },
      { "nome": "alteracao_realizada", "tipo": "string" },
      { "nome": "data_da_alteracao", "tipo": "date" },
      { "nome": "responsavel_alteracao", "tipo": "string" },
      { "nome": "impacto_da_alteracao", "tipo": "string" }
    ]
  },
  "observacoes": "Layout possui duas colunas com o mesmo rotulo 'Tipo de Acompanhamento'. Mantidas separadas como _1 e _2 ate confirmacao."
}
```

---

# Aba 5 — Lições Aprendidas (Parte 4)

## 5.1 Objetivo
Registrar, por evento de risco, as **lições aprendidas** a partir de problemas observados e propor **sugestões acionáveis** para os próximos ciclos/projetos de gestão de riscos.

---

## 5.2 Cabeçalho
- **nome_do_evento_de_risco** (`string`) — Referência ao evento.
- **area_responsavel** (`string`) — Unidade/área que conduz o registro da lição.

---

## 5.3 Tabela principal — Lições
**Colunas (ordem do layout):**
1. **numero** (`integer`) — Identificador sequencial da entrada.
2. **descricao_do_problema** (`string`) — Situação-problema que originou a lição.
3. **licao_aprendida** (`string`) — O que foi aprendido e como aplicar (o que manter/evitar/padronizar).
4. **sugestoes_para_projetos_seguintes** (`string`) — Recomendações objetivas para próximos ciclos/projetos.

---

## 5.4 Regras de validação e consistência
- **Clareza e ação:** escrever itens **específicos, mensuráveis e viáveis** (indicar processo/unidade e horizonte temporal quando couber).
- **Não duplicar:** evitar repetição de lições; consolidar entradas semelhantes.
- **Rastreabilidade:** quando aplicável, referenciar o item/ação/indicador relacionado nas demais abas.
- **Conteúdo sensível:** não inserir dados pessoais/sigilosos; usar descrições funcionais.

---

## 5.5 Bloco JSON — Aba 5 (machine-readable)
```json
{
  "sheet": "Aba 5 - Licoes Aprendidas",
  "cabecalho": [
    { "nome": "nome_do_evento_de_risco", "tipo": "string" },
    { "nome": "area_responsavel", "tipo": "string" }
  ],
  "tabela_principal": {
    "colunas": [
      { "nome": "numero", "tipo": "integer" },
      { "nome": "descricao_do_problema", "tipo": "string" },
      { "nome": "licao_aprendida", "tipo": "string" },
      { "nome": "sugestoes_para_projetos_seguintes", "tipo": "string" }
    ]
  },
  "regras": [
    "entradas devem ser especificas, mensuraveis e viaveis",
    "evitar duplicidade; consolidar similares",
    "referenciar itens/acoes/indicadores quando aplicavel",
    "nao registrar dados pessoais ou sigilosos"
  ]
}
```

---