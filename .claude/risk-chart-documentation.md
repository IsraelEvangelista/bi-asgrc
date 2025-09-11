# Documentação Técnica - Gráfico de Barras Horizontais Empilhadas

## 1. Visão Geral

### 1.1 Objetivo
Implementar um gráfico de barras horizontais empilhadas para visualização de classificação de riscos, onde cada barra representa 100% da largura disponível com segmentos proporcionais às quantidades de cada categoria.

### 1.2 Características Principais
- Barras horizontais com largura fixa (100%)
- Segmentos proporcionais dentro de cada barra
- Valores numéricos visíveis em cada segmento
- Total acumulado exibido à direita de cada barra
- Tooltip interativo com detalhes percentuais
- Cores categorizadas por nível de severidade

## 2. Estrutura de Dados

### 2.1 Formato dos Dados de Entrada
```javascript
const dados = {
  categorias: [
    {
      nome: "Conformidade",
      riscos: {
        critico: 3,
        alto: 5,
        medio: 3,
        baixo: 1
      }
    },
    {
      nome: "Estratégico",
      riscos: {
        critico: 8,
        alto: 21,
        medio: 2,
        baixo: 2
      }
    }
    // ... outras categorias
  ]
};
```

### 2.2 Estrutura Alternativa (Array de Arrays)
```javascript
const dadosAlternativos = {
  labels: ["Conformidade", "Estratégico", "Financeiro"],
  data: {
    critico: [3, 8, 1],
    alto: [5, 21, 3],
    medio: [3, 2, 1],
    baixo: [1, 2, 2]
  }
};
```

## 3. Implementação HTML/CSS

### 3.1 Estrutura HTML Base
```html
<div class="chart-container">
  <!-- Para cada categoria -->
  <div class="chart-row">
    <div class="category-label">{nome_categoria}</div>
    <div class="bar-container">
      <!-- Para cada segmento de risco -->
      <div class="bar-segment {classe_risco}" style="width: {percentual}%">
        <span>{quantidade}</span>
        <div class="tooltip">{detalhes}</div>
      </div>
    </div>
    <div class="total-label">{total}</div>
  </div>
</div>
```

### 3.2 Classes CSS Essenciais
```css
.chart-row {
  display: flex;
  align-items: center;
  gap: 15px;
}

.bar-container {
  flex: 1;
  display: flex;
  height: 35px;
}

.bar-segment {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Cores por severidade */
.critical { background: #dc3545; }
.high { background: #fd7e14; }
.medium { background: #ffc107; }
.low { background: #28a745; }
```

## 4. Lógica de Cálculo

### 4.1 Cálculo de Percentuais
```javascript
function calcularPercentuais(riscos) {
  const total = riscos.critico + riscos.alto + riscos.medio + riscos.baixo;
  
  return {
    critico: (riscos.critico / total) * 100,
    alto: (riscos.alto / total) * 100,
    medio: (riscos.medio / total) * 100,
    baixo: (riscos.baixo / total) * 100,
    total: total
  };
}
```

### 4.2 Renderização Dinâmica
```javascript
function renderizarGrafico(dados) {
  const container = document.querySelector('.chart-container');
  container.innerHTML = '';
  
  dados.categorias.forEach(categoria => {
    const percentuais = calcularPercentuais(categoria.riscos);
    const row = criarBarraHTML(categoria.nome, categoria.riscos, percentuais);
    container.appendChild(row);
  });
}

function criarBarraHTML(nome, riscos, percentuais) {
  const row = document.createElement('div');
  row.className = 'chart-row';
  
  row.innerHTML = `
    <div class="category-label">${nome}</div>
    <div class="bar-container">
      ${criarSegmento('critical', riscos.critico, percentuais.critico)}
      ${criarSegmento('high', riscos.alto, percentuais.alto)}
      ${criarSegmento('medium', riscos.medio, percentuais.medio)}
      ${criarSegmento('low', riscos.baixo, percentuais.baixo)}
    </div>
    <div class="total-label">${percentuais.total}</div>
  `;
  
  return row;
}

function criarSegmento(classe, valor, percentual) {
  if (valor === 0) return '';
  
  return `
    <div class="bar-segment ${classe}" style="width: ${percentual}%">
      <span>${valor}</span>
      <div class="tooltip">${getNomeRisco(classe)}: ${valor} (${percentual.toFixed(1)}%)</div>
    </div>
  `;
}
```

## 5. Implementação com Bibliotecas

### 5.1 Com Chart.js
```javascript
const config = {
  type: 'bar',
  data: {
    labels: categorias,
    datasets: [
      {
        label: 'Crítico',
        data: dadosCriticos,
        backgroundColor: '#dc3545'
      },
      // ... outros datasets
    ]
  },
  options: {
    indexAxis: 'y',
    scales: {
      x: {
        stacked: true,
        max: 100 // Para percentuais
      },
      y: {
        stacked: true
      }
    },
    plugins: {
      datalabels: {
        display: true,
        color: 'white',
        formatter: (value) => value > 0 ? value : ''
      }
    }
  }
};
```

### 5.2 Com D3.js
```javascript
const svg = d3.select('.chart-container')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

const xScale = d3.scaleLinear()
  .domain([0, 100])
  .range([0, chartWidth]);

const yScale = d3.scaleBand()
  .domain(categorias)
  .range([0, chartHeight])
  .padding(0.2);

// Criar grupos para cada categoria
const barGroups = svg.selectAll('.bar-group')
  .data(dados)
  .enter()
  .append('g')
  .attr('transform', d => `translate(0, ${yScale(d.categoria)})`);

// Adicionar segmentos empilhados
barGroups.selectAll('.segment')
  .data(d => d.segmentos)
  .enter()
  .append('rect')
  .attr('x', d => xScale(d.start))
  .attr('width', d => xScale(d.width))
  .attr('height', yScale.bandwidth())
  .attr('fill', d => getCorPorTipo(d.tipo));
```

## 6. Integração com Backend

### 6.1 Estrutura da API
```javascript
// Endpoint esperado
GET /api/riscos/dashboard

// Resposta esperada
{
  "success": true,
  "data": {
    "categorias": [
      {
        "id": 1,
        "nome": "Conformidade",
        "riscos": {
          "critico": 3,
          "alto": 5,
          "medio": 3,
          "baixo": 1
        },
        "total": 12
      }
    ],
    "timestamp": "2024-01-15T10:00:00Z"
  }
}
```

### 6.2 Fetch e Renderização
```javascript
async function carregarDados() {
  try {
    const response = await fetch('/api/riscos/dashboard');
    const data = await response.json();
    
    if (data.success) {
      renderizarGrafico(data.data);
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    mostrarMensagemErro();
  }
}
```

## 7. Responsividade

### 7.1 Breakpoints CSS
```css
@media (max-width: 768px) {
  .category-label {
    width: 80px;
    font-size: 12px;
  }
  
  .bar-segment span {
    font-size: 11px;
  }
  
  .total-label {
    width: 40px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .chart-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .category-label {
    width: 100%;
    text-align: left;
    margin-bottom: 5px;
  }
}
```

## 8. Acessibilidade

### 8.1 Atributos ARIA
```html
<div class="bar-container" role="img" aria-label="Gráfico de riscos de {categoria}">
  <div class="bar-segment" 
       role="presentation"
       aria-label="{valor} riscos críticos, {percentual}% do total">
  </div>
</div>
```

### 8.2 Suporte a Leitores de Tela
```javascript
function adicionarDescricaoAcessivel(elemento, categoria, riscos) {
  const descricao = `${categoria} possui ${riscos.total} riscos: 
    ${riscos.critico} críticos, 
    ${riscos.alto} altos, 
    ${riscos.medio} médios, 
    ${riscos.baixo} baixos`;
  
  elemento.setAttribute('aria-description', descricao);
}
```

## 9. Performance

### 9.1 Otimizações
- Usar `requestAnimationFrame` para animações
- Implementar virtualização para grandes conjuntos de dados
- Cachear cálculos de percentuais
- Usar CSS transforms ao invés de mudanças de width para animações

### 9.2 Exemplo de Otimização
```javascript
// Cache de cálculos
const percentualCache = new Map();

function getPercentualCached(categoria) {
  const key = JSON.stringify(categoria);
  
  if (!percentualCache.has(key)) {
    percentualCache.set(key, calcularPercentuais(categoria.riscos));
  }
  
  return percentualCache.get(key);
}

// Debounce para redimensionamento
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    ajustarGrafico();
  }, 250);
});
```

## 10. Testes

### 10.1 Casos de Teste
```javascript
describe('Gráfico de Riscos', () => {
  test('Calcula percentuais corretamente', () => {
    const riscos = { critico: 2, alto: 3, medio: 4, baixo: 1 };
    const resultado = calcularPercentuais(riscos);
    
    expect(resultado.critico).toBe(20);
    expect(resultado.alto).toBe(30);
    expect(resultado.medio).toBe(40);
    expect(resultado.baixo).toBe(10);
    expect(resultado.total).toBe(10);
  });
  
  test('Renderiza barras com largura 100%', () => {
    const container = renderizarGrafico(dadosTeste);
    const barras = container.querySelectorAll('.bar-container');
    
    barras.forEach(barra => {
      const larguraTotal = Array.from(barra.children)
        .reduce((sum, seg) => sum + parseFloat(seg.style.width), 0);
      expect(larguraTotal).toBeCloseTo(100);
    });
  });
});
```

## 11. Checklist de Implementação

- [ ] Estrutura HTML base criada
- [ ] Classes CSS implementadas
- [ ] Cores definidas para cada nível de risco
- [ ] Lógica de cálculo de percentuais implementada
- [ ] Renderização dinâmica funcionando
- [ ] Tooltips implementados
- [ ] Integração com API/backend
- [ ] Responsividade testada
- [ ] Acessibilidade verificada
- [ ] Performance otimizada
- [ ] Testes unitários escritos
- [ ] Documentação do código
- [ ] Deploy em ambiente de teste

## 12. Considerações Finais

### Pontos de Atenção
1. Garantir que a soma dos percentuais seja sempre 100%
2. Tratar casos onde alguma categoria tem valor 0
3. Manter consistência visual entre diferentes navegadores
4. Considerar limites de dados (máximo de categorias visíveis)
5. Implementar fallback para navegadores sem suporte a flexbox

### Melhorias Futuras
- Animações de entrada/transição
- Exportação do gráfico (PNG/PDF)
- Modo de comparação temporal
- Drill-down para detalhes de cada risco
- Temas customizáveis (dark mode)