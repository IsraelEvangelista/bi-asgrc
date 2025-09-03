# Epic 9: Sistema de Notificações In-App

- **Objetivo:** Implementar um centro de notificações dentro da aplicação para alertar os usuários sobre eventos importantes de forma proativa, melhorando o engajamento e a pontualidade na execução de tarefas.

- **Histórias de Usuário:**
  a. **Criação da Tabela de Notificações:**
    - **Como:** Desenvolvedor
    - **Eu quero:** Criar uma nova tabela no Supabase para armazenar as notificações.
    - **Para que:** Persistir as notificações que serão exibidas aos usuários.
    - **Critérios de Aceite:**
        - Uma tabela `notificacoes` é criada com os seguintes campos: `id` (PK), `id_usuario_destino` (FK para `002_USUARIOS`), `mensagem` (TEXT), `tipo_notificacao` (ENUM, ex: 'alerta', 'informativo'), `lida` (BOOLEAN, default FALSE), `link_redirecionamento` (TEXT), `created_at`.

  b. **Componente de Notificações na UI:**
    - **Como:** Um usuário logado
    - **Eu quero:** Ver um ícone de "sino" no cabeçalho da aplicação que indique a presença de novas notificações.
    - **Para que:** Ser notificado de novas atualizações sem precisar verificar ativamente cada módulo.
    - **Critérios de Aceite:**
        - Um ícone de sino é exibido no Header.
        - O ícone exibe um contador com o número de notificações não lidas.
        - Ao clicar no ícone, um painel (dropdown/popover) é aberto listando as notificações mais recentes.
        - Clicar em uma notificação específica marca-a como "lida" e redireciona o usuário para o `link_redirecionamento` associado.

  c. **Geração de Notificações (Gatilhos):**
    - **Como:** Desenvolvedor
    - **Eu quero:** Implementar a lógica no backend (ou via triggers no Supabase) para gerar notificações com base nos eventos definidos no PRD.
    - **Para que:** Automatizar o envio de alertas relevantes para os usuários corretos.
    - **Critérios de Aceite:**
        - Uma notificação é criada para o **Responsável pela Ação** quando o prazo de uma ação de mitigação se aproxima (ex: 3 dias de antecedência).
        - Uma notificação é criada para o **Gestor de Risco** e para o **Responsável** quando um indicador de risco fica "Fora da Tolerância".
        - Uma notificação é criada para o **Responsável pelo Risco** quando um novo risco é atribuído a ele.

  d. **Utilização de Real-time do Supabase:**
    - **Como:** Desenvolvedor
    - **Eu quero:** Utilizar a funcionalidade de Real-time Subscriptions do Supabase.
    - **Para que:** Atualizar o contador e a lista de notificações na UI em tempo real, sem a necessidade de o usuário recarregar a página.
    - **Critérios de Aceite:**
        - O frontend se inscreve para receber atualizações na tabela `notificacoes`.
        - Quando uma nova notificação é inserida no banco para o usuário logado, o contador e a lista são atualizados automaticamente.
