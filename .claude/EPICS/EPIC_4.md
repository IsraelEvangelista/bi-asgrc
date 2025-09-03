# Epic 4 (Revisado): Desenvolvimento do Dashboard Executivo Dinâmico

  - Objetivo: Criar a página principal do sistema (/dashboard), oferecendo uma visão consolidada e de alto nível dos riscos, com dados e interações filtrados dinamicamente de acordo com o perfil e as permissões do usuário logado.
  - Histórias de Usuário:
    a. Visualização de KPIs Personalizados:
        - Como: Um usuário logado
      - Eu quero: Ver cards de destaque no topo do dashboard com KPIs que sejam relevantes para a minha área de atuação e permissões.
      - Para que: Ter uma leitura rápida da saúde dos riscos que estão sob minha responsabilidade ou visibilidade.
      - Critérios de Aceite:
            - Os dados dos KPIs (ex: "Total de Riscos Ativos") são filtrados com base no perfil do usuário. Um "Administrador" vê o total, enquanto um "Responsável de Processo" vê apenas os riscos associados à sua área.
        - A interface dos cards segue o design do PRD.
    b. Implementação da Matriz de Riscos Contextual:
        - Como: Um usuário logado
      - Eu quero: Visualizar uma matriz de riscos (heatmap) que reflita apenas os riscos que tenho permissão para ver.
      - Para que: Focar a análise nos riscos mais críticos dentro do meu escopo de trabalho.
      - Critérios de Aceite:
            - A consulta que alimenta a matriz de riscos no backend (ou a filtragem no frontend) utiliza o ID do usuário/área para retornar apenas os dados pertinentes.
        - A matriz é renderizada corretamente com as cores de severidade.
        - Tratamento de Estado Vazio (Empty State): Se o perfil do usuário não tiver riscos associados, o dashboard deve exibir a mensagem apropriada, conforme definido na seção 4.2.1 do PRD (ex: "Não há riscos disponíveis para visualização no momento.").
    c. Filtros de Dashboard com Respeito às Permissões:
        - Como: Um usuário logado
      - Eu quero: Utilizar os filtros da página (período, responsável, tipo de risco).
      - Para que: Refinar minha análise de dados.
      - Critérios de Aceite:
            - Os filtros aplicados pelo usuário funcionam em conjunto com as regras de permissão do seu perfil, nunca exibindo dados aos quais ele não deveria ter acesso.
        - Por exemplo, um "Responsável de Processo" não pode filtrar por riscos de outra área.