import React, { useState, useEffect } from 'react';
import { Filter, ChevronDown, ChevronUp, X, Briefcase } from 'lucide-react';
import { usePortfolioAcoesFilter } from '../contexts/PortfolioAcoesFilterContext';
import { supabase } from '../lib/supabase';

interface Natureza {
  id: string;
  desc_natureza: string;
}

interface Categoria {
  id: string;
  desc_categoria: string;
  id_natureza: string;
}

interface Subcategoria {
  id: string;
  desc_subcategoria: string;
  id_categoria: string;
}

interface Acao {
  id: string;
  sigla_acao: string;
  desc_acao: string;
}

interface PortfolioAcoesFilterSectionProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const PortfolioAcoesFilterSection: React.FC<PortfolioAcoesFilterSectionProps> = ({
  isExpanded,
  onToggle
}) => {
  const {
    filtroSeveridade,
    filtroAcao,
    filtroNatureza,
    filtroCategoria,
    filtroSubcategoria,
    setFiltroSeveridade,
    setFiltroAcao,
    setFiltroNatureza,
    setFiltroCategoria,
    setFiltroSubcategoria,
    clearAllFilters
  } = usePortfolioAcoesFilter();

  const [localSeveridade, setLocalSeveridade] = useState<string | null>(filtroSeveridade);
  const [localAcao, setLocalAcao] = useState<string | null>(filtroAcao);
  const [localNatureza, setLocalNatureza] = useState<string | null>(filtroNatureza);
  const [localCategoria, setLocalCategoria] = useState<string | null>(filtroCategoria);
  const [localSubcategoria, setLocalSubcategoria] = useState<string | null>(filtroSubcategoria);
  
  const [naturezas, setNaturezas] = useState<Natureza[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [acoes, setAcoes] = useState<Acao[]>([]);

  // Opções de severidade
  const severidadeOptions = [
    { value: 'Baixo', label: 'Baixo (0-4)', color: 'bg-green-500' },
    { value: 'Moderado', label: 'Moderado (5-9)', color: 'bg-yellow-500' },
    { value: 'Alto', label: 'Alto (10-19)', color: 'bg-orange-500' },
    { value: 'Muito Alto', label: 'Muito Alto (20+)', color: 'bg-red-600' }
  ];

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        // Buscar naturezas - usando tabela corrigida baseada no modal existente
        const { data: naturezasData, error: naturezasError } = await supabase
          .from('018_rel_risco')
          .select('id_natureza, 010_natureza(id, desc_natureza)')
          .not('010_natureza', 'is', null);

        if (naturezasError) {
          console.error('Erro ao buscar naturezas:', naturezasError);
        } else {
          const naturezasUnicas: Natureza[] = Array.from(
            new Map(
              naturezasData
                ?.filter(item => item['010_natureza'])
                .map(item => [
                  (item['010_natureza'] as any).id,
                  {
                    id: (item['010_natureza'] as any).id,
                    desc_natureza: (item['010_natureza'] as any).desc_natureza
                  }
                ])
            ).values()
          );
          setNaturezas(naturezasUnicas);
        }

        // Buscar categorias - pode ter problema de RLS
        const { data: categoriasData, error: categoriasError } = await supabase
          .from('011_categoria')
          .select('id, desc_categoria, id_natureza')
          .order('desc_categoria');

        if (categoriasError) {
          console.error('Erro ao buscar categorias (possivelmente RLS):', categoriasError);
          setCategorias([]);
        } else {
          const categoriasFormatadas: Categoria[] = (categoriasData || []).map(item => ({
            id: item.id,
            desc_categoria: item.desc_categoria,
            id_natureza: item.id_natureza
          }));
          console.log('📋 Categorias carregadas:', categoriasFormatadas.length, 'registros');
          setCategorias(categoriasFormatadas);
        }

        // Buscar subcategorias - pode ter problema de RLS
        const { data: subcategoriasData, error: subcategoriasError } = await supabase
          .from('012_subcategoria')
          .select('id, desc_subcategoria, id_categoria')
          .order('desc_subcategoria');

        if (subcategoriasError) {
          console.error('Erro ao buscar subcategorias (possivelmente RLS):', subcategoriasError);
          setSubcategorias([]);
        } else {
          const subcategoriasFormatadas: Subcategoria[] = (subcategoriasData || []).map(item => ({
            id: item.id,
            desc_subcategoria: item.desc_subcategoria,
            id_categoria: item.id_categoria
          }));
          console.log('📋 Subcategorias carregadas:', subcategoriasFormatadas.length, 'registros');
          setSubcategorias(subcategoriasFormatadas);
        }

        // Buscar ações - pode ter problema de RLS
        const { data: acoesData, error: acoesError } = await supabase
          .from('009_acoes')
          .select('id, sigla_acao, desc_acao')
          .order('sigla_acao');

        if (acoesError) {
          console.error('Erro ao buscar ações (possivelmente RLS):', acoesError);
          setAcoes([]);
        } else {
          console.log('📋 Ações carregadas:', acoesData?.length || 0, 'registros');
          setAcoes(acoesData || []);
        }

      } catch (error) {
        console.error('Erro ao buscar dados dos filtros:', error);
      }
    };

    if (isExpanded) {
      fetchFilterData();
    }
  }, [isExpanded]);

  // Sincronizar estados locais com o contexto quando expandir
  useEffect(() => {
    if (isExpanded) {
      setLocalSeveridade(filtroSeveridade);
      setLocalAcao(filtroAcao);
      setLocalNatureza(filtroNatureza);
      setLocalCategoria(filtroCategoria);
      setLocalSubcategoria(filtroSubcategoria);
    }
  }, [isExpanded, filtroSeveridade, filtroAcao, filtroNatureza, filtroCategoria, filtroSubcategoria]);

  const handleApplyFilters = () => {
    setFiltroSeveridade(localSeveridade);
    setFiltroAcao(localAcao);
    setFiltroNatureza(localNatureza);
    setFiltroCategoria(localCategoria);
    setFiltroSubcategoria(localSubcategoria);
    
    // Auto-collapse o bloco de filtros após aplicar
    onToggle();
  };

  const handleClearFilters = () => {
    setLocalSeveridade(null);
    setLocalAcao(null);
    setLocalNatureza(null);
    setLocalCategoria(null);
    setLocalSubcategoria(null);
    clearAllFilters();
  };

  // Resetar categoria e subcategoria quando natureza mudar
  const handleNaturezaChange = (naturezaId: string | null) => {
    setLocalNatureza(naturezaId);
    setLocalCategoria(null);
    setLocalSubcategoria(null);
  };

  // Resetar subcategoria quando categoria mudar
  const handleCategoriaChange = (categoriaId: string | null) => {
    setLocalCategoria(categoriaId);
    setLocalSubcategoria(null);
  };

  // Filtrar categorias baseado na natureza selecionada
  const categoriasFiltradas = localNatureza 
    ? categorias.filter(cat => String(cat.id_natureza) === String(localNatureza))
    : categorias;

  // Filtrar subcategorias baseado na categoria selecionada
  const subcategoriasFiltradas = localCategoria 
    ? subcategorias.filter(sub => String(sub.id_categoria) === String(localCategoria))
    : subcategorias;

  // Verificar se há filtros ativos
  const hasActiveFilters = filtroSeveridade || filtroAcao || filtroNatureza || filtroCategoria || filtroSubcategoria;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header da seção de filtros */}
      <div className="flex justify-between items-center p-6 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <Briefcase className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Portfólio de Ações</h1>
            <p className="text-gray-600">Gestão e monitoramento de ações mitigatórias</p>
          </div>
        </div>
        
        {/* Botões de Filtro */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 shadow-sm text-sm ${
              isExpanded 
                ? 'bg-blue-700 text-white' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filtros
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {/* Botão Limpar - só aparece quando há filtros ativos */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                handleClearFilters();
                onToggle(); // Fecha a seção após limpar
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-sm text-sm"
            >
              <X className="h-4 w-4" />
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Seção de filtros expansível */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="p-6 bg-white">
          {/* Layout de filtros em 3 colunas e 2 linhas */}
          <div className="grid grid-cols-3 gap-6 min-h-[120px]">
            {/* Coluna 1: Severidade (ocupa 2 linhas) */}
            <div className="row-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Classificação de Severidade
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="severidade-todos"
                    name="severidade"
                    checked={localSeveridade === null}
                    onChange={() => setLocalSeveridade(null)}
                    className="mr-3"
                  />
                  <label htmlFor="severidade-todos" className="text-sm text-gray-700">
                    Todas as severidades
                  </label>
                </div>
                {severidadeOptions.map((option) => (
                  <div key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      id={`severidade-${option.value}`}
                      name="severidade"
                      checked={localSeveridade === option.value}
                      onChange={() => setLocalSeveridade(option.value)}
                      className="mr-3"
                    />
                    <label htmlFor={`severidade-${option.value}`} className="flex items-center text-sm text-gray-700">
                      <span className={`inline-block w-4 h-4 rounded mr-2 ${option.color}`}></span>
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Coluna 2, Linha 1: Ação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ação
                {acoes.length === 0 && (
                  <span className="text-xs text-amber-600 ml-2">(Sem dados disponíveis)</span>
                )}
              </label>
              <select
                value={localAcao || ''}
                onChange={(e) => setLocalAcao(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-500"
                disabled={acoes.length === 0}
              >
                <option value="" className="text-gray-900">
                  {acoes.length === 0 ? 'Nenhuma ação cadastrada' : 'Todas as ações'}
                </option>
                {acoes.map(acao => (
                  <option 
                    key={acao.id} 
                    value={acao.id}
                    className="text-gray-900"
                  >
                    {acao.sigla_acao} - {acao.desc_acao}
                  </option>
                ))}
              </select>
            </div>

            {/* Coluna 3, Linha 1: Natureza */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Natureza
              </label>
              <select
                value={localNatureza || ''}
                onChange={(e) => handleNaturezaChange(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 hover:bg-gray-50"
              >
                <option value="" className="text-gray-900">Todas as naturezas</option>
                {naturezas.map(natureza => (
                  <option 
                    key={natureza.id} 
                    value={natureza.id}
                    className="text-gray-900"
                  >
                    {natureza.desc_natureza}
                  </option>
                ))}
              </select>
            </div>

            {/* Coluna 2, Linha 2: Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
                {categorias.length === 0 && (
                  <span className="text-xs text-amber-600 ml-2">(Sem dados disponíveis)</span>
                )}
              </label>
              <select
                value={localCategoria || ''}
                onChange={(e) => handleCategoriaChange(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-500"
                disabled={!localNatureza || categorias.length === 0}
              >
                <option value="" className="text-gray-900">
                  {categorias.length === 0 
                    ? 'Nenhuma categoria cadastrada' 
                    : !localNatureza 
                      ? 'Selecione uma natureza primeiro' 
                      : 'Todas as categorias'
                  }
                </option>
                {categoriasFiltradas.map(categoria => (
                  <option 
                    key={categoria.id} 
                    value={categoria.id}
                    className="text-gray-900"
                  >
                    {categoria.desc_categoria}
                  </option>
                ))}
              </select>
            </div>

            {/* Coluna 3, Linha 2: Subcategoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategoria
              </label>
              <select
                value={localSubcategoria || ''}
                onChange={(e) => setLocalSubcategoria(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 hover:bg-gray-50"
                disabled={!localCategoria}
              >
                <option value="" className="text-gray-900">
                  {localCategoria ? 'Todas as subcategorias' : 'Selecione uma categoria primeiro'}
                </option>
                {subcategoriasFiltradas.map(subcategoria => (
                  <option 
                    key={subcategoria.id} 
                    value={subcategoria.id}
                    className="text-gray-900"
                  >
                    {subcategoria.desc_subcategoria}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Linha 3: Botões de ação justificados à direita */}
          <div className="flex gap-2 justify-end pt-6">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Limpar Filtros
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioAcoesFilterSection;