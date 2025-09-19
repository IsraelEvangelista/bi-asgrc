import React, { useState, useEffect } from 'react';
import { Filter, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useFilter } from '../contexts/FilterContext';
import { supabase } from '../lib/supabase';

interface Natureza {
  id: number;
  natureza: string;
}

interface EventoRisco {
  id: string;
  evento_risco: string;
  display_text: string;
}

interface ResponsavelRisco {
  id: number;
  responsavel_risco: string;
}

interface MatrizRiscoFilterSectionProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const MatrizRiscoFilterSection: React.FC<MatrizRiscoFilterSectionProps> = ({
  isExpanded,
  onToggle
}) => {
  const {
    filtroSeveridade,
    filtroNatureza,
    filtroQuadrante,
    filtroEventoRisco,
    filtroResponsavelRisco,
    setFiltroSeveridade,
    setFiltroNatureza,
    setFiltroQuadrante,
    setFiltroEventoRisco,
    setFiltroResponsavelRisco,
    clearAllFilters
  } = useFilter();

  const [localSeveridade, setLocalSeveridade] = useState<string | null>(filtroSeveridade);
  const [localNatureza, setLocalNatureza] = useState<string | null>(filtroNatureza);
  const [localQuadrante, setLocalQuadrante] = useState<{ impacto: number; probabilidade: number } | null>(filtroQuadrante);
  const [localEventoRisco, setLocalEventoRisco] = useState<string | null>(filtroEventoRisco);
  const [localResponsavelRisco, setLocalResponsavelRisco] = useState<string | null>(filtroResponsavelRisco);
  const [naturezas, setNaturezas] = useState<Natureza[]>([]);
  const [eventosRisco, setEventosRisco] = useState<EventoRisco[]>([]);
  const [responsaveisRisco, setResponsaveisRisco] = useState<ResponsavelRisco[]>([]);

  // Opções de severidade
  const severidadeOptions = [
    { value: 'Baixo', label: 'Baixo (0-4)', color: 'bg-green-500' },
    { value: 'Moderado', label: 'Moderado (5-9)', color: 'bg-yellow-500' },
    { value: 'Alto', label: 'Alto (10-19)', color: 'bg-orange-500' },
    { value: 'Muito Alto', label: 'Muito Alto (20+)', color: 'bg-red-600' }
  ];

  // Opções de quadrante
  const quadranteOptions = [
    { 
      value: { impacto: 1, probabilidade: 1 }, 
      label: 'Baixo Risco (Prob ≤2, Imp ≤2)', 
      color: 'bg-green-500' 
    },
    { 
      value: { impacto: 2, probabilidade: 3 }, 
      label: 'Risco Moderado (Prob ≤2 e Imp ≥3 ou Prob ≥3 e Imp ≤2)', 
      color: 'bg-yellow-500' 
    },
    { 
      value: { impacto: 3, probabilidade: 3 }, 
      label: 'Alto Risco (Prob ≥3, Imp ≥3)', 
      color: 'bg-red-600' 
    }
  ];

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        // Buscar naturezas da tabela correta
        const { data: naturezasData, error: naturezasError } = await supabase
          .from('010_natureza')
          .select('id, desc_natureza')
          .order('desc_natureza');

        if (naturezasError) {
          console.error('Erro ao buscar naturezas:', naturezasError);
        } else {
          const naturezasFormatadas = (naturezasData || []).map(item => ({
            id: item.id,
            natureza: item.desc_natureza
          }));
          setNaturezas(naturezasFormatadas);
        }

        // Buscar eventos de risco únicos com sigla
        const { data: eventosData, error: eventosError } = await supabase
          .from('006_matriz_riscos')
          .select('eventos_riscos, sigla')
          .not('eventos_riscos', 'is', null)
          .not('sigla', 'is', null)
          .order('eventos_riscos');

        if (eventosError) {
          console.error('Erro ao buscar eventos de risco:', eventosError);
        } else {
          const eventosMap = new Map();
          eventosData?.forEach(item => {
            if (item.eventos_riscos && item.sigla) {
              const displayText = `${item.sigla} - ${item.eventos_riscos}`;
              eventosMap.set(item.eventos_riscos, {
                id: item.eventos_riscos,
                evento_risco: item.eventos_riscos,
                display_text: displayText
              });
            }
          });
          setEventosRisco(Array.from(eventosMap.values()));
        }

        // Buscar responsáveis pelo risco
        const { data: responsaveisData, error: responsaveisError } = await supabase
          .from('003_areas_gerencias')
          .select('id, sigla_area')
          .not('sigla_area', 'is', null)
          .order('sigla_area');

        if (responsaveisError) {
          console.error('Erro ao buscar responsáveis pelo risco:', responsaveisError);
        } else {
          const responsaveisFormatados = (responsaveisData || []).map(item => ({
            id: item.id,
            responsavel_risco: item.sigla_area
          }));
          setResponsaveisRisco(responsaveisFormatados);
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
      setLocalNatureza(filtroNatureza);
      setLocalQuadrante(filtroQuadrante);
      setLocalEventoRisco(filtroEventoRisco);
      setLocalResponsavelRisco(filtroResponsavelRisco);
    }
  }, [isExpanded, filtroSeveridade, filtroNatureza, filtroQuadrante, filtroEventoRisco, filtroResponsavelRisco]);

  const handleApplyFilters = () => {
    setFiltroSeveridade(localSeveridade);
    setFiltroNatureza(localNatureza);
    setFiltroQuadrante(localQuadrante);
    setFiltroEventoRisco(localEventoRisco);
    setFiltroResponsavelRisco(localResponsavelRisco);
  };

  const handleClearFilters = () => {
    setLocalSeveridade(null);
    setLocalNatureza(null);
    setLocalQuadrante(null);
    setLocalEventoRisco(null);
    setLocalResponsavelRisco(null);
    clearAllFilters();
  };

  const isQuadranteSelected = (quadrante: { impacto: number; probabilidade: number }) => {
    if (!localQuadrante) return false;
    
    const { impacto, probabilidade } = quadrante;
    const { impacto: localImp, probabilidade: localProb } = localQuadrante;
    
    if (impacto === 1 && probabilidade === 1) {
      return localProb <= 2 && localImp <= 2;
    } else if (impacto === 2 && probabilidade === 3) {
      return (localProb <= 2 && localImp >= 3) || (localProb >= 3 && localImp <= 2);
    } else if (impacto === 3 && probabilidade === 3) {
      return localProb >= 3 && localImp >= 3;
    }
    
    return false;
  };

  // Verificar se há filtros ativos
  const hasActiveFilters = filtroSeveridade || filtroQuadrante || filtroNatureza || filtroEventoRisco || filtroResponsavelRisco;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header da seção de filtros */}
      <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Matriz de Risco</h1>
          <p className="text-gray-600">Análise e visualização dos riscos organizacionais</p>
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
          {/* Layout em 3 colunas e 2 linhas + linha de botões */}
          <div className="grid grid-cols-3 gap-6">
            {/* COLUNA 1: Severidade (ocupando linhas 1 e 2) */}
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

            {/* COLUNA 2, LINHA 1: Responsável pelo Risco */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsável pelo Risco
              </label>
              <select
                value={localResponsavelRisco || ''}
                onChange={(e) => setLocalResponsavelRisco(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 hover:bg-gray-50"
              >
                <option value="" className="text-gray-900">Todos os responsáveis</option>
                {responsaveisRisco.map(responsavel => (
                  <option 
                    key={responsavel.id} 
                    value={responsavel.id.toString()}
                    className="text-gray-900"
                  >
                    {responsavel.responsavel_risco}
                  </option>
                ))}
              </select>
            </div>

            {/* COLUNA 3, LINHA 1: Natureza do Risco */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Natureza do Risco
              </label>
              <select
                value={localNatureza || ''}
                onChange={(e) => setLocalNatureza(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 hover:bg-gray-50"
              >
                <option value="" className="text-gray-900">Todas as naturezas</option>
                {naturezas.map(natureza => (
                  <option 
                    key={natureza.id} 
                    value={natureza.id.toString()}
                    className="text-gray-900"
                  >
                    {natureza.natureza}
                  </option>
                ))}
              </select>
            </div>

            {/* COLUNA 2 e 3, LINHA 2: Evento de Risco */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evento de Risco
              </label>
              <select
                value={localEventoRisco || ''}
                onChange={(e) => setLocalEventoRisco(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 hover:bg-gray-50"
              >
                <option value="" className="text-gray-900">Todos os eventos</option>
                {eventosRisco.map(evento => (
                  <option 
                    key={evento.id} 
                    value={evento.evento_risco}
                    className="text-gray-900"
                  >
                    {evento.display_text}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* LINHA 3: Botões alinhados à direita */}
          <div className="mt-6 flex justify-end gap-2">
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

export default MatrizRiscoFilterSection;