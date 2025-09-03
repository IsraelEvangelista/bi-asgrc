# Project Brief: Sistematização do Gerenciamento de Risco

## 1. Resumo Executivo

**Problema:** O processo atual de gerenciamento de riscos da COGERH depende de planilhas Excel, o que resulta em fragilidade na persistência dos dados, erros frequentes de formatação e ausência de um controle de acesso robusto, comprometendo a segurança e a confiabilidade das informações.

**Solução Proposta:** Desenvolver um sistema web personalizado que substitua o fluxo de trabalho baseado em planilhas. A solução contará com um banco de dados seguro (Supabase), formulários integrados para a gestão de indicadores e um sistema de autenticação e autorização por perfis, garantindo a conformidade com a LGPD e mantendo ou superando a interatividade do BI atual.

**Resultado Esperado:** A implementação resultará em um sistema robusto com persistência de dados confiável, eliminação de erros de formatação e um controle de acesso granular e seguro aos dados e indicadores, aumentando a eficiência e a governança do processo de gestão de riscos.

## 2. Objetivos do Projeto

- **Eliminar 100% do uso de planilhas** como base de dados para o BI de riscos.
- **Reduzir em 95% os erros** de formatação de dados que são reportados atualmente.
- **Implementar um sistema de login seguro** e controle de acesso baseado em perfis de usuário (ex: Administrador, Gerente, Leitor).

## 3. Escopo do Projeto

### Itens Incluídos (In-Scope)
- Migração da base de dados das planilhas para o Supabase.
- Desenvolvimento do dashboard de visualização de riscos.
- Criação de formulários para inserção/atualização de dados pelas gerências.
- Implementação do sistema de autenticação de usuários com controle de acesso por perfis.
- Funcionalidade para geração de relatórios em formato Excel.
- Hospedagem da aplicação na Vercel para a fase inicial.

### Itens Excluídos (Out-of-Scope)
- Implementação de um sistema de alertas automáticos por e-mail (documentado como uma feature para o futuro).
- A migração final do sistema para a intranet da empresa (considerada uma fase posterior ao projeto inicial).

## 4. Stakeholders (Partes Interessadas)

- **Proprietário do Projeto / Aprovador Final:** Assessoria de Gestão de Risco e Compliance (ASGRC).
- **Principais Usuários / Consumidores:** ASGRC, Diretoria e Presidência.
- **Usuários Contribuintes:** Gerências Estratégicas (para atualização e monitoramento de seus indicadores).
- **Usuários com Acesso Restrito:** Outros órgãos e perfis específicos com acesso limitado a telas e relatórios.

## 5. Requisitos de Alto Nível

1.  **Dados:** Utilizar Supabase como o banco de dados principal.
2.  **Autenticação:** Sistema de login seguro por usuário e senha.
3.  **Autorização e Perfis:** Suporte a perfis de usuário customizáveis, onde cada perfil define o acesso a telas e relatórios específicos.
4.  **Input de Dados:** Interface com formulários exclusivos para cada gerência gerenciar seus próprios indicadores.
5.  **Visualização (Dashboard):** Apresentação de uma visão holística dos riscos, com a possibilidade de filtro para visualização focada nos indicadores de uma gerência específica.
6.  **Exportação:** Capacidade de gerar e baixar relatórios em Excel, respeitando as permissões do perfil do usuário.
7.  **Infraestrutura:** Implantação e acesso inicial via Vercel.

## 6. Critérios de Sucesso

- **Continuidade e Melhoria:** O novo sistema deve incorporar todas as funcionalidades e insights chave do BI existente em Power BI, servindo como um substituto aprimorado.
- **Eliminação do Processo Manual:** Virtualização completa da coleta de dados via formulários, eliminando 100% o uso de planilhas para esta finalidade.
- **Adoção:** Pelo menos 90% das gerências utilizando o novo sistema no primeiro trimestre após o lançamento.
- **Confiabilidade dos Dados:** Redução a zero de inconsistências de dados que eram causadas por erros manuais.
- **Feedback Positivo:** Avaliação positiva da ASGRC e da Diretoria sobre a usabilidade e confiabilidade do sistema.
- **Disponibilidade:** Manter um uptime de 99% na Vercel.
