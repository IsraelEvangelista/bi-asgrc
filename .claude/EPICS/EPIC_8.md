# Epic 8: Módulo de Configurações e Cadastros Gerais

- **Objetivo:** Desenvolver uma área centralizada de "Configurações" (`/configuracoes`) onde os Administradores possam gerenciar as entidades de apoio do sistema, garantindo a parametrização e a manutenção dos dados mestres.

- **Histórias de Usuário:**
  a. **Gerenciamento de Áreas e Gerências (CRUD):**
    - **Como:** Administrador do Sistema
    - **Eu quero:** Cadastrar e gerenciar as áreas e gerências da COGERH (tabela `003_AREAS_GERENCIAS`).
    - **Para que:** Utilizar essa informação para associar responsáveis a riscos, processos e ações.
    - **Critérios de Aceite:**
        - A interface em `/configuracoes/areas` permite o CRUD completo da tabela.
        - O formulário inclui campos para `nome_area`, `sigla_area`, `responsavel_area` e um toggle para `ativa`.

  b. **Gerenciamento da Estrutura de Classificação de Riscos (CRUD):**
    - **Como:** Administrador do Sistema
    - **Eu quero:** Gerenciar a hierarquia de Natureza, Categoria e Subcategoria dos riscos.
    - **Para que:** Manter o sistema de classificação de riscos consistente e alinhado com a metodologia da empresa.
    - **Critérios de Aceite:**
        - Interfaces separadas em `/configuracoes` permitem o CRUD para as tabelas `010_NATUREZA`, `011_CATEGORIA` e `012_SUBCATEGORIA`.
        - A interface de Categoria permite a associação com uma Natureza pai.
        - A interface de Subcategoria permite a associação com uma Categoria pai.
        - O sistema garante a integridade referencial entre os três níveis.

  c. **Gerenciamento de Conceitos (CRUD):**
    - **Como:** Administrador do Sistema
    - **Eu quero:** Cadastrar e editar os conceitos fundamentais de gestão de riscos (tabela `020_CONCEITOS`).
    - **Para que:** Disponibilizar um glossário ou base de conhecimento dentro do sistema.
    - **Critérios de Aceite:**
        - A interface em `/configuracoes/conceitos` permite o CRUD completo da tabela `020_CONCEITOS`.
        - Uma página pública (`/conceitos`) exibe os conceitos cadastrados para todos os usuários.

  d. **Interface de Cadastros Unificada:**
    - **Como:** Administrador do Sistema
    - **Eu quero:** Ter uma página de "Cadastros" ou "Configurações" que centralize o acesso a todas as interfaces de gerenciamento mencionadas neste épico.
    - **Para que:** Facilitar a administração do sistema a partir de um único ponto de entrada.
    - **Critérios de Aceite:**
        - A rota `/configuracoes` apresenta um menu ou painel com links para as áreas de gerenciamento de Áreas, Naturezas, Categorias, Subcategorias e Conceitos.
        - O acesso à rota `/configuracoes` e suas sub-rotas é restrito a usuários com o perfil de "Administrador do Sistema".
