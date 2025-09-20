import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useFilter } from '../contexts/FilterContext';

export interface RiscoPorNatureza {
  id_natureza: number;
  desc_natureza: string;
  baixo: number;
  moderado: number;
  alto: number;
  muitoAlto: number;
  total: number;
}

interface RiscoRelacionado {
  id_risco: number;
  id_natureza: number;
  desc_natureza: string;
  severidade: number;
  probabilidade: number;
  impacto: number;
  eventos_riscos?: string;
  responsavel_risco?: string;
}

const calcularClassificacaoSeveridade = (severidade: number): string => {
  if (severidade >= 20) return 'muitoAlto';
  if (severidade >= 10) return 'alto';
  if (severidade >= 5) return 'moderado';
  return 'baixo';
};

// Função para calcular severidade baseada no valor numérico (igual ao MatrizRisco.tsx)
const calcularSeveridadePorValor = (severidade: number): string => {
  if (severidade >= 20) return 'Muito Alto';
  if (severidade >= 10 && severidade < 20) return 'Alto';
  if (severidade >= 5 && severidade < 10) return 'Moderado';
  return 'Baixo';
};

// Função para aplicar filtros nos riscos
const aplicarFiltros = (
  riscos: RiscoRelacionado[], 
  filtroSeveridade: string | null, 
  filtroQuadrante: { impacto: number; probabilidade: number } | null, 
  filtroNatureza: string | null,
  filtroEventoRisco: string | null,
  filtroResponsavelRisco: string | null
): RiscoRelacionado[] => {
  console.log('🔍 APLICANDO FILTROS:');
  console.log('📊 Total de riscos antes dos filtros:', riscos.length);
  console.log('🎯 Filtros recebidos:', { 
    filtroSeveridade, 
    filtroQuadrante, 
    filtroNatureza, 
    filtroEventoRisco, 
    filtroResponsavelRisco 
  });
  
  let filtered = riscos;
  
  // Filtro por severidade
  if (filtroSeveridade) {
    const antesCount = filtered.length;
    filtered = filtered.filter(risco => {
      const severidadeCalculada = calcularSeveridadePorValor(risco.severidade);
      const match = severidadeCalculada === filtroSeveridade;
      return match;
    });
    console.log(`🔍 Filtro Severidade: ${antesCount} → ${filtered.length} riscos`);
  }
  
  // Filtro por quadrante
  if (filtroQuadrante) {
    const antesCount = filtered.length;
    filtered = filtered.filter(risco => 
      risco.impacto === filtroQuadrante.impacto && 
      risco.probabilidade === filtroQuadrante.probabilidade
    );
    console.log(`🔍 Filtro Quadrante: ${antesCount} → ${filtered.length} riscos`);
  }
  
  // Filtro por natureza
  if (filtroNatureza) {
    const antesCount = filtered.length;
    filtered = filtered.filter(risco => {
      const match = risco.id_natureza.toString() === filtroNatureza;
      return match;
    });
    console.log(`🔍 Filtro Natureza (ID ${filtroNatureza}): ${antesCount} → ${filtered.length} riscos`);
  }
  
  // Filtro por evento de risco
  if (filtroEventoRisco) {
    const antesCount = filtered.length;
    filtered = filtered.filter(risco => {
      const match = risco.eventos_riscos === filtroEventoRisco;
      return match;
    });
    console.log(`🔍 Filtro Evento de Risco: ${antesCount} → ${filtered.length} riscos`);
  }
  
  // Filtro por responsável pelo risco
  if (filtroResponsavelRisco) {
    const antesCount = filtered.length;
    filtered = filtered.filter(risco => {
      const match = risco.responsavel_risco === filtroResponsavelRisco;
      return match;
    });
    console.log(`🔍 Filtro Responsável pelo Risco: ${antesCount} → ${filtered.length} riscos`);
  }
  
  console.log('🎯 RESULTADO FINAL DOS FILTROS:', filtered.length, 'riscos');
  
  return filtered;
};

export const useRiscosPorNatureza = () => {
  const [riscosPorNatureza, setRiscosPorNatureza] = useState<RiscoPorNatureza[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { 
    filtroSeveridade, 
    filtroQuadrante, 
    filtroNatureza, 
    filtroEventoRisco, 
    filtroResponsavelRisco 
  } = useFilter();

  useEffect(() => {
    const fetchRiscosPorNatureza = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar dados das tabelas relacionadas
        console.log('🔍 Iniciando busca de riscos por natureza...');
        
        const { data: relRiscos, error: relError } = await supabase
          .from('018_rel_risco')
          .select(`
            id_risco,
            id_natureza,
            010_natureza!inner(
              desc_natureza
            ),
            006_matriz_riscos!inner(
              severidade,
              probabilidade,
              impacto,
              eventos_riscos,
              responsavel_risco
            )
          `);

        console.log('📊 Resultado da query:', { relRiscos, relError });
        console.log('📈 Quantidade de registros encontrados:', relRiscos?.length || 0);

        if (relError) {
          console.error('❌ Erro ao buscar dados de relacionamento:', relError);
          setError('Erro ao carregar dados de riscos por natureza');
          return;
        }

        if (!relRiscos || relRiscos.length === 0) {
          console.warn('⚠️ Nenhum dado encontrado na query');
          setRiscosPorNatureza([]);
          return;
        }

        // Processar dados para evitar duplicatas de riscos
        console.log('🔄 Iniciando processamento dos dados...');
        const riscosProcessados: RiscoRelacionado[] = [];
        const riscosVistos = new Set<string>();

        relRiscos.forEach((item: any) => {
          console.log('📝 Processando item:', item);
          const chaveUnica = `${item.id_risco}-${item.id_natureza}`;
          
          if (!riscosVistos.has(chaveUnica)) {
            riscosVistos.add(chaveUnica);
            const riscoProcessado = {
              id_risco: item.id_risco,
              id_natureza: item.id_natureza,
              desc_natureza: item['010_natureza']?.desc_natureza || 'Natureza não identificada',
              severidade: item['006_matriz_riscos']?.severidade || 0,
              probabilidade: item['006_matriz_riscos']?.probabilidade || 0,
              impacto: item['006_matriz_riscos']?.impacto || 0,
              eventos_riscos: item['006_matriz_riscos']?.eventos_riscos || null,
              responsavel_risco: item['006_matriz_riscos']?.responsavel_risco || null
            };
            console.log('✅ Risco processado:', riscoProcessado);
            riscosProcessados.push(riscoProcessado);
          }
        });
        
        console.log('📋 Total de riscos processados:', riscosProcessados.length);

        // Primeiro, agrupar TODOS os dados por natureza (sem filtros) para manter estrutura base
        const todasNaturezasMap = new Map<string, RiscoPorNatureza>();
        const naturezasComDados = new Set<string>();

        riscosProcessados.forEach((risco) => {
          const { id_natureza, desc_natureza } = risco;
          const idNaturezaStr = id_natureza.toString();
          naturezasComDados.add(idNaturezaStr);
          
          if (!todasNaturezasMap.has(idNaturezaStr)) {
            todasNaturezasMap.set(idNaturezaStr, {
              id_natureza,
              desc_natureza,
              baixo: 0,
              moderado: 0,
              alto: 0,
              muitoAlto: 0,
              total: 0
            });
          }
        });

        // CORREÇÃO CRÍTICA: Separar dados originais dos dados filtrados
        // 1. Primeiro calcular dados SEM filtros para manter estrutura base
        riscosProcessados.forEach((risco) => {
          const { id_natureza, severidade } = risco;
          const idNaturezaStr = id_natureza.toString();
          const classificacao = calcularClassificacaoSeveridade(severidade);

          const natureza = todasNaturezasMap.get(idNaturezaStr)!;
          natureza[classificacao as keyof Pick<RiscoPorNatureza, 'baixo' | 'moderado' | 'alto' | 'muitoAlto'>]++;
          natureza.total++;
        });

        // 2. Se há filtros ativos, criar nova estrutura apenas com dados filtrados
        if (filtroSeveridade || filtroQuadrante || filtroNatureza || filtroEventoRisco || filtroResponsavelRisco) {
          console.log('🔍 Aplicando filtros e recalculando contagens...');
          console.log('🎯 Filtros aplicados:', { 
            filtroSeveridade, 
            filtroQuadrante, 
            filtroNatureza, 
            filtroEventoRisco, 
            filtroResponsavelRisco 
          });
          
          // Aplicar filtros nos dados originais
          const riscosFiltrados = aplicarFiltros(
            riscosProcessados, 
            filtroSeveridade, 
            filtroQuadrante, 
            filtroNatureza, 
            filtroEventoRisco, 
            filtroResponsavelRisco
          );
          console.log('🔍 Riscos após aplicação de filtros:', riscosFiltrados.length);
          
          // CORREÇÃO: Criar nova estrutura apenas com dados filtrados, mas manter todas as naturezas
          const naturezasFiltradas = new Map<string, RiscoPorNatureza>();
          
          // Primeiro, inicializar todas as naturezas com zero
          todasNaturezasMap.forEach((natureza, id) => {
            naturezasFiltradas.set(id, {
              id_natureza: natureza.id_natureza,
              desc_natureza: natureza.desc_natureza,
              baixo: 0,
              moderado: 0,
              alto: 0,
              muitoAlto: 0,
              total: 0
            });
          });
          
          // Depois, contar apenas os riscos que passaram no filtro
          riscosFiltrados.forEach((risco) => {
            const { id_natureza, severidade } = risco;
            const idNaturezaStr = id_natureza.toString();
            const classificacao = calcularClassificacaoSeveridade(severidade);

            const natureza = naturezasFiltradas.get(idNaturezaStr)!;
            if (natureza) {
              natureza[classificacao as keyof Pick<RiscoPorNatureza, 'baixo' | 'moderado' | 'alto' | 'muitoAlto'>]++;
              natureza.total++;
            }
          });
          
          // Usar os dados filtrados
          todasNaturezasMap.clear();
          naturezasFiltradas.forEach((natureza, id) => {
            todasNaturezasMap.set(id, natureza);
          });
        }

        // SEMPRE retornar todas as naturezas que têm dados originais
        const resultado = Array.from(todasNaturezasMap.values())
          .filter(natureza => naturezasComDados.has(natureza.id_natureza.toString()))
          .sort((a, b) => {
            // Ordenar por total decrescente, mas manter naturezas com zero no final
            if (a.total === 0 && b.total === 0) return a.desc_natureza.localeCompare(b.desc_natureza);
            if (a.total === 0) return 1;
            if (b.total === 0) return -1;
            return b.total - a.total;
          });

        console.log('🎯 Resultado final para o gráfico:', resultado);
        console.log('📊 Quantidade de naturezas encontradas:', resultado.length);
        
        setRiscosPorNatureza(resultado);
      } catch (err) {
        console.error('Erro inesperado ao buscar riscos por natureza:', err);
        setError('Erro inesperado ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchRiscosPorNatureza();
  }, [filtroSeveridade, filtroQuadrante, filtroNatureza, filtroEventoRisco, filtroResponsavelRisco]);

  return {
    riscosPorNatureza,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      // Re-executar o useEffect
      const fetchRiscosPorNatureza = async () => {
        try {
          setLoading(true);
          setError(null);

          const { data: relRiscos, error: relError } = await supabase
            .from('018_rel_risco')
            .select(`
              id_risco,
              id_natureza,
              010_natureza!inner(
                desc_natureza
              ),
              006_matriz_riscos!inner(
                severidade,
                probabilidade,
                impacto
              )
            `);

          if (relError) {
            console.error('Erro ao buscar dados de relacionamento:', relError);
            setError('Erro ao carregar dados de riscos por natureza');
            return;
          }

          if (!relRiscos || relRiscos.length === 0) {
            setRiscosPorNatureza([]);
            return;
          }

          const riscosProcessados: RiscoRelacionado[] = [];
          const riscosVistos = new Set<string>();

          relRiscos.forEach((item: any) => {
            const chaveUnica = `${item.id_risco}-${item.id_natureza}`;
            
            if (!riscosVistos.has(chaveUnica)) {
              riscosVistos.add(chaveUnica);
              riscosProcessados.push({
                id_risco: item.id_risco,
                id_natureza: item.id_natureza,
                desc_natureza: item['010_natureza']?.desc_natureza || 'Natureza não identificada',
                severidade: item['006_matriz_riscos']?.severidade || 0,
                probabilidade: item['006_matriz_riscos']?.probabilidade || 0,
                impacto: item['006_matriz_riscos']?.impacto || 0
              });
            }
          });

          // Aplicar filtros nos dados processados
          const riscosFiltrados = aplicarFiltros(riscosProcessados, filtroSeveridade, filtroQuadrante, filtroNatureza, filtroEventoRisco, filtroResponsavelRisco);

          const naturezasMap = new Map<string, RiscoPorNatureza>();

          riscosFiltrados.forEach((risco) => {
            const { id_natureza, desc_natureza, severidade } = risco;
            const idNaturezaStr = id_natureza.toString();
            const classificacao = calcularClassificacaoSeveridade(severidade);

            if (!naturezasMap.has(idNaturezaStr)) {
              naturezasMap.set(idNaturezaStr, {
                id_natureza,
                desc_natureza,
                baixo: 0,
                moderado: 0,
                alto: 0,
                muitoAlto: 0,
                total: 0
              });
            }

            const natureza = naturezasMap.get(idNaturezaStr)!;
            natureza[classificacao as keyof Pick<RiscoPorNatureza, 'baixo' | 'moderado' | 'alto' | 'muitoAlto'>]++;
            natureza.total++;
          });

          const resultado = Array.from(naturezasMap.values())
            .sort((a, b) => b.total - a.total);

          setRiscosPorNatureza(resultado);
        } catch (err) {
          console.error('Erro inesperado ao buscar riscos por natureza:', err);
          setError('Erro inesperado ao carregar dados');
        } finally {
          setLoading(false);
        }
      };
      
      fetchRiscosPorNatureza();
    }
  };
};