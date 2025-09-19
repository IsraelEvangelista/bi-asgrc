import React, { useState, useEffect } from 'react';
import { X, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { usePortfolioAcoesFilter } from '../contexts/PortfolioAcoesFilterContext';

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

interface PortfolioAcoesFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PortfolioAcoesFilterModal: React.FC<PortfolioAcoesFilterModalProps> = ({
  isOpen,
  onClose
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

  // Estados locais para o modal
  const [localSeveridade, setLocalSeveridade] = useState<string | null>(filtroSeveridade);
  const [localAcao, setLocalAcao] = useState<string | null>(filtroAcao);
  const [localNatureza, setLocalNatureza] = useState<string | null>(filtroNatureza);
  const [localCategoria, setLocalCategoria] = useState<string | null>(filtroCategoria);
  const [localSubcategoria, setLocalSubcategoria] = useState<string | null>(filtroSubcategoria);

  // Estado para controlar a posição do modal e bloquear a rolagem
  const [scrollPosition, setScrollPosition] = useState(0);

  // Estados para dados carregados do Supabase
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

  // Buscar dados do Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar naturezas
        const { data: naturezasData, error: naturezasError } = await supabase
          .from('018_rel_risco')
          .select('id_natureza, 001_natureza(id, desc_natureza)')
          .not('001_natureza', 'is', null);

        if (naturezasError) throw naturezasError;

        const naturezasUnicas: Natureza[] = Array.from(
          new Map(
            naturezasData
              ?.filter(item => item['001_natureza'])
              .map(item => [
                (item['001_natureza'] as any).id,
                {
                  id: (item['001_natureza'] as any).id,
                  desc_natureza: (item['001_natureza'] as any).desc_natureza
                }
              ])
          ).values()
        );
        setNaturezas(naturezasUnicas);

        // Buscar categorias
        const { data: categoriasData, error: categoriasError } = await supabase
          .from('018_rel_risco')
          .select('id_categoria, 002_categoria(id, desc_categoria, id_natureza)')
          .not('002_categoria', 'is', null);

        if (categoriasError) throw categoriasError;

        const categoriasUnicas: Categoria[] = Array.from(
          new Map(
            categoriasData
              ?.filter(item => item['002_categoria'])
              .map(item => [
                (item['002_categoria'] as any).id,
                {
                  id: (item['002_categoria'] as any).id,
                  desc_categoria: (item['002_categoria'] as any).desc_categoria,
                  id_natureza: (item['002_categoria'] as any).id_natureza
                }
              ])
          ).values()
        );
        setCategorias(categoriasUnicas);

        // Buscar subcategorias
        const { data: subcategoriasData, error: subcategoriasError } = await supabase
          .from('018_rel_risco')
          .select('id_subcategoria, 003_subcategoria(id, desc_subcategoria, id_categoria)')
          .not('003_subcategoria', 'is', null);

        if (subcategoriasError) throw subcategoriasError;

        const subcategoriasUnicas: Subcategoria[] = Array.from(
          new Map(
            subcategoriasData
              ?.filter(item => item['003_subcategoria'])
              .map(item => [
                (item['003_subcategoria'] as any).id,
                {
                  id: (item['003_subcategoria'] as any).id,
                  desc_subcategoria: (item['003_subcategoria'] as any).desc_subcategoria,
                  id_categoria: (item['003_subcategoria'] as any).id_categoria
                }
              ])
          ).values()
        );
        setSubcategorias(subcategoriasUnicas);

        // Buscar ações
        const { data: acoesData, error: acoesError } = await supabase
          .from('019_acao')
          .select('id, sigla_acao, desc_acao')
          .order('sigla_acao');

        if (acoesError) throw acoesError;

        setAcoes(acoesData || []);

      } catch (error) {
        console.error('Erro ao buscar dados para filtros:', error);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Sincronizar estados locais com o contexto quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      // Salvar posição atual da rolagem
      const currentScroll = window.pageYOffset || window.scrollY;
      setScrollPosition(currentScroll);

      // Salvar estilos originais
      const originalOverflow = document.documentElement.style.overflow;
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const originalWidth = document.body.style.width;
      const originalBodyOverflow = document.body.style.overflow;

      // Bloquear rolagem no nível do documento e corpo
      document.documentElement.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${currentScroll}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      // Adicionar evento para bloquear rolagem com teclado e mouse
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };

      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'PageUp' || e.key === 'PageDown' || e.key === 'Space') {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      };

      // Adicionar event listeners
      document.addEventListener('wheel', handleWheel, { passive: false });
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('keydown', handleKeyDown, { capture: true });

      // Salvar referência para limpeza
      (window as any)._scrollBlockers = {
        handleWheel,
        handleTouchMove,
        handleKeyDown,
        originalOverflow,
        originalPosition,
        originalTop,
        originalWidth,
        originalBodyOverflow
      };

      setLocalSeveridade(filtroSeveridade);
      setLocalAcao(filtroAcao);
      setLocalNatureza(filtroNatureza);
      setLocalCategoria(filtroCategoria);
      setLocalSubcategoria(filtroSubcategoria);
    }
  }, [isOpen, filtroSeveridade, filtroAcao, filtroNatureza, filtroCategoria, filtroSubcategoria]);

  // Garantir que a rolagem seja restaurada quando o componente for montado com modal fechado
  useEffect(() => {
    if (!isOpen) {
      // Limpar qualquer bloqueio residual imediatamente
      document.documentElement.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';

      // Limpar referência residual
      delete (window as any)._scrollBlockers;
    }
  }, [isOpen]);

  // Cleanup function para garantir que a rolagem seja sempre restaurada
  useEffect(() => {
    return () => {
      // Restaurar rolagem quando o componente for desmontado
      const blockers = (window as any)._scrollBlockers;
      if (blockers) {
        document.documentElement.style.overflow = blockers.originalOverflow || '';
        document.body.style.position = blockers.originalPosition || '';
        document.body.style.top = blockers.originalTop || '';
        document.body.style.width = blockers.originalWidth || '';
        document.body.style.overflow = blockers.originalBodyOverflow || '';

        // Remover event listeners
        document.removeEventListener('wheel', blockers.handleWheel);
        document.removeEventListener('touchmove', blockers.handleTouchMove);
        document.removeEventListener('keydown', blockers.handleKeyDown);

        // Limpar referência
        delete (window as any)._scrollBlockers;
      }
    };
  }, []);

  // Restaurar rolagem quando o modal fechar
  useEffect(() => {
    if (!isOpen) {
      // Restaurar estilos originais imediatamente
      const blockers = (window as any)._scrollBlockers;
      if (blockers) {
        document.documentElement.style.overflow = blockers.originalOverflow || '';
        document.body.style.position = blockers.originalPosition || '';
        document.body.style.top = blockers.originalTop || '';
        document.body.style.width = blockers.originalWidth || '';
        document.body.style.overflow = blockers.originalBodyOverflow || '';

        // Remover event listeners
        document.removeEventListener('wheel', blockers.handleWheel);
        document.removeEventListener('touchmove', blockers.handleTouchMove);
        document.removeEventListener('keydown', blockers.handleKeyDown);

        // Limpar referência
        delete (window as any)._scrollBlockers;
      } else {
        // Fallback se não houver referência salva
        document.documentElement.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
      }

      // Restaurar posição da rolagem
      if (scrollPosition > 0) {
        setTimeout(() => {
          window.scrollTo(0, scrollPosition);
        }, 0);
      }
    }
  }, [isOpen, scrollPosition]);

  // Efeito adicional para garantir que a rolagem seja restaurada
  useEffect(() => {
    return () => {
      // Cleanup final para garantir que a rolagem seja sempre restaurada
      document.documentElement.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';

      // Forçar restauração da rolagem
      window.scrollTo(0, scrollPosition);
    };
  }, [scrollPosition]);

  // Filtrar categorias baseado na natureza selecionada
  const categoriasFiltradas = localNatureza 
    ? categorias.filter(cat => cat.id_natureza === localNatureza)
    : categorias;

  // Filtrar subcategorias baseado na categoria selecionada
  const subcategoriasFiltradas = localCategoria 
    ? subcategorias.filter(sub => sub.id_categoria === localCategoria)
    : subcategorias;

  // Aplicar filtros
  const handleApplyFilters = () => {
    setFiltroSeveridade(localSeveridade);
    setFiltroAcao(localAcao);
    setFiltroNatureza(localNatureza);
    setFiltroCategoria(localCategoria);
    setFiltroSubcategoria(localSubcategoria);
    onClose();
  };

  // Limpar filtros
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-[9999]" style={{ paddingTop: '20px' }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[calc(90vh-40px)] overflow-hidden flex flex-col">
        <div className="flex-none">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Filtros do Portfólio de Ações</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content com rolagem interna */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Filtro de Severidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Severidade
            </label>
            <div className="space-y-2">
              {severidadeOptions.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="severidade"
                    value={option.value}
                    checked={localSeveridade === option.value}
                    onChange={(e) => setLocalSeveridade(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${option.color}`}></div>
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </div>
                </label>
              ))}
              <label className="flex items-center">
                <input
                  type="radio"
                  name="severidade"
                  value=""
                  checked={localSeveridade === null}
                  onChange={() => setLocalSeveridade(null)}
                  className="mr-3"
                />
                <span className="text-sm text-gray-700">Todas as severidades</span>
              </label>
            </div>
          </div>

          {/* Filtro de Ação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ação
            </label>
            <select
              value={localAcao || ''}
              onChange={(e) => setLocalAcao(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as ações</option>
              {acoes.map((acao) => (
                <option key={acao.id} value={acao.id}>
                  {acao.sigla_acao} - {acao.desc_acao}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Natureza */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Natureza
            </label>
            <select
              value={localNatureza || ''}
              onChange={(e) => handleNaturezaChange(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as naturezas</option>
              {naturezas.map((natureza) => (
                <option key={natureza.id} value={natureza.id}>
                  {natureza.desc_natureza}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              value={localCategoria || ''}
              onChange={(e) => handleCategoriaChange(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!localNatureza}
            >
              <option value="">
                {localNatureza ? 'Todas as categorias' : 'Selecione uma natureza primeiro'}
              </option>
              {categoriasFiltradas.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.desc_categoria}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Subcategoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategoria
            </label>
            <select
              value={localSubcategoria || ''}
              onChange={(e) => setLocalSubcategoria(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!localCategoria}
            >
              <option value="">
                {localCategoria ? 'Todas as subcategorias' : 'Selecione uma categoria primeiro'}
              </option>
              {subcategoriasFiltradas.map((subcategoria) => (
                <option key={subcategoria.id} value={subcategoria.id}>
                  {subcategoria.desc_subcategoria}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-none">
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Limpar Filtros
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioAcoesFilterModal;