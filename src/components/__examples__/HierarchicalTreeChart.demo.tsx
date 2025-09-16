import React, { useState, useMemo } from 'react';
import HierarchicalTreeChart from '../HierarchicalTreeChart';
import { TreeNodeData, HierarchyNode } from '../../types/tree';
import { 
  createTreeFromPortfolioData, 
  getTreeSummary, 
  transformPortfolioHierarchyData,
  validateTreeStructure,
  filterTreeData
} from '../../utils/treeDataTransform';

// Dados reais do PortfolioAcoes.tsx (duplicados aqui para demonstração)
const portfolioData: HierarchyNode[] = [
  {
    id: 'nivel1-1',
    nome: 'Gerência de Riscos',
    nivel: 1,
    severidade: 18.4,
    totalAcoes: 15,
    expandido: false,
    children: [
      {
        id: 'nivel2-1',
        nome: 'Riscos de Mercado',
        nivel: 2,
        severidade: 20.1,
        totalAcoes: 8,
        expandido: false,
        children: [
          { id: 'nivel3-1', nome: 'Risco de Taxa de Juros', nivel: 3, severidade: 22.5, totalAcoes: 3, expandido: false, children: [] },
          { id: 'nivel3-2', nome: 'Risco de Câmbio', nivel: 3, severidade: 17.8, totalAcoes: 5, expandido: false, children: [] }
        ]
      },
      {
        id: 'nivel2-2',
        nome: 'Riscos Operacionais',
        nivel: 2,
        severidade: 16.2,
        totalAcoes: 7,
        expandido: false,
        children: [
          { id: 'nivel3-3', nome: 'Processos Internos', nivel: 3, severidade: 15.1, totalAcoes: 4, expandido: false, children: [] },
          { id: 'nivel3-4', nome: 'Tecnologia da Informação', nivel: 3, severidade: 18.3, totalAcoes: 3, expandido: false, children: [] }
        ]
      }
    ]
  },
  {
    id: 'nivel1-2',
    nome: 'Gerência de Compliance',
    nivel: 1,
    severidade: 12.7,
    totalAcoes: 12,
    expandido: false,
    children: [
      {
        id: 'nivel2-3',
        nome: 'Conformidade Regulatória',
        nivel: 2,
        severidade: 14.2,
        totalAcoes: 7,
        expandido: false,
        children: [
          { id: 'nivel3-5', nome: 'BACEN', nivel: 3, severidade: 16.1, totalAcoes: 4, expandido: false, children: [] },
          { id: 'nivel3-6', nome: 'CVM', nivel: 3, severidade: 12.3, totalAcoes: 3, expandido: false, children: [] }
        ]
      }
    ]
  }
];

