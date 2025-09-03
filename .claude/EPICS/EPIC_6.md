# Epic 6: Desenvolvimento do Gerador de Relatórios Gerenciais

  - Objetivo: Criar a funcionalidade de geração de relatórios customizados, permitindo que os gestores exportem visões consolidadas dos dados de risco para análise eapresentação.
  - Histórias de Usuário:
    a. Interface de Geração de Relatórios:
        - Como: Gestor de Risco / Auditor Interno
      - Eu quero: Acessar uma página (/relatorios) com uma interface no estilo wizard para configurar e gerar relatórios.
      - Para que: Criar relatórios personalizados de forma intuitiva, selecionando os dados e filtros relevantes.
      - Critérios de Aceite:
            - A interface guia o usuário por etapas para a criação do relatório.
        - É possível aplicar filtros por período, responsável, tipo de risco e processo.
        - A interface exibe um preview em tempo real do relatório que está sendo gerado.
    b. Exportação de Relatórios:
        - Como: Gestor de Risco / Auditor Interno
      - Eu quero: Exportar os relatórios gerados para os formatos PDF e Excel.
      - Para que: Compartilhar as informações com a alta direção e outras partes interessadas, e para realizar análises externas.
      - Critérios de Aceite:
            - A funcionalidade de exportação gera arquivos nos formatos PDF e Excel/CSV.
        - Os relatórios exportados respeitam as permissões de acesso do usuário que os gerou, não incluindo dados restritos.
        - A formatação dos relatórios é profissional e clara, adequada para apresentação executiva.