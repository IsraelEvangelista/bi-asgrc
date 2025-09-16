import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { ChevronDown, ChevronRight, TrendingUp, AlertTriangle, Target, Briefcase, Filter, RotateCcw, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { useAcoesStats } from '../hooks/useAcoesStats';
import { useRiscosStats } from '../hooks/useRiscosStats';
import { useSeveridadePorAcao } from '../hooks/useSeveridadePorAcao';
import Layout from '../components/Layout';
import HierarchicalTreeChart from '../components/HierarchicalTreeChart';
import { 
  createTreeFromPortfolioData, 
  getTreeSummary, 
  transformPortfolioHierarchyData,
  validateTreeStructure,
  filterTreeData,
  updateNodeExpansionState,
  extractExpandedNodeIds
} from '../utils/treeDataTransform';
import { HierarchyNode } from '../types/tree';

// Opções de atributos de quebra disponíveis
const BREAK_ATTRIBUTES = [
  { id: 'departamento', label: 'Departamento', description: 'Quebrar por estrutura departamental' },
  { id: 'severidade', label: 'Severidade', description: 'Quebrar por nível de severidade' },
  { id: 'responsavel', label: 'Responsável', description: 'Quebrar por responsável da ação' },
  { id: 'status', label: 'Status', description: 'Quebrar por status da ação' },
  { id: 'risco', label: 'Tipo de Risco', description: 'Quebrar por tipo de risco' }
];

const METRIC_OPTIONS = [
  { id: 'totalAcoes', label: 'Total de Ações', aggregation: 'count' },
  { id: 'mediaSeveridade', label: 'Média de Severidade', aggregation: 'avg' },
  { id: 'totalRiscos', label: 'Total de Riscos', aggregation: 'count' }
];

// Dados mock seguindo padrão das outras interfaces
const mockData = {
  totalAcoes: 47,
  totalRiscos: 128,
  mediaSeveridade: 14.6,
  severidadeData: [
    { name: 'Muito Alto', value: 12, color: '#ef4444' },
    { name: 'Alto', value: 18, color: '#f97316' },
    { name: 'Moderado', value: 25, color: '#eab308' },
    { name: 'Baixo', value: 34, color: '#22c55e' }
  ],
  acoesSeveridade: [
    { id: 1, acao: 'Implementação de Controles de Liquidez', responsavel: 'João Silva', severidade: 18, status: 'Em Andamento', prazo: '2024-03-15', progresso: 65, risco: 'Risco de Liquidez' },
    { id: 2, acao: 'Revisão de Processos Operacionais', responsavel: 'Maria Santos', severidade: 22, status: 'Concluída', prazo: '2024-02-28', progresso: 100, risco: 'Risco Operacional' },
    { id: 3, acao: 'Atualização de Compliance Regulatório', responsavel: 'Carlos Oliveira', severidade: 8, status: 'Planejada', prazo: '2024-04-30', progresso: 15, risco: 'Risco Regulatório' },
    { id: 4, acao: 'Monitoramento de Crédito', responsavel: 'Ana Costa', severidade: 16, status: 'Em Andamento', prazo: '2024-03-20', progresso: 45, risco: 'Risco de Crédito' },
    { id: 5, acao: 'Segurança da Informação', responsavel: 'Pedro Lima', severidade: 19, status: 'Em Andamento', prazo: '2024-05-10', progresso: 30, risco: 'Risco Operacional' }
  ],
  hierarquiaData: [
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
  ]
};


const PortfolioAcoes: React.FC = () => {
  // Hooks para dados reais
  const { totalAcoes, loading: loadingAcoes, error: errorAcoes } = useAcoesStats();
  const { totalRiscos, mediaSeveridade, loading: loadingRiscos, error: errorRiscos } = useRiscosStats();
  const { severidadeAcoes, loading: loadingSeveridade, error: errorSeveridade } = useSeveridadePorAcao();
  
  // Debug logs
  
  
  const [activeTab, setActiveTab] = useState<'severidade'>('severidade');
  // Estado para controlar a visão ativa da tabela
  const [activeView, setActiveView] = useState<'acao' | 'natureza' | 'categoria'>('acao');
  // Estado para busca por texto
  const [searchTerm, setSearchTerm] = useState('');
  // Ordenação da tabela Severidade da Ação
  const [sortBy, setSortBy] = useState<'acao' | 'descricao' | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const toggleSort = (column: 'acao' | 'descricao') => {
    setSortBy(prev => {
      if (prev === column) {
        setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortDir('asc');
      return column;
    });
  };

  // Dados transformados para o gráfico de barras (Severidade por Ação)
  const chartData = useMemo(() => (
    (severidadeAcoes || []).map(item => ({
      acao: item.sigla_acao,
      severidade: item.media_severidade
    }))
  ), [severidadeAcoes]);

  // Linhas de referência por classificação (partindo da barra mais alta para a direita)
  const severityLines = useMemo(() => {
    if (!severidadeAcoes || severidadeAcoes.length === 0) return [] as Array<never>;
    const lastLabel = severidadeAcoes[severidadeAcoes.length - 1].sigla_acao;
    const bands = [
      { name: 'Muito Alto', color: '#dc2626', min: 20, max: 25 },
      { name: 'Alto',        color: '#ea580c', min: 10, max: 19 },
      { name: 'Moderado',    color: '#ca8a04', min:  5, max:  9 },
      { name: 'Baixo',       color: '#16a34a', min:  1, max:  4 },
    ];
    return bands.map(b => {
      let max = -Infinity; let start: string | null = null;
      for (const it of severidadeAcoes) {
        const v = it.media_severidade;
        if (v >= b.min && v <= b.max) {
          if (v > max) { max = v; start = it.sigla_acao; }
        }
      }
      if (start == null) return null;
      return { label: b.name, color: b.color, value: max, start, end: lastLabel };
    }).filter(Boolean) as { label: string; color: string; value: number; start: string; end: string; }[];
  }, [severidadeAcoes]);

  // Dados ordenados para a tabela (Ação/Descrição)
  const sortedSeveridadeAcoes = useMemo(() => {
    const arr = [...severidadeAcoes];
    if (!sortBy) return arr;
    return arr.sort((a, b) => {
      if (sortBy === 'acao') {
        const aKey = (a.sigla_acao || '').toString().toLowerCase();
        const bKey = (b.sigla_acao || '').toString().toLowerCase();
        const cmp = aKey.localeCompare(bKey, 'pt-BR');
        return sortDir === 'asc' ? cmp : -cmp;
      }
      const cmp = (a.media_severidade || 0) - (b.media_severidade || 0);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [severidadeAcoes, sortBy, sortDir]);
  
  // Estados para funcionalidade de quebra (Power BI style)
  const [selectedBreakAttribute, setSelectedBreakAttribute] = useState<string>('departamento');
  const [selectedMetric, setSelectedMetric] = useState<string>('totalAcoes');
  const [activeBreakNodes, setActiveBreakNodes] = useState<Set<string>>(new Set());
  const [breakHierarchy, setBreakHierarchy] = useState<HierarchyNode[]>([]);
  
  // Dados temporários para hierarquia (será implementado futuramente)
  const hierarquiaDataTemp: HierarchyNode[] = [
    {
      id: '1',
      nome: 'Diretoria Executiva',
      nivel: 1,
      severidade: 16.5,
      totalAcoes: 12,
      expandido: false,
      children: [
        {
          id: '1-1',
          nome: 'Gerência de TI',
          nivel: 2,
          severidade: 18.2,
          totalAcoes: 5,
          expandido: false,
          children: []
        },
        {
          id: '1-2',
          nome: 'Gerência Financeira',
          nivel: 2,
          severidade: 14.8,
          totalAcoes: 7,
          expandido: false,
          children: []
        }
      ]
    }
  ];
  
  // Estado para dados da hierarquia
  const [hierarquiaData, setHierarquiaData] = useState<HierarchyNode[]>(hierarquiaDataTemp);
  
  // Lógica para criar hierarquia dinâmica baseada no atributo de quebra selecionado
  const breakHierarchyData = useMemo(() => {
    if (selectedBreakAttribute === 'departamento') {
      return [
        {
          id: 'break-1',
          nome: 'Gerência de Riscos',
          nivel: 1,
          severidade: 18.4,
          totalAcoes: 15,
          expandido: true,
          children: [
            {
              id: 'break-1-1',
              nome: 'Riscos de Mercado',
              nivel: 2,
              severidade: 20.1,
              totalAcoes: 8,
              expandido: false,
              children: [
                { id: 'break-1-1-1', nome: 'Risco de Taxa de Juros', nivel: 3, severidade: 22.5, totalAcoes: 3, expandido: false, children: [] },
                { id: 'break-1-1-2', nome: 'Risco de Câmbio', nivel: 3, severidade: 17.8, totalAcoes: 5, expandido: false, children: [] }
              ]
            },
            {
              id: 'break-1-2',
              nome: 'Riscos Operacionais',
              nivel: 2,
              severidade: 16.2,
              totalAcoes: 7,
              expandido: false,
              children: [
                { id: 'break-1-2-1', nome: 'Processos Internos', nivel: 3, severidade: 15.1, totalAcoes: 4, expandido: false, children: [] },
                { id: 'break-1-2-2', nome: 'Tecnologia da Informação', nivel: 3, severidade: 18.3, totalAcoes: 3, expandido: false, children: [] }
              ]
            }
          ]
        },
        {
          id: 'break-2',
          nome: 'Gerência de Compliance',
          nivel: 1,
          severidade: 12.7,
          totalAcoes: 12,
          expandido: true,
          children: [
            {
              id: 'break-2-1',
              nome: 'Conformidade Regulatória',
              nivel: 2,
              severidade: 14.2,
              totalAcoes: 7,
              expandido: false,
              children: [
                { id: 'break-2-1-1', nome: 'BACEN', nivel: 3, severidade: 16.1, totalAcoes: 4, expandido: false, children: [] },
                { id: 'break-2-1-2', nome: 'CVM', nivel: 3, severidade: 12.3, totalAcoes: 3, expandido: false, children: [] }
              ]
            }
          ]
        }
      ];
    } else if (selectedBreakAttribute === 'severidade') {
      return [
        {
          id: 'break-1',
          nome: 'Muito Alto (20+)',
          nivel: 1,
          severidade: 22.3,
          totalAcoes: 8,
          expandido: true,
          children: [
            { id: 'break-1-1', nome: 'Risco de Taxa de Juros', nivel: 2, severidade: 22.5, totalAcoes: 3, expandido: false, children: [] },
            { id: 'break-1-2', nome: 'Risco de Liquidez', nivel: 2, severidade: 22.1, totalAcoes: 5, expandido: false, children: [] }
          ]
        },
        {
          id: 'break-2',
          nome: 'Alto (10-19.9)',
          nivel: 1,
          severidade: 15.2,
          totalAcoes: 12,
          expandido: true,
          children: [
            { id: 'break-2-1', nome: 'Risco Operacional', nivel: 2, severidade: 18.3, totalAcoes: 7, expandido: false, children: [] },
            { id: 'break-2-2', nome: 'Risco de Crédito', nivel: 2, severidade: 12.1, totalAcoes: 5, expandido: false, children: [] }
          ]
        },
        {
          id: 'break-3',
          nome: 'Moderado (5-9.9)',
          nivel: 1,
          severidade: 7.8,
          totalAcoes: 5,
          expandido: true,
          children: [
            { id: 'break-3-1', nome: 'Risco Regulatório', nivel: 2, severidade: 7.8, totalAcoes: 5, expandido: false, children: [] }
          ]
        }
      ];
    }
    
    // Fallback para dados originais
    return hierarquiaDataTemp;
  }, [selectedBreakAttribute]);
  
  // Estado centralizado para IDs de nós expandidos - compatível com HierarchicalTreeChart
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());
  
  // Dados para árvore hierárquica com transformação compatível
  const { tree: portfolioTree, validation } = useMemo(() => {
    // Usar dados da hierarquia de quebra selecionada
    const treeData = activeTab === 'hierarquia' ? breakHierarchyData : hierarquiaData;
    const transformedData = treeData.map(node => ({
      ...node,
      id: node.id,
      children: node.children
    }));
    
    return createTreeFromPortfolioData(transformedData, "Portfólio de Ações - Quebra por " + selectedBreakAttribute);
  }, [hierarquiaData, breakHierarchyData, activeTab, selectedBreakAttribute]);
  
  // Árvore com estado de expansão aplicado
  const treeWithExpansionState = useMemo(() => {
    return updateNodeExpansionState(portfolioTree, expandedNodeIds);
  }, [portfolioTree, expandedNodeIds]);
  
  // Estatísticas da árvore
  const treeSummary = useMemo(() => {
    return getTreeSummary(treeWithExpansionState);
  }, [treeWithExpansionState]);
  
  // Sincronização bidirecional: Quando PortfolioAcoes muda de estado, atualizar expandedNodeIds
  const handleHierarchyToggle = useCallback((nodeId: string) => {
    setExpandedNodeIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);
  
  // Sincronização bidirecional: Quando HierarchicalTreeChart muda de estado, atualizar hierarquiaData
  const handleNodeExpansionChange = useCallback((newExpandedIds: string[]) => {
    setExpandedNodeIds(new Set(newExpandedIds));
    
    // Atualizar hierarquiaData para manter consistência com a árvore
    setHierarquiaData(prevData => {
      const updateExpansion = (nodes: HierarchyNode[]): HierarchyNode[] => {
        return nodes.map(node => {
          const isExpanded = newExpandedIds.includes(node.id);
          const updatedNode = { ...node, expandido: isExpanded };
          
          if (node.children.length > 0) {
            updatedNode.children = updateExpansion(node.children);
          }
          
          return updatedNode;
        });
      };
      
      return updateExpansion(prevData);
    });
  }, []);

  // Lógica para clique nos nós com funcionalidade de métrica (Power BI style)
  const handleBreakNodeClick = useCallback((nodeData: any, evt: React.MouseEvent) => {
    console.log('Nó de quebra clicado:', nodeData.name);
    
    // Adicionar/remover nó da lista de nós ativos
    setActiveBreakNodes(prev => {
      const newSet = new Set(prev);
      const nodeId = nodeData.id || nodeData.attributes?.id;
      
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      
      return newSet;
    });
    
    // Atualizar métricas baseado nos nós selecionados
    updateMetricsBasedOnSelection();
  }, []);

  // Calcular métricas baseadas na seleção atual
  const calculateSelectedMetrics = useCallback(() => {
    // Se não há nós expandidos, mostrar totais gerais
    if (expandedNodeIds.size === 0) {
      return {
        totalAcoes: totalAcoes || 0,
        totalRiscos: totalRiscos || 0,
        mediaSeveridade: mediaSeveridade || 0,
        totalNodes: treeSummary.totalNodes,
        maxDepth: treeSummary.maxDepth,
        severityDistribution: treeSummary.severityDistribution
      };
    }

    // Calcular métricas baseadas nos nós expandidos
    let totalAcoesCalc = 0;
    let totalRiscosCalc = 0;
    let sumSeveridade = 0;
    let countNodes = 0;
    let maxDepth = 0;
    const severityDist = { critica: 0, alta: 0, media: 0, baixa: 0 };

    // Função recursiva para agregar métricas dos nós expandidos
    const aggregateExpandedMetrics = (nodes: HierarchyNode[], currentDepth: number = 1) => {
      nodes.forEach(node => {
        const isExpanded = expandedNodeIds.has(node.id);
        
        if (isExpanded || expandedNodeIds.size === 0) {
          totalAcoesCalc += node.totalAcoes || 0;
          totalRiscosCalc += Math.floor((node.totalAcoes || 0) * 0.8);
          sumSeveridade += node.severidade || 0;
          countNodes++;
          
          // Atualizar profundidade máxima
          maxDepth = Math.max(maxDepth, currentDepth);
          
          // Classificar severidade
          if (node.severidade >= 20) severityDist.critica++;
          else if (node.severidade >= 10) severityDist.alta++;
          else if (node.severidade >= 5) severityDist.media++;
          else severityDist.baixa++;
        }
        
        // Se o nó está expandido, incluir seus filhos
        if (isExpanded && node.children.length > 0) {
          aggregateExpandedMetrics(node.children, currentDepth + 1);
        }
      });
    };

    aggregateExpandedMetrics(breakHierarchyData);

    return {
      totalAcoes: totalAcoesCalc,
      totalRiscos: totalRiscosCalc,
      mediaSeveridade: countNodes > 0 ? sumSeveridade / countNodes : 0,
      totalNodes: countNodes,
      maxDepth: maxDepth,
      severityDistribution: severityDist
    };
  }, [expandedNodeIds, breakHierarchyData, totalAcoes, totalRiscos, mediaSeveridade, treeSummary]);

  // Atualizar métricas quando a seleção muda
  const updateMetricsBasedOnSelection = useCallback(() => {
    const metrics = calculateSelectedMetrics();
    // Aqui você pode atualizar o estado ou exibir as métricas calculadas
    console.log('Métricas atualizadas:', metrics);
  }, [calculateSelectedMetrics]);

  // Métricas calculadas baseadas na seleção
  const selectedMetrics = calculateSelectedMetrics();

  // Função para calcular classificação de severidade
  const getSeverityLabel = (severidade: number): string => {
    if (severidade >= 20) return 'Muito Alto';
    if (severidade >= 10 && severidade < 20) return 'Alto';
    if (severidade >= 5 && severidade < 10) return 'Moderado';
    return 'Baixo';
  };

  // Função para obter cor da severidade
  const getSeverityClass = (severidade: number): string => {
    if (severidade >= 20) return 'bg-red-100 text-red-800';
    if (severidade >= 10) return 'bg-orange-100 text-orange-800';
    if (severidade >= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getSeveridadeColor = (severidade: number): string => {
    if (severidade >= 20) return 'text-red-600 bg-red-50 border-red-200';
    if (severidade >= 10) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (severidade >= 5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  // Cor (hex) para barras da tabela, seguindo o mesmo padrão visual do gráfico
  const getSeverityHex = (severidade: number): string => {
    if (severidade >= 20 && severidade <= 25) return '#dc2626'; // Vermelho - Muito Alto
    if (severidade >= 10 && severidade <= 19) return '#ea580c'; // Laranja - Alto
    if (severidade >= 5 && severidade <= 9) return '#ca8a04';   // Amarelo - Moderado
    if (severidade >= 1 && severidade <= 4) return '#16a34a';   // Verde - Baixo
    return '#6b7280';
  };

  // Converte severidade (1..25) para percentual (0..100)
  const severityToPercent = (severidade: number): number => {
    const clamped = Math.max(1, Math.min(25, severidade));
    return ((clamped - 1) / 24) * 100;
  };

  // Função para expandir/colapsar nós da árvore hierárquica
  const toggleHierarchyNode = (nodeId: string, nodes: HierarchyNode[]): HierarchyNode[] => {
    return nodes.map(node => {
      if (node.id === nodeId) {
        return { ...node, expandido: !node.expandido };
      } else if (node.children.length > 0) {
        return { ...node, children: toggleHierarchyNode(nodeId, node.children) };
      }
      return node;
    });
  };

  // Handlers para interatividade avançada
  const handleNodeClick = useCallback((nodeData: any, evt: React.MouseEvent) => {
    console.log('Nó clicado:', nodeData.name);
    console.log('Dados completos do nó:', nodeData);
    console.log('Severidade original:', nodeData.attributes?.severidadeNumerica);
  }, []);

  const handleNodeMouseOver = useCallback((nodeData: any, evt: React.MouseEvent) => {
    console.log('Mouse over nó:', nodeData.name, '- Severidade:', nodeData.severity || nodeData.attributes?.severity);
  }, []);

  const handleNodeMouseOut = useCallback((nodeData: any, evt: React.MouseEvent) => {
    console.log('Mouse out nó:', nodeData.name);
  }, []);

  const handleZoomChange = useCallback((zoom: number, translate: { x: number; y: number }) => {
    console.log('Zoom alterado:', zoom, 'Translate:', translate);
  }, []);

  // Componente para renderizar nó da árvore hierárquica
  const HierarchyNodeItem: React.FC<{ node: HierarchyNode; level: number }> = ({ node, level }) => (
    <div className={`${level > 1 ? 'ml-6' : ''}`}>
      <div
        className={`flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-l-2 ${
          level === 1 ? 'border-blue-300 bg-blue-25' : level === 2 ? 'border-green-300 bg-green-25' : 'border-gray-300'
        }`}
        onClick={() => handleHierarchyToggle(node.id)}
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            {node.children.length > 0 ? (
              node.expandido ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )
            ) : (
              <div className="w-4 h-4" />
            )}
          </div>
          <span className={`font-medium ${level === 1 ? 'text-lg text-blue-800' : level === 2 ? 'text-base text-green-700' : 'text-sm text-gray-700'}`}>
            {node.nome}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`px-2 py-1 text-xs font-semibold rounded border ${getSeveridadeColor(node.severidade)}`}>
            Severidade: {node.severidade.toFixed(1)}
          </span>
          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
            {node.totalAcoes} ações
          </span>
        </div>
      </div>
      {node.expandido && node.children.map(child => (
        <HierarchyNodeItem key={child.id} node={child} level={level + 1} />
      ))}
    </div>
  );

  return (
    <Layout>
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Briefcase className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Portfólio de Ações</h1>
            </div>
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Ações</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loadingAcoes ? '...' : errorAcoes ? 'Erro' : totalAcoes}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Riscos</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loadingRiscos ? '...' : errorRiscos ? 'Erro' : totalRiscos}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Média de Severidade</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loadingRiscos ? '...' : errorRiscos ? 'Erro' : mediaSeveridade}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Linha 2: Gráfico de Barras Verticais - Diagrama de Severidade */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Severidade por Ação</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSeveridade ? (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">Carregando dados...</p>
              </div>
            ) : errorSeveridade ? (
              <div className="h-80 flex items-center justify-center">
                <p className="text-red-500">Erro ao carregar dados: {errorSeveridade}</p>
              </div>
            ) : severidadeAcoes.length === 0 ? (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">Nenhum dado encontrado</p>
              </div>
            ) : (
              <div className="h-[250px] w-full overflow-x-auto bg-white rounded-lg border">
                {/*
                  Ajuste de largura: reduzimos a largura mínima por categoria
                  para aproximar as barras. Antes: length * 60. Agora: length * 28.
                  Mantemos 1200px como mínimo para casos com poucas barras.
                */}
                <div style={{ minWidth: Math.max(1200, severidadeAcoes.length * 24), height: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={chartData}
                      margin={{ top: 15, right: 30, left: 20, bottom: -20 }}
                      /* Gap entre categorias praticamente zero para aproximar as barras */
                      barCategoryGap="0%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                      <XAxis 
                        dataKey="acao" 
                        angle={-90}
                        textAnchor="end"
                        height={60}
                        interval={0}
                        fontSize={10}
                        stroke="#374151"
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        label={{ 
                          value: 'Média de Severidade', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { textAnchor: 'middle' }
                        }}
                        fontSize={10}
                        stroke="#374151"
                      />
                      <Tooltip 
                        formatter={(value: number) => [value.toFixed(2), 'Média de Severidade']}
                        labelFormatter={(label) => `Ação: ${label}`}
                        contentStyle={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px'
                        }}
                      />
                      {/*
                        Reduz ligeiramente a largura de cada barra para melhorar a densidade visual.
                        Usamos barSize fixo (18px) ao invés de apenas maxBarSize.
                      */}
                      <Bar dataKey="severidade" radius={[2, 2, 0, 0]} barSize={16} maxBarSize={16}>
                        {severidadeAcoes.map((entry, index) => {
                          const getSeverityColor = (severidade: number): string => {
                            if (severidade >= 20 && severidade <= 25) return '#dc2626'; // Vermelho - Muito Alto
                            if (severidade >= 10 && severidade <= 19) return '#ea580c'; // Laranja - Alto
                            if (severidade >= 5 && severidade <= 9) return '#ca8a04';   // Amarelo - Moderado
                            if (severidade >= 1 && severidade <= 4) return '#16a34a';   // Verde - Baixo
                            return '#6b7280'; // Cinza para valores fora do range
                          };
                          
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={getSeverityColor(entry.media_severidade)}
                            />
                          );
                        })}
                      </Bar>

                      {/* Linhas por classificação (da barra mais alta para a direita) */}
                      {severityLines.map(line => (
                        <ReferenceLine
                          key={`ref-${line.label}`}
                          segment={[
                            { x: line.start, y: line.value },
                            { x: line.end,   y: line.value },
                          ]}
                          stroke={line.color}
                          strokeOpacity={0.5}
                          strokeWidth={2}
                          strokeDasharray="6 4"
                          ifOverflow="hidden"
                          isFront
                          label={{
                            // Renderiza o rótulo acima do ponto inicial da linha
                            content: (props: any) => {
                              const vb = props?.viewBox as { x: number; y: number } | undefined;
                              if (!vb) return null;
                              return (
                                <text x={vb.x + 4} y={vb.y - 6} fill={line.color} fontSize={11} textAnchor="start">
                                  {line.label}
                                </text>
                              );
                            },
                          }}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Linha 3: Sistema de Abas */}
        <Card>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'severidade')}>
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="severidade">Severidade por Hierarquia</TabsTrigger>
              </TabsList>
              
              <div className="p-6">
                <TabsContent value="severidade" className="space-y-4">
                  {/* Botões de alternância de visão com efeitos 3D */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                      {/* Botões de filtragem */}
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => setActiveView('acao')}
                          className={`relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 ${
                            activeView === 'acao'
                              ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-inner-3d-pressed'
                              : 'bg-gradient-to-b from-blue-400 to-blue-500 text-white shadow-3d-button hover:shadow-3d-button-hover'
                          }`}
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Ação
                          </span>
                          {activeView === 'acao' && (
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-blue-600 to-blue-700 opacity-50" />
                          )}
                        </button>

                        <button
                          onClick={() => setActiveView('natureza')}
                          disabled
                          className={`relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 transform ${
                            activeView === 'natureza'
                              ? 'bg-gradient-to-b from-green-500 to-green-600 text-white shadow-inner-3d-pressed'
                              : 'bg-gradient-to-b from-green-400 to-green-500 text-white shadow-3d-button hover:shadow-3d-button-hover'
                          } ${activeView !== 'natureza' ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            Natureza
                          </span>
                          {activeView === 'natureza' && (
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-green-600 to-green-700 opacity-50" />
                          )}
                        </button>

                        <button
                          onClick={() => setActiveView('categoria')}
                          disabled
                          className={`relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 transform ${
                            activeView === 'categoria'
                              ? 'bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-inner-3d-pressed'
                              : 'bg-gradient-to-b from-orange-400 to-orange-500 text-white shadow-3d-button hover:shadow-3d-button-hover'
                          } ${activeView !== 'categoria' ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            Categoria e Subcategoria
                          </span>
                          {activeView === 'categoria' && (
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-orange-600 to-orange-700 opacity-50" />
                          )}
                        </button>
                      </div>

                      {/* Campo de busca */}
                      <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="text"
                          placeholder="Buscar por palavras-chave..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:shadow-lg transition-all duration-200 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border">
                    <div className="overflow-x-auto">
                      {loadingSeveridade ? (
                        <div className="p-8 text-center">
                          <p className="text-gray-500">Carregando dados...</p>
                        </div>
                      ) : errorSeveridade ? (
                        <div className="p-8 text-center">
                          <p className="text-red-500">Erro ao carregar dados: {errorSeveridade}</p>
                        </div>
                      ) : severidadeAcoes.length === 0 ? (
                        <div className="p-8 text-center">
                          <p className="text-gray-500">Nenhum dado encontrado</p>
                        </div>
                      ) : (
                        <>
                        <table className="w-full">
                          <colgroup>
                            <col style={{ width: '60%' }} />
                            <col style={{ width: '40%' }} />
                          </colgroup>
                          <thead className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                            <tr className="hidden">
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ação
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Descrição
                              </th>
                            </tr>
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleSort('acao')}>
                                <span className="inline-flex items-center gap-2">
                                  <span>Ação</span>
                                  <span className="text-white">{sortBy==='acao' ? (sortDir==='asc' ? '▲' : '▼') : '↕'}</span>
                                </span>
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleSort('descricao')}>
                                <span className="inline-flex items-center gap-2">
                                  <span>Descrição</span>
                                  <span className="text-white">{sortBy==='descricao' ? (sortDir==='asc' ? '▲' : '▼') : '↕'}</span>
                                </span>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {sortedSeveridadeAcoes.map((item, index) => {
                              const percent = severityToPercent(item.media_severidade);
                              const color = getSeverityHex(item.media_severidade);
                              return (
                                <tr key={index} className="hover:bg-gray-50 align-top">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900 w-3/5">
                                    {item.desc_acao || item.sigla_acao}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-900 w-2/5">
                                    <div className="mb-1 text-xs text-gray-600 flex items-center justify-between">
                                      <span>{item.sigla_acao} - Qtd de Riscos {item.qtd_riscos}</span>
                                      <span className="text-gray-700">
                                        Média da Severidade: {item.media_severidade.toFixed(2)} / Conformidade: {severityToPercent(item.media_severidade).toFixed(0)}%
                                      </span>
                                    </div>
                                    <div className="w-full relative h-3 bg-gray-200 rounded">
                                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 rounded" style={{ width: `${percent}%`, backgroundColor: color }} />
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        <table className="w-full hidden">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ação
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Severidade
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Classificação
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {severidadeAcoes.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {item.sigla_acao}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.media_severidade.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <Badge className={getSeverityClass(item.media_severidade)}>
                                    {getSeverityLabel(item.media_severidade)}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        </>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="hierarquia" className="space-y-4">
                  <div className="bg-white rounded-lg p-4">
                    {/* Controles de Quebra (Power BI Style) */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Filter className="h-5 w-5 text-gray-600" />
                          <h3 className="text-lg font-semibold text-gray-800">Atributos de Quebra</h3>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveBreakNodes(new Set());
                            setSelectedBreakAttribute('departamento');
                            setSelectedMetric('totalAcoes');
                          }}
                          className="flex items-center space-x-2"
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span>Limpar</span>
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Seletor de Atributo de Quebra */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Quebrar por</label>
                          <Select value={selectedBreakAttribute} onValueChange={setSelectedBreakAttribute}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione o atributo" />
                            </SelectTrigger>
                            <SelectContent>
                              {BREAK_ATTRIBUTES.map((attr) => (
                                <SelectItem key={attr.id} value={attr.id}>
                                  {attr.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500">
                            {BREAK_ATTRIBUTES.find(a => a.id === selectedBreakAttribute)?.description}
                          </p>
                        </div>

                        {/* Seletor de Métrica */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Métrica</label>
                          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione a métrica" />
                            </SelectTrigger>
                            <SelectContent>
                              {METRIC_OPTIONS.map((metric) => (
                                <SelectItem key={metric.id} value={metric.id}>
                                  {metric.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Métricas Calculadas */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Valores Selecionados</label>
                          <div className="bg-white border border-gray-200 rounded p-3 space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Total Ações:</span>
                              <span className="font-medium">{selectedMetrics.totalAcoes}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Total Riscos:</span>
                              <span className="font-medium">{selectedMetrics.totalRiscos}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Média Severidade:</span>
                              <span className="font-medium">{selectedMetrics.mediaSeveridade.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Indicador de Seleção */}
                      {activeBreakNodes.size > 0 && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-800">
                              {activeBreakNodes.size} nó(s) selecionado(s)
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setActiveBreakNodes(new Set())}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Limpar seleção
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Visualização em árvore com HierarchicalTreeChart - Horizontal */}
                    <div className="mb-6 h-[500px] w-full border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <HierarchicalTreeChart
                        data={treeWithExpansionState}
                        onNodeClick={activeTab === 'hierarquia' ? handleBreakNodeClick : handleNodeClick}
                        onNodeMouseOver={handleNodeMouseOver}
                        onNodeMouseOut={handleNodeMouseOut}
                        onNodeExpansionChange={handleNodeExpansionChange}
                        onZoomChange={handleZoomChange}
                        showDetails={true}
                        expandedNodeIds={Array.from(expandedNodeIds)}
                        config={{
                          initialDepth: 2,
                          orientation: 'horizontal',
                          translate: { x: 80, y: 250 },
                          zoom: 0.8,
                          collapsible: true,
                          nodeSize: { x: 140, y: 220 },
                          useCardNodes: true,
                          showSeverityIcons: true,
                          enableNodeAnimations: true,
                          enableResponsiveLayout: true,
                          cardPadding: 12,
                          cardSpacing: 8,
                          transitionDuration: 600,
                          scaleExtent: { min: 0.1, max: 3 },
                          // Configurações para melhor legibilidade
                          textDirection: 'ltr',
                          // Reduzir o peso da fonte
                          fontWeight: 400,
                          // Ajustar tamanhos de fonte
                          titleFontSize: 14,
                          subtitleFontSize: 12,
                          infoFontSize: 11
                        }}
                        interactionConfig={{
                          enableKeyboardNavigation: true,
                          enableMouseWheelZoom: true,
                          enableDragPan: true,
                          zoomSensitivity: 0.1,
                          panSensitivity: 1.0
                        }}
                        tooltipConfig={{
                          showDelay: 200,
                          hideDelay: 100,
                          followMouse: true,
                          showNodePath: true,
                          maxWidth: 300
                        }}
                      />
                    </div>
                    
                    {/* Informações de validação */}
                    {!validation.isValid && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="text-red-800 font-semibold mb-2">Erros de validação:</h4>
                        <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                          {validation.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {validation.warnings.length > 0 && (
                      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="text-yellow-800 font-semibold mb-2">Avisos:</h4>
                        <ul className="list-disc list-inside text-yellow-700 text-sm space-y-1">
                          {validation.warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Resumo da Árvore - Baseado em Nós Expandidos */}
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="text-blue-800 font-semibold mb-3">
                        Resumo da Árvore 
                        {expandedNodeIds.size > 0 && (
                          <span className="text-sm text-blue-600 font-normal">
                            (mostrando {expandedNodeIds.size} nó(s) expandido(s))
                          </span>
                        )}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Total de Nós:</span>
                          <span className="ml-2 font-semibold">{selectedMetrics.totalNodes}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Total de Ações:</span>
                          <span className="ml-2 font-semibold">{selectedMetrics.totalAcoes}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Total de Riscos:</span>
                          <span className="ml-2 font-semibold">{selectedMetrics.totalRiscos}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Profundidade Máxima:</span>
                          <span className="ml-2 font-semibold">{selectedMetrics.maxDepth}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div>
                          <span className="text-gray-600">Média de Severidade:</span>
                          <span className="ml-2 font-semibold">{selectedMetrics.mediaSeveridade.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Nós Expandidos:</span>
                          <span className="ml-2 font-semibold">{expandedNodeIds.size}</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className="text-gray-600">Distribuição de Severidade:</span>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                          {Object.entries(selectedMetrics.severityDistribution).map(([severity, count]) => (
                            count > 0 && (
                              <div key={severity} className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${
                                  severity === 'critica' ? 'bg-red-500' :
                                  severity === 'alta' ? 'bg-orange-500' :
                                  severity === 'media' ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}></div>
                                <span className="text-xs capitalize">{severity}: {count}</span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Visualização alternativa em lista (fallback) */}
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Visualização em Lista:</h4>
                      {hierarquiaData.map(node => (
                        <div key={node.id} onClick={() => handleHierarchyToggle(node.id)} className="cursor-pointer">
                          <HierarchyNodeItem node={node} level={1} />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 bg-white border border-gray-200 rounded-lg p-4">
                    <div className="space-y-2">
                      <p><strong>Instruções:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Selecione o atributo de quebra para reorganizar a hierarquia</li>
                        <li>Clique nos nós para selecionar/deselecionar e calcular métricas</li>
                        <li>Use o mouse wheel para zoom in/out na árvore</li>
                        <li>Arraste para panear a árvore</li>
                        <li>Use as setas do teclado para navegação</li>
                        <li>Pressione Espaço/Enter para expandir/colapsar nós selecionados</li>
                      </ul>
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-blue-800 font-medium">
                          💡 <strong>Power BI Style:</strong> A métrica selecionada é calculada dinamicamente 
                          baseada nos nós clicados na hierarquia de quebra.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PortfolioAcoes;

