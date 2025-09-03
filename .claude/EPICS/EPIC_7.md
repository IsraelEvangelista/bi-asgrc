# Epic 7: Módulo de Processos Organizacionais

- **Objetivo:** Implementar a funcionalidade completa de gerenciamento da hierarquia de processos da COGERH, permitindo o cadastro, visualização e relacionamento de macroprocessos, processos e subprocessos, bem como a sua vinculação com os riscos organizacionais.

- **Histórias de Usuário:**
  a. **Gerenciamento de Macroprocessos (CRUD):**
    - **Como:** Administrador do Sistema / Gestor de Risco
    - **Eu quero:** Cadastrar, editar e visualizar os macroprocessos da organização (tabela `004_MACROPROCESSOS`).
    - **Para que:** Estabelecer o nível mais alto da arquitetura de processos.
    - **Critérios de Aceite:**
        - A interface em `/configuracoes/macroprocessos` permite o CRUD completo da tabela.
        - O formulário inclui todos os campos relevantes, como `tipo_macroprocesso`, `macroprocesso`, `link_macro`, e `situacao`.
        - A visualização principal mostra uma lista de todos os macroprocessos cadastrados.

  b. **Gerenciamento de Processos (CRUD) e Vinculação a Macroprocessos:**
    - **Como:** Administrador do Sistema / Gestor de Risco
    - **Eu quero:** Cadastrar e editar os processos, associando cada um a um macroprocesso pai (tabela `005_PROCESSOS`).
    - **Para que:** Detalhar o segundo nível da arquitetura de processos.
    - **Critérios de Aceite:**
        - A interface permite o CRUD completo para os processos.
        - No formulário de cadastro/edição, um campo de seleção permite vincular o processo a um `id_macro` existente.
        - A interface garante a integridade referencial, não permitindo a criação de processos órfãos.

  c. **Gerenciamento de Subprocessos (CRUD) e Vinculação a Processos:**
    - **Como:** Administrador do Sistema / Gestor de Risco
    - **Eu quero:** Cadastrar e editar os subprocessos, vinculando cada um a um processo pai (tabela `013_SUBPROCESSOS`).
    - **Para que:** Detalhar o nível mais granular da arquitetura de processos.
    - **Critérios de Aceite:**
        - A interface permite o CRUD completo para os subprocessos.
        - O formulário de cadastro/edição permite a associação a um `id_processo` existente.

  d. **Visualização da Hierarquia de Processos e Mapeamento de Riscos:**
    - **Como:** Gestor de Risco / Auditor Interno
    - **Eu quero:** Acessar a página `/processos` para navegar na estrutura hierárquica (Macroprocesso → Processo → Subprocesso) e visualizar os riscos associados.
    - **Para que:** Entender a arquitetura completa de processos e como os riscos impactam cada um de seus níveis.
    - **Critérios de Aceite:**
        - A página `/processos` exibe uma visão clara da hierarquia.
        - Ao selecionar um processo ou macroprocesso, a interface exibe uma lista dos riscos a ele associados (consultando `017_REL_RISCO_PROCESSO` e outras tabelas de relacionamento).
        - A navegação é intuitiva, permitindo "expandir" e "recolher" os níveis da hierarquia.
