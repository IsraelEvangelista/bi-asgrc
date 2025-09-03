import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  ChevronDown,
  Building2,
  Settings,
  Layers,
  AlertTriangle,
  Plus,
  Search,
  Eye,
  Edit
} from 'lucide-react';
import {
  HierarchyNode,
  ProcessFilters
} from '../types/process';
import { useProcesses } from '../hooks/useProcesses';
import Layout from '../components/Layout';

const ProcessHierarchy: React.FC = () => {
  const {
    isLoading,
    error,
    hierarchyData,
    statistics,
    fetchHierarchy,
    fetchStatistics,
    clearError
  } = useProcesses();

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<HierarchyNode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStatistics] = useState(true);
  const [filters, setFilters] = useState<ProcessFilters>({
    situacao: 'Ativo'
  });

  useEffect(() => {
    fetchHierarchy();
    fetchStatistics();
  }, [fetchHierarchy, fetchStatistics]);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const expandAll = () => {
    if (!hierarchyData) return;
    const allNodeIds = new Set<string>();
    
    const collectNodeIds = (nodes: HierarchyNode[]) => {
      nodes.forEach(node => {
        allNodeIds.add(node.id);
        if (node.children) {
          collectNodeIds(node.children);
        }
      });
    };
    
    collectNodeIds(hierarchyData.nodes);
    setExpandedNodes(allNodeIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const filterNodes = (nodes: HierarchyNode[]): HierarchyNode[] => {
    if (!searchTerm && filters.situacao === 'Ativo') return nodes;
    
    return nodes.filter(node => {
      const matchesSearch = !searchTerm || 
        node.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSituacao = filters.situacao === 'Todos' || 
        node.situacao === filters.situacao;
      
      const hasMatchingChildren = node.children && 
        filterNodes(node.children).length > 0;
      
      return (matchesSearch && matchesSituacao) || hasMatchingChildren;
    }).map(node => ({
      ...node,
      children: node.children ? filterNodes(node.children) : undefined
    }));
  };

  const getNodeIcon = (type: HierarchyNode['type']) => {
    switch (type) {
      case 'macroprocesso':
        return <Building2 className="w-5 h-5 text-blue-600" />;
      case 'processo':
        return <Settings className="w-5 h-5 text-green-600" />;
      case 'subprocesso':
        return <Layers className="w-5 h-5 text-purple-600" />;
      default:
        return <div className="w-5 h-5" />;
    }
  };

  const getNodeColor = (type: HierarchyNode['type']) => {
    switch (type) {
      case 'macroprocesso':
        return 'text-blue-900 bg-blue-50 border-blue-200';
      case 'processo':
        return 'text-green-900 bg-green-50 border-green-200';
      case 'subprocesso':
        return 'text-purple-900 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-900 bg-gray-50 border-gray-200';
    }
  };

  const getSituacaoColor = (situacao: string) => {
    return situacao === 'Ativo' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const renderNode = (node: HierarchyNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const paddingLeft = level * 24;

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
            selectedNode?.id === node.id ? 'ring-2 ring-blue-500' : ''
          } ${getNodeColor(node.type)}`}
          style={{ marginLeft: `${paddingLeft}px` }}
          onClick={() => setSelectedNode(node)}
        >
          {/* Expand/Collapse Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) toggleNode(node.id);
            }}
            className={`p-1 rounded hover:bg-white/50 transition-colors ${
              hasChildren ? 'text-gray-600' : 'text-transparent'
            }`}
          >
            {hasChildren ? (
              isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            ) : (
              <div className="w-4 h-4" />
            )}
          </button>

          {/* Node Icon */}
          {getNodeIcon(node.type)}

          {/* Node Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{node.name}</span>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSituacaoColor(node.situacao)}`}>
                {node.situacao}
              </span>
            </div>
            <div className="text-sm text-gray-600 capitalize">
              {node.type.replace('_', ' ')}
              {node.riscos_count !== undefined && (
                <span className="ml-2 text-orange-600">
                  • {node.riscos_count} risco(s)
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {node.riscos_count && node.riscos_count > 0 && (
              <span className="flex items-center gap-1 text-orange-600 text-sm">
                <AlertTriangle className="w-4 h-4" />
                {node.riscos_count}
              </span>
            )}
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-2">
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredNodes = hierarchyData ? filterNodes(hierarchyData.nodes) : [];

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-6 h-6" />
              Hierarquia de Processos
            </h1>
            <p className="text-gray-600 mt-1">Visualize e navegue pela estrutura organizacional de processos</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/configuracoes/macroprocessos"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Gerenciar
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="font-medium text-red-800">Erro</h3>
                <p className="text-red-700">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Statistics */}
        {showStatistics && statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{statistics.total_macroprocessos}</div>
                  <div className="text-sm text-gray-600">Macroprocessos</div>
                  <div className="text-xs text-green-600">{statistics.macroprocessos_ativos} ativos</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Settings className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{statistics.total_processos}</div>
                  <div className="text-sm text-gray-600">Processos</div>
                  <div className="text-xs text-green-600">{statistics.processos_ativos} ativos</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Layers className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{statistics.total_subprocessos}</div>
                  <div className="text-sm text-gray-600">Subprocessos</div>
                  <div className="text-xs text-green-600">{statistics.subprocessos_ativos} ativos</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{statistics.processos_com_riscos}</div>
                  <div className="text-sm text-gray-600">Com Riscos</div>
                  <div className="text-xs text-gray-600">{statistics.processos_sem_riscos} sem riscos</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hierarchy Tree */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Controls */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Estrutura Hierárquica</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={expandAll}
                      className="text-sm text-blue-600 hover:text-blue-800 px-2 py-1 rounded"
                    >
                      Expandir Tudo
                    </button>
                    <button
                      onClick={collapseAll}
                      className="text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded"
                    >
                      Recolher Tudo
                    </button>
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar na hierarquia..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <select
                    value={filters.situacao || 'Ativo'}
                    onChange={(e) => setFilters(prev => ({ ...prev, situacao: e.target.value as 'Ativo' | 'Inativo' | 'Todos' }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Ativo">Apenas Ativos</option>
                    <option value="Inativo">Apenas Inativos</option>
                    <option value="Todos">Todos</option>
                  </select>
                </div>
              </div>

              {/* Tree */}
              <div className="p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Carregando hierarquia...</span>
                  </div>
                ) : filteredNodes.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum processo encontrado'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredNodes.map(node => renderNode(node))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-4">Detalhes</h3>
              
              {selectedNode ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {getNodeIcon(selectedNode.type)}
                      <span className="font-medium">{selectedNode.name}</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Tipo: <span className="capitalize">{selectedNode.type}</span></div>
                      <div>Situação: 
                        <span className={`ml-1 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSituacaoColor(selectedNode.situacao)}`}>
                          {selectedNode.situacao}
                        </span>
                      </div>
                      <div>Nível: {selectedNode.level + 1}</div>
                      {selectedNode.riscos_count !== undefined && (
                        <div>Riscos Associados: 
                          <span className="text-orange-600 font-medium">{selectedNode.riscos_count}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Ações</h4>
                    <div className="space-y-2">
                      {selectedNode.type === 'macroprocesso' && (
                        <Link
                          to="/configuracoes/macroprocessos"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          Gerenciar Macroprocessos
                        </Link>
                      )}
                      {selectedNode.type === 'processo' && (
                        <Link
                          to="/configuracoes/processos"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          Gerenciar Processos
                        </Link>
                      )}
                      {selectedNode.type === 'subprocesso' && (
                        <Link
                          to="/configuracoes/subprocessos"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          Gerenciar Subprocessos
                        </Link>
                      )}
                      {selectedNode.riscos_count && selectedNode.riscos_count > 0 && (
                        <Link
                          to="/riscos"
                          className="flex items-center gap-2 text-orange-600 hover:text-orange-800 text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          Ver Riscos Associados
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>Selecione um item na hierarquia para ver os detalhes</p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            {hierarchyData && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-4">
                <h3 className="font-medium text-gray-900 mb-3">Resumo da Hierarquia</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total de Nós:</span>
                    <span className="font-medium">{hierarchyData.total_nodes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profundidade Máxima:</span>
                    <span className="font-medium">{hierarchyData.max_depth} níveis</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nós Expandidos:</span>
                    <span className="font-medium">{expandedNodes.size}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProcessHierarchy;