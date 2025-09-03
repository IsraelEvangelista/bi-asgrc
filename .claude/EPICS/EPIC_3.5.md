# Epic 3.5: Implementação de Perfis de Acesso e Lógica de Autorização com Perfil Admin Padrão

  - Objetivo: Estruturar o controle de acesso do sistema, garantindo a existência de um perfil de Administrador com acesso total, e permitindo a gestão dos demais perfis e usuários de forma segura.
  - Histórias de Usuário:
    a. Gerenciamento de Perfis de Acesso (CRUD) com Admin Imutável:
        - Como: Administrador do Sistema
      - Eu quero: Gerenciar os perfis de acesso, sabendo que existe um perfil "Administrador" padrão que não pode ser modificado ou removido.
      - Para que: Definir os níveis de permissão de forma segura, mantendo sempre um superusuário no sistema.
      - Critérios de Aceite:
            - Perfil Admin Padrão:
                - Deve existir um perfil padrão "Administrador" no sistema, criado via seed script (não pela UI).
          - Este perfil deve ter permissão global e irrestrita a todas as funcionalidades.
          - A interface de gerenciamento de perfis (/configuracoes/perfis) deve identificar este perfil e desabilitar as opções de edição e exclusão para ele.
        - Perfis Customizados:
                - A interface deve permitir a criação, edição e desativação de outros perfis na tabela 001_perfis.
          - O formulário deve permitir a edição dos JSONs acessos_interfaces e regras_permissoes para perfis que não sejam o Administrador.
    b. Gerenciamento de Usuários (CRUD):
        - Como: Administrador do Sistema
      - Eu quero: Convidar, gerenciar e atribuir perfis aos usuários do sistema.
      - Para que: Controlar quem acessa o sistema e qual o seu nível de autorização.
      - Critérios de Aceite:
            - A interface em /configuracoes/usuarios permite a gestão completa dos dados da tabela 002_usuarios.
        - É possível associar qualquer perfil existente (incluindo o de Administrador) a um usuário.
        - O primeiro usuário do sistema ou o usuário de setup inicial deve ser associado ao perfil "Administrador" para garantir o acesso inicial.
        - A funcionalidade de ativar/desativar usuários funciona corretamente.
    c. Aplicação da Lógica de Autorização no Frontend:
        - Como: Desenvolvedor
      - Eu quero: Implementar uma lógica centralizada que restrinja o acesso a rotas e funcionalidades com base no perfil do usuário logado.
      - Para que: Garantir que a segurança definida nos perfis seja efetivamente aplicada na interface.
      - Critérios de Aceite:
            - Ao fazer login, os dados do perfil do usuário são carregados para o estado global (Zustand).
        - A lógica de autorização deve corretamente interpretar as permissões do perfil "Administrador" para conceder acesso irrestrito.
        - Para outros perfis, rotas e componentes da UI (botões, abas, etc.) são renderizados ou ocultados com base nos dados dos campos acessos_interfaces e regras_permissoes.