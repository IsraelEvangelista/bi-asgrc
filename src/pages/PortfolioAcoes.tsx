import React, { useState, useMemo, useCallback, Fragment } from 'react';
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
import { useSeveridadePorNatureza } from '../hooks/useSeveridadePorNatureza';
import { useSeveridadePorCategoria } from '../hooks/useSeveridadePorCategoria';
import { useRiscosDetalhados } from '../hooks/useRiscosDetalhados';
import RiscosTooltip from '../components/RiscosTooltip';
import TableRiscosTooltip from '../components/TableRiscosTooltip';
import DynamicTooltip from '../components/DynamicTooltip';
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
  const { severidadeAcoes, loading: loadingSeveridadeAcao, error: errorSeveridadeAcao } = useSeveridadePorAcao();
  const { severidadeNatureza, loading: loadingSeveridadeNatureza, error: errorSeveridadeNatureza } = useSeveridadePorNatureza();
  const { severidadeCategorias, loading: loadingSeveridadeCategoria, error: errorSeveridadeCategoria } = useSeveridadePorCategoria();
  const { riscosPorAcao, loading: loadingRiscosDetalhados } = useRiscosDetalhados();

  // Dados mock para teste enquanto os dados reais não estão disponíveis
  const mockSeveridadeNatureza = [
    { id_natureza: '1', desc_natureza: 'Operacional', media_severidade: 15.5, qtd_riscos: 8 },
    { id_natureza: '2', desc_natureza: 'Financeiro', media_severidade: 8.2, qtd_riscos: 5 },
    { id_natureza: '3', desc_natureza: 'Estratégico', media_severidade: 12.8, qtd_riscos: 3 }
  ];

  const mockSeveridadeAcoes = [
    { id_acao: '1', sigla_acao: 'A001', desc_acao: 'Ação 1', media_severidade: 18.3, qtd_riscos: 6 },
    { id_acao: '2', sigla_acao: 'A002', desc_acao: 'Ação 2', media_severidade: 7.5, qtd_riscos: 4 },
    { id_acao: '3', sigla_acao: 'A003', desc_acao: 'Ação 3', media_severidade: 14.2, qtd_riscos: 8 }
  ];

  const mockSeveridadeCategorias = [
    { id: 'cat-1', nome: 'Processos', tipo: 'categoria' as const, media_severidade: 16.8, qtd_riscos: 12, id_categoria: '1' },
    { id: 'cat-2', nome: 'Pessoas', tipo: 'categoria' as const, media_severidade: 9.4, qtd_riscos: 7, id_categoria: '2' },
    { id: 'sub-1', nome: 'Contratação', tipo: 'subcategoria' as const, media_severidade: 11.2, qtd_riscos: 4, id_subcategoria: '1', parentId: 'cat-2' }
  ];

  // Dados mock para riscos detalhados
  const mockRiscosPorAcao: { [key: string]: import('../hooks/useRiscosDetalhados').RiscoDetalhado[] } = {
    '1': [
      { id: '1', desc_risco: 'Risco Operacional 1', severidade: 18.5, conformidade: 73.0, id_natureza: '1', desc_natureza: 'Operacional' },
      { id: '2', desc_risco: 'Risco Operacional 2', severidade: 22.1, conformidade: 87.9, id_natureza: '1', desc_natureza: 'Operacional' }
    ],
    '2': [
      { id: '3', desc_risco: 'Risco Financeiro 1', severidade: 8.3, conformidade: 30.4, id_natureza: '2', desc_natureza: 'Financeiro' }
    ],
    '3': [
      { id: '4', desc_risco: 'Risco Estratégico 1', severidade: 14.7, conformidade: 57.3, id_natureza: '3', desc_natureza: 'Estratégico' }
    ]
  };
  
  // Debug logs
  
  
  const [activeTab, setActiveTab] = useState<'severidade' | 'hierarquia'>('severidade');
  // Estado para controlar a visão ativa da tabela
  const [activeView, setActiveView] = useState<'acao' | 'natureza' | 'categoria'>('acao');
  // Estado para busca por texto
  const [searchTerm, setSearchTerm] = useState('');
  // Ordenação da tabela Severidade da Ação - padrão por severidade (maior para menor)
  const [sortBy, setSortBy] = useState<'acao' | 'descricao' | 'natureza' | 'categoria' | 'hierarquia' | null>('descricao');
  // Estado para controle de expansão de categorias
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const toggleSort = (column: 'acao' | 'descricao' | 'natureza' | 'categoria') => {
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

  // Função para ordenação alfanumérica inteligente (A1, A2, A3... ao invés de A1, A10, A11...)
  const smartAlphanumericSort = (a: string, b: string): number => {
    // Regex para separar letra(s) e número(s)
    const regex = /^([A-Za-z]+)(\d+)$/;
    const matchA = a.match(regex);
    const matchB = b.match(regex);
    
    // Se ambos seguem o padrão letra+número
    if (matchA && matchB) {
      const [, letterA, numberA] = matchA;
      const [, letterB, numberB] = matchB;
      
      // Primeiro compara as letras
      const letterCmp = letterA.localeCompare(letterB, 'pt-BR');
      if (letterCmp !== 0) return letterCmp;
      
      // Se as letras são iguais, compara os números numericamente
      return parseInt(numberA, 10) - parseInt(numberB, 10);
    }
    
    // Fallback para comparação normal se não seguir o padrão
    return a.localeCompare(b, 'pt-BR');
  };

  // Dados ordenados para a tabela (Ação/Descrição)
  const sortedSeveridadeAcoes = useMemo(() => {
    const arr = severidadeAcoes.length > 0 ? [...severidadeAcoes] : [...mockSeveridadeAcoes];
    console.log('Debug - Dados sendo usados:', {
      severidadeAcoesLength: severidadeAcoes.length,
      usingMockData: severidadeAcoes.length === 0,
      data: arr
    });
    if (!sortBy) return arr;
    return arr.sort((a, b) => {
      if (sortBy === 'acao') {
        const aKey = (a.sigla_acao || '').toString();
        const bKey = (b.sigla_acao || '').toString();
        const cmp = smartAlphanumericSort(aKey, bKey);
        return sortDir === 'asc' ? cmp : -cmp;
      }
      const cmp = (a.media_severidade || 0) - (b.media_severidade || 0);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [severidadeAcoes, sortBy, sortDir]);

  // Converte severidade (1..25) para percentual (0..100)
  const severityToPercent = (severidade: number): number => {
    const clamped = Math.max(1, Math.min(25, severidade));
    return ((clamped - 1) / 24) * 100;
  };

  // Função para obter riscos por ação
  const getRiscosPorAcao = (acaoId: string) => {
    if (!acaoId) return [];

    // Try to get real data first
    const realData = riscosPorAcao[acaoId];
    if (realData && realData.length > 0) {
      return realData;
    }

    // Fallback to mock data if no real data available
    return mockRiscosPorAcao[acaoId] || [];
  };

  // Função para obter riscos por natureza
  const getRiscosPorNatureza = (naturezaId: string) => {
    const riscosPorNatureza: { [key: string]: import('../hooks/useRiscosDetalhados').RiscoDetalhado[] } = {};

    // Agrupar riscos por natureza
    Object.entries(riscosPorAcao).forEach(([acaoId, riscos]) => {
      riscos.forEach(risco => {
        if (risco.id_natureza === naturezaId) {
          if (!riscosPorNatureza[naturezaId]) {
            riscosPorNatureza[naturezaId] = [];
          }
          riscosPorNatureza[naturezaId].push(risco);
        }
      });
    });

    return riscosPorNatureza[naturezaId] || [];
  };

  // Função para obter riscos por categoria
  const getRiscosPorCategoria = (categoriaId: string) => {
    const riscosPorCategoria: { [key: string]: import('../hooks/useRiscosDetalhados').RiscoDetalhado[] } = {};

    // Agrupar riscos por categoria
    Object.entries(riscosPorAcao).forEach(([acaoId, riscos]) => {
      riscos.forEach(risco => {
        if (risco.id_categoria === categoriaId) {
          if (!riscosPorCategoria[categoriaId]) {
            riscosPorCategoria[categoriaId] = [];
          }
          riscosPorCategoria[categoriaId].push(risco);
        }
      });
    });

    return riscosPorCategoria[categoriaId] || [];
  };

  // Função para obter riscos por subcategoria
  const getRiscosPorSubcategoria = (subcategoriaId: string) => {
    const riscosPorSubcategoria: { [key: string]: import('../hooks/useRiscosDetalhados').RiscoDetalhado[] } = {};

    // Agrupar riscos por subcategoria
    Object.entries(riscosPorAcao).forEach(([acaoId, riscos]) => {
      riscos.forEach(risco => {
        if (risco.id_subcategoria === subcategoriaId) {
          if (!riscosPorSubcategoria[subcategoriaId]) {
            riscosPorSubcategoria[subcategoriaId] = [];
          }
          riscosPorSubcategoria[subcategoriaId].push(risco);
        }
      });
    });

    return riscosPorSubcategoria[subcategoriaId] || [];
  };

  // Dados ordenados para a tabela de natureza
  const sortedSeveridadeNatureza = useMemo(() => {
    const arr = severidadeNatureza.length > 0 ? [...severidadeNatureza] : [...mockSeveridadeNatureza];
    return arr.sort((a, b) => {
      // Calcular conformidade (percentual)
      const aConformidade = severityToPercent(a.media_severidade || 0);
      const bConformidade = severityToPercent(b.media_severidade || 0);

      if (sortBy === 'natureza' || sortBy === 'descricao') {
        // Ordenar por conformidade
        const cmp = aConformidade - bConformidade;
        return sortDir === 'asc' ? cmp : -cmp;
      }
      // Padrão: ordenar por conformidade
      const cmp = aConformidade - bConformidade;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [severidadeNatureza, sortBy, sortDir]);

  // Dados organizados para categorias e subcategorias com ordenação por conformidade
  const categoriaHierarchy = useMemo(() => {
    const categoriasData = severidadeCategorias.length > 0 ? severidadeCategorias : mockSeveridadeCategorias;
    const categorias = categoriasData.filter(item => item.tipo === 'categoria');
    const subcategorias = categoriasData.filter(item => item.tipo === 'subcategoria');

    // Ordenar categorias por conformidade
    const sortedCategorias = [...categorias].sort((a, b) => {
      const aConformidade = severityToPercent(a.media_severidade || 0);
      const bConformidade = severityToPercent(b.media_severidade || 0);
      return sortDir === 'asc' ? aConformidade - bConformidade : bConformidade - aConformidade;
    });

    return sortedCategorias.map(categoria => ({
      ...categoria,
      subcategorias: subcategorias.filter(sub => sub.parentId === categoria.id)
    }));
  }, [severidadeCategorias, sortDir]);

  // Função para alternar expansão de categoria
  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };
  
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
  const HierarchyNodeItem: React.FC<{ node: HierarchyNode; level: number }> = ({ node, level }) => {
    // Calcular conformidade baseada na severidade (25 = 100%, 1 = 0%)
    const conformidadePercent = Math.max(0, Math.min(100, ((25 - node.severidade) / 24) * 100));
    
    // Determinar cor baseada na severidade (similar ao gráfico)
    const getConformidadeColor = (severidade: number) => {
      if (severidade >= 20) return '#dc2626'; // Vermelho (crítico)
      if (severidade >= 15) return '#ea580c'; // Laranja (alto)
      if (severidade >= 10) return '#d97706'; // Amarelo (médio)
      return '#16a34a'; // Verde (baixo)
    };

    const barColor = getConformidadeColor(node.severidade);

    return (
      <div className={`${level > 1 ? 'ml-6' : ''}`}>
        <div
          className={`flex flex-col p-3 hover:bg-gray-50 cursor-pointer border-l-2 ${
            level === 1 ? 'border-blue-300 bg-blue-25' : level === 2 ? 'border-green-300 bg-green-25' : 'border-gray-300'
          }`}
          onClick={() => handleHierarchyToggle(node.id)}
        >
          {/* Linha principal com informações */}
          <div className="flex items-center justify-between">
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
          
          {/* Barra de conformidade horizontal */}
          <div className="mt-2 w-full">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Conformidade</span>
              <span>{conformidadePercent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300 ease-in-out"
                style={{
                  width: `${conformidadePercent}%`,
                  backgroundColor: barColor
                }}
                title={`Conformidade: ${conformidadePercent.toFixed(1)}% (Severidade: ${node.severidade.toFixed(1)})`}
              />
            </div>
          </div>
        </div>
        {node.expandido && node.children.map(child => (
          <HierarchyNodeItem key={child.id} node={child} level={level + 1} />
        ))}
      </div>
    );
  };

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
            {loadingSeveridadeAcao ? (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">Carregando dados...</p>
              </div>
            ) : errorSeveridadeAcao ? (
              <div className="h-80 flex items-center justify-center">
                <p className="text-red-500">Erro ao carregar dados: {errorSeveridadeAcao}</p>
              </div>
            ) : severidadeAcoes.length === 0 ? (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">Nenhum dado encontrado</p>
              </div>
            ) : (
              <div className="h-[250px] w-full overflow-x-auto bg-white rounded-lg border relative">
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
                        wrapperStyle={{ zIndex: 9999 }}
                        allowEscapeViewBox={{ x: true, y: true }}
                        content={({ active, payload, label, coordinate }) => {
                          if (!active || !payload || !payload.length) return null;

                          // Find the correct action ID using multiple strategies
                          const acaoData = severidadeAcoes.find(a => a.sigla_acao === label);
                          const chartDataItem = chartData.find(item => item.acao === label);

                          // Use the proper action ID from the data, fallback to chart data, then to label
                          const acaoId = acaoData?.id_acao || chartDataItem?.acao || String(label);

                          // Get detailed risks for this action with fallback to mock data
                          const riscosDetalhados = getRiscosPorAcao(acaoId);
                          const severidadeValue = Number(payload[0].value);

                          return (
                            <DynamicTooltip 
                              active={active} 
                              payload={payload} 
                              label={label}
                              coordinate={coordinate}
                              offset={{ x: 1, y: 1 }}
                            >
                              <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-4 min-w-[300px] max-w-[500px]">
                                {/* Cabeçalho com informações da ação */}
                                <div className="border-b border-gray-200 pb-3 mb-3">
                                  <h4 className="font-semibold text-gray-900 text-sm">{String(label)}</h4>
                                  <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-gray-600">Média de Severidade:</span>
                                    <span className="text-sm font-medium text-gray-900">{severidadeValue.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-gray-600">Conformidade:</span>
                                    <span className="text-sm font-medium text-gray-900">
                                      {severityToPercent(severidadeValue).toFixed(0)}%
                                    </span>
                                  </div>
                                </div>

                                {/* Lista de riscos associados */}
                                {riscosDetalhados && riscosDetalhados.length > 0 && (
                                  <div>
                                    <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                                      Riscos Associados ({riscosDetalhados.length})
                                    </h5>
                                    <div className="space-y-2">
                                      {riscosDetalhados.map((risco, index) => (
                                        <div
                                          key={risco.id || index}
                                          className="bg-gray-50 rounded-lg p-2 border border-gray-100"
                                        >
                                          <div className="flex justify-between items-start mb-1">
                                            <h6 className="text-xs font-medium text-gray-900 flex-1 pr-2">
                                              {risco.desc_risco}
                                            </h6>
                                            <div className="flex items-center space-x-2">
                                              <span className="text-xs font-medium text-gray-700">
                                                {risco.severidade.toFixed(1)}
                                              </span>
                                              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                              <span className="text-xs font-medium text-gray-700">
                                                {severityToPercent(risco.severidade).toFixed(0)}%
                                              </span>
                                            </div>
                                          </div>

                                          {/* Barra de conformidade */}
                                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                            <div
                                              className={`h-1.5 rounded-full ${
                                                severityToPercent(risco.severidade) >= 80 ? 'bg-green-500' :
                                                severityToPercent(risco.severidade) >= 60 ? 'bg-yellow-500' :
                                                severityToPercent(risco.severidade) >= 40 ? 'bg-orange-500' : 'bg-red-500'
                                              }`}
                                              style={{ width: `${severityToPercent(risco.severidade)}%` }}
                                            ></div>
                                          </div>

                                          {/* Informações adicionais */}
                                          {(risco.desc_natureza || risco.desc_categoria || risco.desc_subcategoria) && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              {risco.desc_natureza && (
                                                <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">
                                                  {risco.desc_natureza}
                                                </span>
                                              )}
                                              {risco.desc_categoria && (
                                                <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
                                                  {risco.desc_categoria}
                                                </span>
                                              )}
                                              {risco.desc_subcategoria && (
                                                <span className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded">
                                                  {risco.desc_subcategoria}
                                                </span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </DynamicTooltip>
                          );
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
                          // isFront removido - propriedade não suportada
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
                          className={`relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 ${
                            activeView === 'natureza'
                              ? 'bg-gradient-to-b from-green-500 to-green-600 text-white shadow-inner-3d-pressed'
                              : 'bg-gradient-to-b from-green-400 to-green-500 text-white shadow-3d-button hover:shadow-3d-button-hover'
                          }`}
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
                          className={`relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 ${
                            activeView === 'categoria'
                              ? 'bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-inner-3d-pressed'
                              : 'bg-gradient-to-b from-orange-400 to-orange-500 text-white shadow-3d-button hover:shadow-3d-button-hover'
                          }`}
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
                    {/* View por Ação */}
                    {activeView === 'acao' && (
                      loadingSeveridadeAcao || loadingRiscosDetalhados ? (
                        <div className="p-8 text-center">
                          <p className="text-gray-500">Carregando dados...</p>
                        </div>
                      ) : errorSeveridadeAcao ? (
                        <div className="p-8 text-center">
                          <p className="text-red-500">Erro ao carregar dados: {errorSeveridadeAcao}</p>
                        </div>
                      ) : severidadeAcoes.length === 0 ? (
                        <div className="p-8 text-center">
                          <p className="text-gray-500">Nenhum dado encontrado</p>
                        </div>
                      ) : (
                        <table className="w-full">
                          <colgroup>
                            <col style={{ width: '60%' }} />
                            <col style={{ width: '40%' }} />
                          </colgroup>
                          <thead className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
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
                              console.log(`Debug - Item ${index}:`, {
                                acao: item.sigla_acao,
                                severidade: item.media_severidade,
                                percent,
                                color
                              });
                              return (
                                <tr key={index} className="hover:bg-gray-50 align-top">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900 w-3/5">
                                    {item.desc_acao || item.sigla_acao}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-900 w-2/5">
                                    <div className="mb-2 text-xs text-gray-600 flex items-center justify-between">
                                      <span>{item.sigla_acao} - Qtd de Riscos {item.qtd_riscos}</span>
                                      <span className="text-gray-700">
                                        Média da Severidade: {item.media_severidade.toFixed(2)} / Conformidade: {severityToPercent(item.media_severidade).toFixed(0)}%
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-4">
                                      <div
                                        className="h-4 rounded-full transition-all duration-300"
                                        style={{
                                          width: `${percent}%`,
                                          backgroundColor: color
                                        }}
                                        title={`${item.desc_acao || item.sigla_acao} - Conformidade: ${severityToPercent(item.media_severidade).toFixed(0)}%`}
                                      />
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )
                    )}

                    {/* View por Natureza */}
                    {activeView === 'natureza' && (
                      loadingSeveridadeNatureza || loadingRiscosDetalhados ? (
                        <div className="p-8 text-center">
                          <p className="text-gray-500">Carregando dados...</p>
                        </div>
                      ) : errorSeveridadeNatureza ? (
                        <div className="p-8 text-center">
                          <p className="text-red-500">Erro ao carregar dados: {errorSeveridadeNatureza}</p>
                        </div>
                      ) : severidadeNatureza.length === 0 ? (
                        <div className="p-8 text-center">
                          <p className="text-gray-500">Nenhum dado encontrado</p>
                        </div>
                      ) : (
                        <table className="w-full">
                          <colgroup>
                            <col style={{ width: '60%' }} />
                            <col style={{ width: '40%' }} />
                          </colgroup>
                          <thead className="bg-gradient-to-r from-green-500 to-green-700 text-white">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleSort('natureza')}>
                                <span className="inline-flex items-center gap-2">
                                  <span>Natureza</span>
                                  <span className="text-white">{sortBy==='natureza' ? (sortDir==='asc' ? '▲' : '▼') : '↕'}</span>
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
                            {sortedSeveridadeNatureza.map((item, index) => {
                              const percent = severityToPercent(item.media_severidade);
                              const color = getSeverityHex(item.media_severidade);
                              return (
                                <tr key={index} className="hover:bg-gray-50 align-top">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900 w-3/5">
                                    {item.desc_natureza}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-900 w-2/5">
                                    <div className="mb-2 text-xs text-gray-600 flex items-center justify-between">
                                      <span>Qtd de Riscos: {item.qtd_riscos}</span>
                                      <span className="text-gray-700">
                                        Média da Severidade: {item.media_severidade.toFixed(2)} / Conformidade: {severityToPercent(item.media_severidade).toFixed(0)}%
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-4">
                                      <div
                                        className="h-4 rounded-full transition-all duration-300"
                                        style={{
                                          width: `${percent}%`,
                                          backgroundColor: color
                                        }}
                                        title={`${item.desc_natureza} - Conformidade: ${severityToPercent(item.media_severidade).toFixed(0)}%`}
                                      />
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )
                    )}

                    {/* View por Categoria e Subcategoria */}
                    {activeView === 'categoria' && (
                      loadingSeveridadeCategoria || loadingRiscosDetalhados ? (
                        <div className="p-8 text-center">
                          <p className="text-gray-500">Carregando dados...</p>
                        </div>
                      ) : errorSeveridadeCategoria ? (
                        <div className="p-8 text-center">
                          <p className="text-red-500">Erro ao carregar dados: {errorSeveridadeCategoria}</p>
                        </div>
                      ) : severidadeCategorias.length === 0 ? (
                        <div className="p-8 text-center">
                          <p className="text-gray-500">Nenhum dado encontrado</p>
                        </div>
                      ) : (
                        <table className="w-full">
                          <colgroup>
                            <col style={{ width: '60%' }} />
                            <col style={{ width: '40%' }} />
                          </colgroup>
                          <thead className="bg-gradient-to-r from-orange-500 to-orange-700 text-white">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleSort('categoria')}>
                                <span className="inline-flex items-center gap-2">
                                  <span>Categoria e Subcategoria</span>
                                  <span className="text-white">{sortBy==='categoria' ? (sortDir==='asc' ? '▲' : '▼') : '↕'}</span>
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
                            {categoriaHierarchy.map((categoria) => {
                              const isExpanded = expandedCategories.has(categoria.id);
                              const categoriaPercent = severityToPercent(categoria.media_severidade);
                              const categoriaColor = getSeverityHex(categoria.media_severidade);

                              return (
                                <Fragment key={categoria.id}>
                                  {/* Categoria (Pai) */}
                                  <tr className="hover:bg-blue-50 align-top border-l-4 border-blue-400 bg-blue-50/30">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 w-3/5">
                                      <div className="flex items-center space-x-2">
                                        {categoria.subcategorias.length > 0 && (
                                          <span className="text-gray-500 cursor-pointer" onClick={() => toggleCategoryExpansion(categoria.id)}>
                                            {isExpanded ? (
                                              <ChevronDown className="w-4 h-4" />
                                            ) : (
                                              <ChevronRight className="w-4 h-4" />
                                            )}
                                          </span>
                                        )}
                                        <span className="font-semibold text-blue-900">{categoria.nome}</span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 w-2/5">
                                      <div className="mb-2 text-xs text-gray-600 flex items-center justify-between">
                                        <span>Qtd de Riscos: {categoria.qtd_riscos}</span>
                                        <span className="text-gray-700">
                                          Média da Severidade: {categoria.media_severidade.toFixed(2)} / Conformidade: {categoriaPercent.toFixed(0)}%
                                        </span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-4">
                                        <div
                                          className="h-4 rounded-full transition-all duration-300"
                                          style={{
                                            width: `${categoriaPercent}%`,
                                            backgroundColor: categoriaColor
                                          }}
                                          title={`${categoria.nome} - Conformidade: ${categoriaPercent.toFixed(0)}%`}
                                        />
                                      </div>
                                    </td>
                                  </tr>

                                  {/* Subcategoria (Filha) */}
                                  {isExpanded && categoria.subcategorias.length > 0 && (
                                    categoria.subcategorias.map((subcategoria) => {
                                      const subcategoriaPercent = severityToPercent(subcategoria.media_severidade);
                                      const subcategoriaColor = getSeverityHex(subcategoria.media_severidade);

                                      return (
                                        <tr key={subcategoria.id} className="hover:bg-green-50 align-top border-l-4 border-green-400 bg-green-50/30">
                                          <td className="px-6 py-4 text-sm font-medium text-gray-700 w-3/5">
                                            <div className="flex items-center space-x-4">
                                              <div className="w-2 h-4 bg-green-500 rounded-sm ml-6"></div>
                                              <span className="text-green-800">{subcategoria.nome}</span>
                                            </div>
                                          </td>
                                          <td className="px-6 py-4 text-sm text-gray-700 w-2/5">
                                            <div className="mb-2 text-xs text-gray-600 flex items-center justify-between">
                                              <span>Qtd de Riscos: {subcategoria.qtd_riscos}</span>
                                              <span className="text-gray-700">
                                                Média da Severidade: {subcategoria.media_severidade.toFixed(2)} / Conformidade: {subcategoriaPercent.toFixed(0)}%
                                              </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-4">
                                              <div
                                                className="h-4 rounded-full transition-all duration-300"
                                                style={{
                                                  width: `${subcategoriaPercent}%`,
                                                  backgroundColor: subcategoriaColor
                                                }}
                                                title={`${subcategoria.nome} - Conformidade: ${subcategoriaPercent.toFixed(0)}%`}
                                              />
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })
                                  )}
                                </Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      )
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

