Epic 2: Estrutura Base do Frontend e Autenticação

  - Objetivo: Construir o esqueleto da aplicação React, configurar as ferramentas essenciais e implementar o fluxo de autenticação.
  - Histórias de Usuário:
    a. Scaffolding do Projeto Frontend:
        - Como: Desenvolvedor
      - Eu quero: Inicializar um novo projeto React usando Vite, com TypeScript e Tailwind CSS, e instalar as dependências principais (React Router, Zustand, Supabase JS).        
      - Para que: Ter a base tecnológica pronta para o desenvolvimento das funcionalidades.
      - Critérios de Aceite:
            - Projeto criado e rodando localmente.
        - Estrutura de pastas inicial definida (e.g., src/components, src/pages, src/hooks, src/store).
    b. Implementação do Layout Principal:
        - Como: Desenvolvedor
      - Eu quero: Criar os componentes de layout reutilizáveis (Header, Navbar) conforme especificado na seção 4.1.3 do PRD, incluindo o logo da COGERH.
      - Para que: Manter uma identidade visual consistente em toda a aplicação.
      - Critérios de Aceite:
            - Componente de cabeçalho fixo com logo e informações do usuário (mock).
        - Componente de navegação principal abaixo do cabeçalho.
    c. Implementação da Autenticação:
        - Como: Desenvolvedor
      - Eu quero: Criar a página de login (/login) e integrar com o Supabase Auth para autenticação de usuários.
      - Para que: Proteger o acesso ao sistema.
      - Critérios de Aceite:
            - Usuário pode se autenticar usando os provedores definidos.
        - Rotas protegidas redirecionam para a página de login se o usuário não estiver autenticado.
        - Após o login, o usuário é redirecionado para o /dashboard.