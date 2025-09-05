# Hotfix 1: Ajuste no Nome da Tabela de Notificações

- **Tipo:** Ajuste Técnico / Correção
- **Objetivo:** Renomear a tabela de `notificacoes` para `021_notificacoes` em todo o projeto, incluindo a definição no banco de dados e todas as referências no código do frontend, para garantir a conformidade com o padrão de nomenclatura do projeto.

- **Tarefas Técnicas:**
  1. **Alteração no Banco de Dados:**
     - **O quê:** Renomear a tabela `notificacoes` para `021_notificacoes`.
     - **Como:** Executar o comando SQL `ALTER TABLE public.notificacoes RENAME TO "021_notificacoes";` no Supabase.
     - **Critério de Aceite:** A tabela é renomeada com sucesso no banco de dados.

  2. **Atualização no Código do Frontend:**
     - **O quê:** Localizar todas as chamadas à API do Supabase que fazem referência à tabela `notificacoes` e atualizá-las para `021_notificacoes`.
     - **Como:** Realizar uma busca global no projeto pelo termo `'notificacoes'` (incluindo as aspas) e substituir pelo novo nome `'021_notificacoes'`. As áreas prováveis de mudança são os hooks, serviços ou componentes que interagem com as notificações.
     - **Critério de Aceite:** A aplicação continua funcionando corretamente, buscando, criando e atualizando notificações na nova tabela.

  3. **Validação e Teste:**
     - **O quê:** Garantir que o sistema de notificações continua 100% funcional após a renomeação.
     - **Como:** Reiniciar o servidor de desenvolvimento e testar o fluxo de notificações de ponta a ponta:
        - Verificar se o contador de notificações no Header é atualizado.
        - Verificar se a lista de notificações é exibida corretamente.
        - Testar a funcionalidade de marcar como lida e o redirecionamento.
     - **Critério de Aceite:** Todo o sistema de notificações opera sem erros.
