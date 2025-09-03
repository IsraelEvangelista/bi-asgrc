# Wireframes e UI Kit - Sistema de Gestão de Riscos

## 1. UI Kit (Guia de Estilo)

Esta seção define os elementos visuais padronizados baseados nas premissas do sistema atual.

### 1.1 Paleta de Cores

- **Tema Principal:** Clean, com fundo branco (`#FFFFFF`).
- **Cabeçalho:** Gradiente de tons de azul.
- **Bordas e Destaques:** Azul claro.
- **Cores de Apoio:** A serem definidas (sugestão: tons de cinza para textos e elementos neutros).

### 1.2 Logo

O logo oficial a ser utilizado no cabeçalho da aplicação está disponível no seguinte link:
`https://mfgnuiozkznfqmtnlzgs.supabase.co/storage/v1/object/public/media-files/bf5ff449-a432-4b2c-b33e-ed85c4cbf4a5/1756835962585.png`

### 1.3 Dimensões e Layout Geral

- **Resolução Alvo:** 1920px de largura por 1020px de altura.
- **Estrutura:**
    - **Cabeçalho (Header):** Fixo no topo da página.
    - **Painel de Navegação (Navbar):** Fixo, localizado imediatamente abaixo do cabeçalho.
    - **Área de Conteúdo (Main):** Ocupa o restante do espaço vertical abaixo do painel de navegação.

## 2. Estrutura de Navegação

O painel de navegação principal conterá os seguintes itens, com menus suspensos conforme especificado:

- **Conceitos:** Link direto para a visualização dos conceitos.
- **Processos:**
    - Cadeia de Valor
    - Arquitetura de Processos
    - Riscos de Processos de Trabalho
- **Riscos Estratégicos:**
    - **Portifólio de Riscos:**
        - Matriz de Risco
        - Portifólio de Ações
    - **Monitoramento:**
        - Plano de Ações
        - Indicadores
- **Formulários:** Link para a seção de formulários de entrada de dados.
- **Cadastro:** Link para as interfaces de cadastro de entidades (acesso restrito por perfil de usuário).

## 3. Princípios de Interatividade

A interação dos componentes visuais deve replicar o comportamento esperado de um dashboard de BI moderno, similar ao Power BI.

### 3.1 Filtragem Cruzada (Cross-filtering)

- **Filtro Primário:** A página sempre terá um conjunto de filtros principais (ex: por data, por área).
- **Filtro Secundário (Contextual):**
    1. Ao clicar em um segmento de um componente visual (ex: uma barra em um gráfico de barras, uma célula em uma tabela), esse segmento atua como um filtro secundário.
    2. **TODOS** os outros componentes visuais na página são filtrados de acordo com a seleção.
    3. Para remover o filtro secundário, o usuário pode clicar novamente no mesmo segmento ou em uma área neutra fora do componente. A página então retorna ao seu estado de filtragem primária.
