# Requisitos Funcionais: Gerenciamento de Risco via Ficha Detalhada

## 1. Visão Geral da Funcionalidade

Esta funcionalidade consiste na digitalização do processo de gerenciamento de eventos de risco através de um **fluxo de preenchimento guiado em etapas (wizard)**, apresentado em um modal. O objetivo é guiar o usuário pelo preenchimento sequencial das informações, garantindo a consistência dos dados e a aderência ao processo definido.

## 2. Estrutura e Escopo

O escopo da funcionalidade abrange a criação de um modal com os seguintes componentes:

### 2.1 Componente de Fluxo (Stepper)
No cabeçalho do modal, um componente visual indicará as etapas do processo. A etapa ativa será destacada visualmente.
*   **Fluxo:** `Ficha de Risco` → `Ações Mitigatórias` → `Indicadores de Risco` → `Lições Aprendidas`
*   **Status das Etapas:** O componente deve indicar visualmente se uma etapa está concluída, ativa ou pendente (bloqueada).

### 2.2 Navegação e Preenchimento
*   **Dependência Sequencial:** O preenchimento é obrigatório e sequencial. O usuário só poderá avançar para a próxima etapa após preencher os campos obrigatórios da etapa atual.
*   **Ações por Etapa:** Cada etapa terá os botões "Voltar" (para a etapa anterior, se aplicável) e "Salvar e Avançar". A última etapa terá o botão "Concluir".

### 2.3 Acesso a Instruções
*   Um ícone de ajuda (`?`) estará permanentemente visível no modal.
*   Ao ser clicado, este ícone exibirá um painel lateral (ou um pop-up) com as informações da seção "Instruções de Preenchimento" do `Ficha-Risco.md`, idealmente mostrando o conteúdo relevante para a etapa ativa no momento.

### 2.4 Visualização de Etapas Anteriores
*   O usuário poderá clicar no nome de uma etapa já concluída no componente de fluxo (stepper).
*   Ao fazer isso, o sistema exibirá os dados da etapa selecionada em **modo de visualização (read-only)**, permitindo a consulta sem o risco de alterações acidentais que possam invalidar os dados das etapas subsequentes.

---

## 3. Requisitos Detalhados por Etapa

### 3.1 Etapa 1: Ficha do Evento de Risco

Esta etapa captura a identidade, o contexto e a avaliação inicial do evento de risco.

#### 3.1.1 Layout da Interface
A tela deve ser organizada em blocos, conforme a seção 2.2 do `Ficha-Risco.md`:
1.  **Bloco de Identificação (colunas pareadas)**
2.  **Blocos de Avaliação (Inerente e Residual)**
3.  **Bloco de Resposta**
4.  **Tabelas de Listas Estruturadas (Fatores, Consequências, Ações, Indicadores)**

#### 3.1.2 Campos e Regras de Negócio Chave
*   **Cálculos Automáticos:** Os campos `criticidade_inerente` e `criticidade_residual` devem ser calculados automaticamente com base na matriz de risco (5x5) da companhia.
*   **Campos de Referência:** Campos como `objetivos_estrategicos_relacionados`, `natureza_do_risco`, `categoria_subcategoria`, `macroprocesso_relacionado` e `processo_relacionado` devem ser campos de seleção (simples ou múltipla) populados a partir de cadastros centralizados no sistema.
*   **Validação de Listas:** Campos que aceitam múltiplos valores devem usar `;` como separador, e a interface deve facilitar essa entrada.

### 3.2 Etapa 2: Ações Mitigatórias

Esta etapa destina-se ao registro e acompanhamento detalhado de cada ação mitigatória.

#### 3.2.1 Layout da Interface
1.  **Tabela Principal - Plano de Ações:** Tabela dinâmica para adicionar/editar/remover ações.
2.  **Tabela Secundária - Histórico de Revisões:** Registra alterações de prazo ou escopo.

#### 3.2.2 Regras de Validação e Comportamento Dinâmico
1.  **Baseline Imutável:** O campo `prazo_implementacao` é bloqueado para edição após o primeiro salvamento.
2.  **Reprogramação de Prazo:** O preenchimento de `novo_prazo` exige uma `justificativa` e cria um registro automático no histórico de revisões.
3.  **Coerência Status vs. Percentual:**
    *   `Implementada` → `percentual_implementado` = 100 e `descricao_da_evidencia` torna-se obrigatório.
    *   `Não implementada` → `percentual_implementado` = 0.
    *   `Em implementação` → 0 < `percentual_implementado` < 100.
4.  **Ações Atrasadas:** Ações com prazo expirado e não concluídas devem ser destacadas visualmente, e o campo `impacto_do_atraso_ou_nao_implementacao` torna-se obrigatório.

### 3.3 Etapa 3: Indicadores de Risco (KRIs)

Esta etapa é dedicada à definição e ao acompanhamento dos Indicadores Chave de Risco (KRIs).

#### 3.3.1 Layout da Interface
1.  **Tabela Principal - Indicadores (KRIs):** Tabela dinâmica para os indicadores.
2.  **Tabela Secundária - Histórico de Revisões:** Para registrar alterações.

#### 3.3.2 Regras de Validação e Comportamento Dinâmico
1.  **Baseline de Prazo Imutável:** O `prazo_implementacao` do KRI é bloqueado após o primeiro salvamento.
2.  **Reprogramação de Prazo:** Requer `justificativa` e gera registro automático no histórico.
3.  **Coerência de Status:** Se `situacao` = `Não implementado`, o campo `impacto_da_nao_implementacao` torna-se obrigatório.

### 3.4 Etapa 4: Lições Aprendidas

Esta etapa consolida o conhecimento adquirido para melhoria contínua.

#### 3.4.1 Layout da Interface
*   **Tabela Principal - Lições Aprendidas:** Uma única tabela dinâmica para adicionar/editar/remover lições.
*   **Colunas:** `Nº`, `Descrição do Problema`, `Lição Aprendida`, `Sugestões para Próximos Ciclos`.

---

## 4. Dependências de Dados Externos

Para a correta implementação da funcionalidade, os seguintes cadastros devem existir e estar acessíveis no sistema para popular os campos de referência:

*   **Portfólio de Riscos:** Para consulta e relacionamento entre eventos de risco.
*   **Planejamento Estratégico:** Para vincular riscos aos objetivos estratégicos.
*   **Dicionário de Riscos:** Para padronizar `natureza`, `categoria` e `subcategoria`.
*   **Cadeia de Valor / Mapa de Processos:** Para vincular riscos a `macroprocessos` e `processos`.
*   **Cadastro de Áreas/Gerências:** Para atribuição de responsabilidades.
