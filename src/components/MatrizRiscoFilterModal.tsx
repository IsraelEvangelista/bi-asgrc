import React, { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
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
  id: string;
  responsavel_risco: string;
}

interface MatrizRiscoFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MatrizRiscoFilterModal: React.FC<MatrizRiscoFilterModalProps> = ({
  isOpen,
  onClose
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
          // Mapear para o formato esperado
          const naturezasFormatadas = (naturezasData || []).map(item => ({
            id: item.id,
            natureza: item.desc_natureza
          }));
          setNaturezas(naturezasFormatadas);
        }

        // Buscar eventos de risco únicos com sigla (concatenar sigla + ' - ' + eventos_riscos)
        const { data: eventosData, error: eventosError } = await supabase
          .from('006_matriz_riscos')
          .select('eventos_riscos, sigla')
          .not('eventos_riscos', 'is', null)
          .not('sigla', 'is', null)
          .order('eventos_riscos');

        if (eventosError) {
          console.error('Erro ao buscar eventos de risco:', eventosError);
        } else {
          // Remover duplicatas e criar array de objetos com concatenação
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

        // Buscar responsáveis pelo risco diretamente da tabela 003_areas_gerencias
        const { data: responsaveisData, error: responsaveisError } = await supabase
          .from('003_areas_gerencias')
          .select('id, sigla_area')
          .not('sigla_area', 'is', null)
          .order('sigla_area');

        if (responsaveisError) {
          console.error('Erro ao buscar responsáveis pelo risco:', responsaveisError);
        } else {
          // Criar array de objetos com sigla_area
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

    if (isOpen) {
      fetchFilterData();
    }
  }, [isOpen]);

  // Sincronizar estados locais com o contexto quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      setLocalSeveridade(filtroSeveridade);
      setLocalNatureza(filtroNatureza);
      setLocalQuadrante(filtroQuadrante);
      setLocalEventoRisco(filtroEventoRisco);
      setLocalResponsavelRisco(filtroResponsavelRisco);
    }
  }, [isOpen, filtroSeveridade, filtroNatureza, filtroQuadrante, filtroEventoRisco, filtroResponsavelRisco]);

  // Controle de scroll da interface principal
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      
      const originalBodyStyle = {
        position: document.body.style.position,
        top: document.body.style.top,
        width: document.body.style.width,
        overflow: document.body.style.overflow
      };
      
      const originalHtmlStyle = {
        overflow: document.documentElement.style.overflow
      };
      
      const mainContentWrapper = document.querySelector('.main-content-wrapper') as HTMLElement;
      const originalMainContentStyle = mainContentWrapper ? {
        overflow: mainContentWrapper.style.overflow,
        overflowY: mainContentWrapper.style.overflowY
      } : null;
      
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      
      if (mainContentWrapper) {
        mainContentWrapper.style.overflow = 'hidden';
        mainContentWrapper.style.overflowY = 'hidden';
      }
      
      return () => {
        document.body.style.position = originalBodyStyle.position;
        document.body.style.top = originalBodyStyle.top;
        document.body.style.width = originalBodyStyle.width;
        document.body.style.overflow = originalBodyStyle.overflow;
        document.documentElement.style.overflow = originalHtmlStyle.overflow;
        
        if (mainContentWrapper && originalMainContentStyle) {
          mainContentWrapper.style.overflow = originalMainContentStyle.overflow;
          mainContentWrapper.style.overflowY = originalMainContentStyle.overflowY;
        }
        
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const handleApplyFilters = () => {
    setFiltroSeveridade(localSeveridade);
    setFiltroNatureza(localNatureza);
    setFiltroQuadrante(localQuadrante);
    setFiltroEventoRisco(localEventoRisco);
    setFiltroResponsavelRisco(localResponsavelRisco);
    onClose();
  };

  const handleClearFilters = () => {
    setLocalSeveridade(null);
    setLocalNatureza(null);
    setLocalQuadrante(null);
    setLocalEventoRisco(null);
    setLocalResponsavelRisco(null);
    clearAllFilters();
    onClose();
  };

  const isQuadranteSelected = (quadrante: { impacto: number; probabilidade: number }) => {
    if (!localQuadrante) return false;
    
    // Lógica para determinar se o quadrante está selecionado
    const { impacto, probabilidade } = quadrante;
    const { impacto: localImp, probabilidade: localProb } = localQuadrante;
    
    if (impacto === 1 && probabilidade === 1) {
      // Baixo Risco
      return localProb <= 2 && localImp <= 2;
    } else if (impacto === 2 && probabilidade === 3) {
      // Risco Moderado
      return (localProb <= 2 && localImp >= 3) || (localProb >= 3 && localImp <= 2);
    } else if (impacto === 3 && probabilidade === 3) {
      // Alto Risco
      return localProb >= 3 && localImp >= 3;
    }
    
    return false;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed top-0 left-0 w-screen h-screen z-[9998] bg-black bg-opacity-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="fixed top-[50vh] left-[50vw] transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto z-[9999] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filtros da Matriz de Risco</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Severidade */}
          <div>
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

          {/* Natureza */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Natureza do Risco
            </label>
            <select
              value={localNatureza || ''}
              onChange={(e) => setLocalNatureza(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 hover:bg-gray-50"
              style={{ color: '#111827' }}
            >
              <option value="" className="text-gray-900">Todas as naturezas</option>
              {naturezas.map(natureza => (
                <option 
                  key={natureza.id} 
                  value={natureza.id.toString()}
                  className="text-gray-900 hover:bg-white hover:text-gray-900"
                  style={{ color: '#111827' }}
                >
                  {natureza.natureza}
                </option>
              ))}
            </select>
          </div>

          {/* Quadrante */}


          {/* Evento de Risco */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evento de Risco
            </label>
            <select
              value={localEventoRisco || ''}
              onChange={(e) => setLocalEventoRisco(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 hover:bg-gray-50"
              style={{ color: '#111827' }}
            >
              <option value="" className="text-gray-900">Todos os eventos</option>
              {eventosRisco.map(evento => (
                <option 
                  key={evento.id} 
                  value={evento.evento_risco}
                  className="text-gray-900 hover:bg-white hover:text-gray-900"
                  style={{ color: '#111827' }}
                >
                  {evento.display_text}
                </option>
              ))}
            </select>
          </div>

          {/* Responsável pelo Risco */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Responsável pelo Risco
            </label>
            <select
              value={localResponsavelRisco || ''}
              onChange={(e) => setLocalResponsavelRisco(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 hover:bg-gray-50"
              style={{ color: '#111827' }}
            >
              <option value="" className="text-gray-900">Todos os responsáveis</option>
              {responsaveisRisco.map(responsavel => (
                <option 
                  key={responsavel.id} 
                  value={responsavel.id}
                  className="text-gray-900 hover:bg-white hover:text-gray-900"
                  style={{ color: '#111827' }}
                >
                  {responsavel.responsavel_risco}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClearFilters}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Limpar Filtros
          </button>
          <button
            onClick={handleApplyFilters}
            className="px-8 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatrizRiscoFilterModal;