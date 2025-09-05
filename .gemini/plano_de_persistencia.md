# Plano de Persistência de Dados

Para garantir a integridade referencial do banco de dados, os dados devem ser inseridos nas tabelas seguindo uma ordem de prioridade baseada em suas dependências. Tabelas sem dependências externas devem ser preenchidas primeiro.

A ordem de prioridade recomendada é a seguinte:

### Prioridade 1: Tabelas de Estrutura e Classificação (Independentes)
Estas tabelas não dependem de outras e servem como base para o restante do sistema.

1.  **`003_areas_gerencias`**: Contém a estrutura organizacional. (check)
2.  **`004_macroprocessos`**: Define os macroprocessos.
3.  **`010_natureza`**: Define a natureza dos riscos.
4.  **`007_riscos_trabalho`**: Lista de riscos de trabalho.
5.  **`014_acoes_controle_proc_trab`**: Lista de ações de controle.

### Prioridade 2: Tabelas de Configuração Básica
Estas tabelas dependem das tabelas de Prioridade 1.

6.  **`001_perfis`**: Depende de `003_areas_gerencias`.
7.  **`005_processos`**: Depende de `004_macroprocessos`.
8.  **`011_categoria`**: Depende de `010_natureza`.

### Prioridade 3: Tabelas de Usuários e Detalhamento
Dependem das configurações da Prioridade 2.

9.  **`002_usuarios`**: Depende de `001_perfis` e `003_areas_gerencias`.
10. **`013_subprocessos`**: Depende de `005_processos`.
11. **`012_subcategoria`**: Depende de `011_categoria`.

### Prioridade 4: Tabela Central de Riscos
Esta é a tabela principal que conecta muitas outras. Deve ser populada após a estrutura básica estar definida.

12. **`006_matriz_riscos`**: Tabela principal da matriz de riscos.

### Prioridade 5: Tabelas Dependentes da Matriz de Riscos e Ações
Estas tabelas dependem diretamente da `006_matriz_riscos` e da `009_acoes`.

13. **`009_acoes`**: Pode ter auto-referência (`id_ref`), então ações primárias devem ser inseridas antes das secundárias.
14. **`008_indicadores`**: Depende de `006_matriz_riscos`.

### Prioridade 6: Tabelas de Relacionamento e Histórico (Muitos-para-Muitos)
Estas tabelas devem ser as últimas a serem populadas, pois conectam registros de várias outras tabelas.

15. **`015_riscos_x_acoes_proc_trab`**: Depende de `005_processos`, `007_riscos_trabalho`, `014_acoes_controle_proc_trab`, e `003_areas_gerencias`.
16. **`016_rel_acoes_riscos`**: Depende de `006_matriz_riscos` e `009_acoes`.
17. **`017_rel_risco_processo`**: Depende de `006_matriz_riscos` e `004_macroprocessos`.
18. **`018_rel_risco`**: Depende de `006_matriz_riscos`, `010_natureza`, `011_categoria`, e `012_subcategoria`.
19. **`019_historico_indicadores`**: Depende de `008_indicadores`.
20. **`notificacoes`**: Depende de `002_usuarios` (ou `auth.users`).

---
*Este plano foi gerado com base na análise dos arquivos de migração SQL do projeto.*
