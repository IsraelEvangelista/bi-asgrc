Epic 3: Desenvolvimento do Módulo "Gestão de Riscos"

  - Objetivo: Permitir que os "Gestores de Risco" cadastrem, visualizem e editem os riscos organizacionais, implementando a funcionalidade CRUD completa para a entidade
  006_matriz_riscos.
  - Histórias de Usuário:
    a. Listagem e Visualização de Riscos:
        - Como: Gestor de Risco
      - Eu quero: Acessar uma página (/riscos) que exiba todos os riscos cadastrados em uma tabela ou lista.
      - Para que: Ter uma visão geral de todos os riscos ativos e poder navegar para seus detalhes.
      - Critérios de Aceite:
            - A página busca e exibe dados da tabela 006_matriz_riscos.
        - A tabela deve incluir colunas para eventos_riscos, classificacao, probabilidade, impacto, e severidade.
        - Cada linha da tabela deve ter um link para a página de detalhes do risco (/riscos/:id).
    b. Cadastro de Novos Riscos:
        - Como: Gestor de Risco
      - Eu quero: Utilizar um formulário para cadastrar um novo risco, preenchendo todos os campos necessários.
      - Para que: Alimentar o sistema com novos riscos identificados.
      - Critérios de Aceite:
            - O formulário deve conter campos para todos os atributos da tabela 006_matriz_riscos.
        - O campo severidade deve ser calculado automaticamente (probabilidade * impacto) e exibido como read-only.
        - A validação (com Zod) deve garantir que os campos obrigatórios sejam preenchidos e que probabilidade e impacto estejam entre 1 e 5.
        - O formulário deve utilizar React Hook Form para gerenciamento de estado.
    c. Edição e Detalhamento de Riscos:
        - Como: Gestor de Risco
      - Eu quero: Acessar a página de detalhes de um risco (/riscos/:id) para visualizar todas as suas informações e poder editá-las.
      - Para que: Manter as informações dos riscos sempre atualizadas.
      - Critérios de Aceite:
            - A página carrega os dados do risco selecionado.
        - Um formulário pré-preenchido permite a edição dos campos.
        - Ao salvar, os dados na tabela 006_matriz_riscos são atualizados.
        - Deve haver uma função de "soft delete", que atualiza o campo deleted_at em vez de remover o registro.