// Componente de demonstração
const HierarchicalTreeChartDemo: React.FC = () => {
  const [viewMode, setViewMode] = useState<'portfolio' | 'original'>('portfolio');
  const [filterSeverity, setFilterSeverity] = useState<string>('todas');
  const [filterLevel, setFilterLevel] = useState<string>('todas');
  
  // Transformar dados do Portfolio usando as novas funções
  const { tree: portfolioTree, validation } = createTreeFromPortfolioData(portfolioData, "Portfólio de Ações - Demo");
  
  // Aplicar filtros
  const filteredTree = useMemo(() => {
    if (filterSeverity === 'todas' && filterLevel === 'todas') {
      return portfolioTree;
    }
    
    return filterTreeData(portfolioTree, (node) => {
      // Filtro de severidade
      if (filterSeverity !== 'todas' && node.severity !== filterSeverity) {
        return false;
      }
      
      // Filtro de nível
      if (filterLevel !== 'todas' && node.nivel !== parseInt(filterLevel)) {
        return false;
      }
      
      return true;
    }) || portfolioTree;
  }, [portfolioTree, filterSeverity, filterLevel]);
  
  const treeSummary = getTreeSummary(filteredTree);

  const handleNodeClick = (nodeData: any, event: React.MouseEvent) => {
    console.log('Nó clicado:', nodeData.name);
    console.log('Dados completos do nó:', nodeData);
    console.log('Severidade original:', nodeData.attributes?.severidadeNumerica);
  };

  const handleNodeMouseOver = (nodeData: any, event: React.MouseEvent) => {
    console.log('Mouse over nó:', nodeData.name, '- Severidade:', nodeData.severity || nodeData.attributes?.severity);
  };

  const handleNodeMouseOut = (nodeData: any, event: React.MouseEvent) => {
    console.log('Mouse out nó:', nodeData.name);
  };

  return (
    <div style={{ width: '100%', minHeight: '800px', padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', textAlign: 'center', color: '#1f2937' }}>
        Demonstração - Árvore Hierárquica com Dados do Portfolio
      </h2>
      
      {/* Controles de demonstração */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280' }}>
            Filtrar por Severidade:
          </label>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            style={{ 
              padding: '6px 12px', 
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="todas">Todas</option>
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280' }}>
            Filtrar por Nível:
          </label>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            style={{ 
              padding: '6px 12px', 
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="todas">Todos</option>
            <option value="1">Nível 1</option>
            <option value="2">Nível 2</option>
            <option value="3">Nível 3</option>
          </select>
        </div>
        
        <button
          onClick={() => {
            setFilterSeverity('todas');
            setFilterLevel('todas');
          }}
          style={{ 
            padding: '6px 12px', 
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: '#f3f4f6',
            cursor: 'pointer'
          }}
        >
          Limpar Filtros
        </button>
      </div>

      {/* Informações de validação */}
      {!validation.isValid && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '12px', 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fecaca',
          borderRadius: '6px',
          color: '#dc2626'
        }}>
          <strong>Erros de validação:</strong>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            {validation.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '12px', 
          backgroundColor: '#fffbeb', 
          border: '1px solid #fed7aa',
          borderRadius: '6px',
          color: '#d97706'
        }}>
          <strong>Avisos:</strong>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            {validation.warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Resumo da árvore */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '16px', 
        backgroundColor: '#f8fafc', 
        borderRadius: '8px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px'
      }}>
        <div>
          <strong>Total de Nós:</strong> {treeSummary.totalNodes}
        </div>
        <div>
          <strong>Total de Ações:</strong> {treeSummary.totalActions}
        </div>
        <div>
          <strong>Profundidade Máxima:</strong> {treeSummary.maxDepth}
        </div>
        <div>
          <strong>Distribuição de Severidade:</strong>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>
            {Object.entries(treeSummary.severityDistribution).map(([severity, count]) => (
              <div key={severity}>{severity}: {count}</div>
            ))}
          </div>
        </div>
      </div>
      
      <div style={{ 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px', 
        overflow: 'hidden',
        height: '500px'
      }}>
        <HierarchicalTreeChart
          data={filteredTree}
          onNodeClick={handleNodeClick}
          onNodeMouseOver={handleNodeMouseOver}
          onNodeMouseOut={handleNodeMouseOut}
          showDetails={true}
          config={{
            initialDepth: 2,
            orientation: 'vertical',
            translate: { x: 400, y: 80 },
            zoom: 0.8,
            collapsible: true,
            nodeSize: { x: 220, y: 140 },
            useCardNodes: true,
            showSeverityIcons: true,
            enableNodeAnimations: true,
            enableResponsiveLayout: true,
            cardPadding: 12,
            cardSpacing: 8,
            transitionDuration: 600
          }}
        />
      </div>
      
      <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '14px' }}>
          🚀 Funcionalidades Avançadas - HierarchicalTreeChart v2.0:
        </h3>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b7280', fontSize: '12px' }}>
          <li><strong>🎨 Nós em Formato Card:</strong> Design moderno com retângulos arredondados, gradientes e bordas</li>
          <li><strong>🌈 Gradientes Dinâmicos:</strong> Backgrounds gradientes baseados na severidade (verde→amarelo→laranja→vermelho)</li>
          <li><strong>📏 Tamanhos Adaptativos:</strong> Dimensões calculadas automaticamente baseadas na severidade e nível hierárquico</li>
          <li><strong>🎯 Ícones de Severidade:</strong> Símbolos SVG únicos para cada categoria (escudo, estrela, check, relógio)</li>
          <li><strong>🔤 Texto Contraste:</strong> Cores de texto automáticas para garantir legibilidade (branco/escuro)</li>
          <li><strong>📊 Layout Estruturado:</strong> Header destacado + conteúdo organizado (nome, severidade, ações, %)</li>
          <li><strong>✨ Efeitos Visuais:</strong> Sombras 3D, hover animations, transições suaves e seleção destacada</li>
          <li><strong>🏗️ Hierarquia Visual:</strong> Bordas diferenciadas por nível (sólido/dashed), opacidade gradual e pesos de fonte</li>
          <li><strong>🔄 Indicador de Filhos:</strong> Badge interativo com contador de filhos e clique para expandir/colapsar</li>
          <li><strong>🎛️ Configurações Flexíveis:</strong> Ativação/desativação de animações, ícones e layout responsivo</li>
        </ul>
        
        <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#e0f2fe', borderRadius: '4px' }}>
          <strong style={{ color: '#0369a1', fontSize: '12px' }}>🧪 Console Debug:</strong>
          <span style={{ color: '#075985', fontSize: '11px', marginLeft: '8px' }}>
            Abra o Console do Developer Tools para ver logs detalhados das interações com os nós
          </span>
        </div>

        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#92400e', fontSize: '13px' }}>
            📋 Comparação Visual vs. Versão Anterior:
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
            <div style={{ padding: '8px', backgroundColor: '#fffbeb', borderRadius: '4px' }}>
              <strong style={{ color: '#92400e', fontSize: '11px' }}>Versão 1.0 (Círculos):</strong>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', color: '#78350f', fontSize: '10px' }}>
                <li>• Círculos simples com cores sólidas</li>
                <li>• Texto abaixo do círculo</li>
                <li>• Sem gradientes ou sombras</li>
                <li>• Tamanho fixo por severidade</li>
              </ul>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#f0fdf4', borderRadius: '4px' }}>
              <strong style={{ color: '#166534', fontSize: '11px' }}>Versão 2.0 (Cards):</strong>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', color: '#166534', fontSize: '10px' }}>
                <li>• Cards retangulares com gradientes</li>
                <li>• Layout estruturado com header</li>
                <li>• Sombras 3D e bordas elegantes</li>
                <li>• Tamanhos dinâmicos e adaptativos</li>
              </ul>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#f0fdf4', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#166534', fontSize: '13px' }}>
            🎛️ Configurações Disponíveis:
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '8px' }}>
            <div style={{ fontSize: '10px', color: '#166534' }}>
              <strong>useCardNodes:</strong> true/false<br/>
              <strong>showSeverityIcons:</strong> true/false<br/>
              <strong>enableNodeAnimations:</strong> true/false
            </div>
            <div style={{ fontSize: '10px', color: '#166534' }}>
              <strong>enableKeyboardNavigation:</strong> true/false<br/>
              <strong>enableMouseWheelZoom:</strong> true/false<br/>
              <strong>enableDragPan:</strong> true/false
            </div>
            <div style={{ fontSize: '10px', color: '#166534' }}>
              <strong>zoomSensitivity:</strong> número (0.1)<br/>
              <strong>panSensitivity:</strong> número (1.0)<br/>
              <strong>scaleExtent:</strong> &#123; min, max &#125;
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HierarchicalTreeChartDemo;