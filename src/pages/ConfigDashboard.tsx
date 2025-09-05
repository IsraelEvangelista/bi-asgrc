import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Settings, 
  Building2, 
  TreePine, 
  Users, 
  Activity,
  Plus,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useConfig } from '../hooks/useConfig';
import Layout from '../components/Layout';

interface ConfigCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  count: number;
  activeCount: number;
  color: string;
}

const ConfigDashboard: React.FC = () => {
  const { 
    clearError,
    getBasicStats 
  } = useConfig();
  
  const [stats, setStats] = useState<{
    total_areas: number;
    areas_ativas: number;
    total_naturezas: number;
    naturezas_ativas: number;
    total_categorias: number;
    categorias_ativas: number;
    total_subcategorias: number;
    subcategorias_ativas: number;
    total_conceitos: number;
    conceitos_ativos: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Carregar estatísticas
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    const result = await getBasicStats();
    if (result) {
      setStats(result);
    }
    setStatsLoading(false);
  }, [getBasicStats]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Configuração dos cards
  const configCards: ConfigCard[] = [
    {
      id: 'areas',
      title: 'Áreas/Gerências',
      description: 'Gerenciar áreas e gerências organizacionais',
      icon: <Building2 className="w-8 h-8" />,
      path: '/configuracoes/areas',
      count: stats?.total_areas || 0,
      activeCount: stats?.areas_ativas || 0,
      color: 'bg-blue-500'
    },
    {
      id: 'naturezas',
      title: 'Naturezas de Risco',
      description: 'Classificar tipos de riscos organizacionais',
      icon: <TreePine className="w-8 h-8" />,
      path: '/configuracoes/natureza',
      count: stats?.total_naturezas || 0,
      activeCount: stats?.naturezas_ativas || 0,
      color: 'bg-green-500'
    },
    {
      id: 'categorias',
      title: 'Categorias',
      description: 'Organizar categorias por natureza de risco',
      icon: <Activity className="w-8 h-8" />,
      path: '/configuracoes/categoria',
      count: stats?.total_categorias || 0,
      activeCount: stats?.categorias_ativas || 0,
      color: 'bg-orange-500'
    },
    {
      id: 'subcategorias',
      title: 'Subcategorias',
      description: 'Subcategorias organizadas por categoria',
      icon: <Activity className="w-8 h-8" />,
      path: '/configuracoes/subcategoria',
      count: stats?.total_subcategorias || 0,
      activeCount: stats?.subcategorias_ativas || 0,
      color: 'bg-indigo-500'
    },
    {
      id: 'conceitos',
      title: 'Conceitos',
      description: 'Glossário de termos técnicos',
      icon: <Users className="w-8 h-8" />,
      path: '/configuracoes/conceitos',
      count: 0, // Será implementado na Fase 4
      activeCount: 0,
      color: 'bg-purple-500'
    }
  ];

  // Filtrar cards baseado na busca
  const filteredCards = configCards.filter(card =>
    card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = () => {
    clearError();
    loadStats();
  };

  return (
    <Layout>
      <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Settings className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Configurações e Cadastros
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie as configurações básicas do sistema de gestão de riscos
              </p>
            </div>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={statsLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Barra de busca e filtros */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar configurações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
        </div>
      </div>



      {/* Estatísticas resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Áreas</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : stats?.total_areas || 0}
              </p>
            </div>
            <Building2 className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {statsLoading ? '...' : stats?.areas_ativas || 0} ativas
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Naturezas</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : stats?.total_naturezas || 0}
              </p>
            </div>
            <TreePine className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {statsLoading ? '...' : stats?.naturezas_ativas || 0} ativas
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categorias</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
            <Activity className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-sm text-gray-500 mt-2">Em breve</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conceitos</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-sm text-gray-500 mt-2">Em breve</p>
        </div>
      </div>

      {/* Cards de configuração */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCards.map((card) => (
          <Link
            key={card.id}
            to={card.path}
            className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-gray-300"
          >
            <div className="p-6">
              {/* Ícone e título */}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.color} bg-opacity-10`}>
                  <div className={`${card.color.replace('bg-', 'text-')}`}>
                    {card.icon}
                  </div>
                </div>
                
                {card.id === 'areas' || card.id === 'naturezas' ? (
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{card.count}</p>
                    <p className="text-sm text-gray-500">{card.activeCount} ativas</p>
                  </div>
                ) : (
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Em breve</p>
                  </div>
                )}
              </div>
              
              {/* Conteúdo */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {card.description}
                </p>
              </div>
              
              {/* Ação */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-indigo-600 group-hover:text-indigo-700 font-medium">
                  Gerenciar
                </span>
                <Plus className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Mensagem quando não há resultados */}
      {filteredCards.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma configuração encontrada
          </h3>
          <p className="text-gray-600">
            Tente ajustar os termos de busca ou limpar os filtros.
          </p>
        </div>
      )}</div>
    </Layout>
  );
};

export default ConfigDashboard;