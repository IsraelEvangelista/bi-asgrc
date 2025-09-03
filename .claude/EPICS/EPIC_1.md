Plano de Desenvolvimento para TRAE SOLO

  Epic 1: Configuração e Fundação do Banco de Dados (Supabase)

  - Objetivo: Estabelecer a infraestrutura de dados completa no Supabase, garantindo que o backend esteja pronto para o desenvolvimento do frontend.
  - Histórias de Usuário:
    a. Configuração do Projeto Supabase:
        - Como: Desenvolvedor
      - Eu quero: Criar um novo projeto no Supabase e configurar as variáveis de ambiente necessárias (URL do projeto, anon key).
      - Para que: A aplicação frontend possa se conectar ao backend.
      - Critérios de Aceite:
            - Projeto Supabase criado.
        - Chaves de API e URL do projeto armazenadas de forma segura no ambiente de desenvolvimento.
    b. Execução do Schema do Banco de Dados:
        - Como: Desenvolvedor
      - Eu quero: Executar o DDL completo fornecido na seção 6.4.2 do PRD.
      - Para que: Criar todas as tabelas, tipos (enums), relacionamentos (foreign keys), e funções (generated always as).
      - Critérios de Aceite:
            - Todas as tabelas listadas no ERD (6.4.1) existem no banco de dados.
        - Todos os relacionamentos estão corretamente estabelecidos.
        - O tipo tipo_macroprocesso_enum foi criado e aplicado.
    c. Implementação de Índices e Permissões:
        - Como: Desenvolvedor
      - Eu quero: Aplicar os índices de performance e as permissões de acesso (RLS) conforme definido no final do script SQL do PRD.
      - Para que: Otimizar as consultas e garantir a segurança dos dados.
      - Critérios de Aceite:
            - Todos os índices listados (idx_...) foram criados.
        - As permissões para os roles anon e authenticated estão aplicadas às tabelas matriz_riscos, indicadores, e acoes.
    d. Carga de Dados Iniciais:
        - Como: Desenvolvedor
      - Eu quero: Inserir os dados de teste fornecidos na seção 7.3 do PRD (INSERT INTO matriz_riscos...).
      - Para que: Validar a estrutura do banco e ter dados para o desenvolvimento inicial do frontend.
      - Critérios de Aceite:
            - Os três registros de risco de exemplo estão presentes na tabela matriz_riscos.