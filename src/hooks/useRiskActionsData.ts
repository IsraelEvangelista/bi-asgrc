import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface StatusData {
  emImplementacao: number;
  implementada: number;
  naoIniciada: number;
}

interface RiskData {
  riskId: string;
  statusData: StatusData;
}

interface RiskActionsData {
  riskData: RiskData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Removidos dados mock - agora usando apenas dados reais do Supabase

export const useRiskActionsData = (filters?: {
  searchTerm?: string;
  tipo_acao?: string;
  status?: string;
  situacao?: string;
  area_executora?: string;
  selectedStatus?: string;
  selectedPrazo?: string;
}): RiskActionsData => {
  const [riskData, setRiskData] = useState<RiskData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRiskActionsData = async (isMounted = true) => {
    try {
      if (!isMounted) return;
      
      setLoading(true);
      setError(null);

      // Filtrar apenas os riscos específicos
      const targetRisks = ['R01', 'R02', 'R03', 'R04', 'R05', 'R09', 'R17', 'R35'];
      
      // Inicializar todos os riscos alvo com valores zerados como fallback
      const riskMap = new Map<string, StatusData>();
      targetRisks.forEach(risk => {
        riskMap.set(risk, {
          emImplementacao: 0,
          implementada: 0,
          naoIniciada: 0
        });
      });

      // Tentar buscar dados reais, mas com fallback seguro
      try {
        console.log('Tentando buscar dados da relação riscos-ações...');
        console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
        console.log('Supabase client:', !!supabase);
        
        // Consulta simplificada primeiro para testar conectividade
        const testQuery = supabase
          .from('016_rel_acoes_riscos')
          .select('count')
          .limit(1);
        
        console.log('Executando consulta de teste...');
        const testResult = await testQuery;
        console.log('Resultado da consulta de teste:', { data: testResult.data, error: testResult.error });
        
        if (testResult.error) {
          console.warn('Tabela 016_rel_acoes_riscos não encontrada ou sem permissão:', testResult.error.message);
          throw new Error('Tabela não acessível');
        }
        
        // Se chegou até aqui, a tabela existe, tentar consulta com JOINs
        // Buscar TODOS os dados primeiro, depois aplicar filtros localmente
        let query = supabase
          .from('016_rel_acoes_riscos')
          .select(`
            id_risco,
            id_acao,
            matriz_riscos:006_matriz_riscos!016_rel_acoes_riscos_id_risco_fkey(
              sigla
            ),
            acoes:009_acoes!016_rel_acoes_riscos_id_acao_fkey(
              status,
              situacao,
              tipo_acao,
              desc_acao,
              area_executora
            )
          `)
          .limit(1000); // Buscar mais dados para garantir que temos todos os registros
        
        const { data, error: fetchError } = await query;
        
        if (fetchError) {
          console.warn('Erro na consulta com JOINs:', fetchError.message);
          // Não lançar erro, usar dados zerados como fallback
        } else if (data && data.length > 0) {
          console.log('Consulta bem-sucedida:', data.length, 'registros');
          console.log('Filtros a aplicar:', filters);
          
          // Processar os dados retornados - SEMPRE filtrar pelos riscos específicos
          data.forEach((item: any) => {
            const sigla = item.matriz_riscos?.sigla;
            const status = item.acoes?.status;
            const situacao = item.acoes?.situacao;
            const tipo_acao = item.acoes?.tipo_acao;
            const desc_acao = item.acoes?.desc_acao;
            const area_executora = item.acoes?.area_executora;
            
            // FILTRO BASE: Apenas riscos específicos (SEMPRE aplicado)
            if (sigla && targetRisks.includes(sigla) && status) {
              
              // Aplicar filtros localmente
              let includeRecord = true;
              
              if (filters) {
                // Filtro por status
                if (filters.status || filters.selectedStatus) {
                  const statusFilter = filters.status || filters.selectedStatus;
                  if (status !== statusFilter) {
                    includeRecord = false;
                  }
                }
                
                // Filtro por situação
                if (includeRecord && filters.situacao && situacao !== filters.situacao) {
                  includeRecord = false;
                }
                
                // Filtro por prazo (baseado na situação)
                if (includeRecord && filters.selectedPrazo) {
                  if (filters.selectedPrazo === 'no_prazo' && situacao !== 'No Prazo') {
                    includeRecord = false;
                  } else if (filters.selectedPrazo === 'atrasado' && situacao !== 'Atrasado') {
                    includeRecord = false;
                  }
                }
                
                // Filtro por tipo de ação
                if (includeRecord && filters.tipo_acao && tipo_acao !== filters.tipo_acao) {
                  includeRecord = false;
                }
                
                // Filtro por área executora
                if (includeRecord && filters.area_executora && area_executora) {
                  if (Array.isArray(area_executora)) {
                    if (!area_executora.includes(filters.area_executora)) {
                      includeRecord = false;
                    }
                  } else {
                    if (area_executora !== filters.area_executora) {
                      includeRecord = false;
                    }
                  }
                }
                
                // Filtro por termo de busca
                if (includeRecord && filters.searchTerm && desc_acao) {
                  if (!desc_acao.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
                    includeRecord = false;
                  }
                }
              }
              
              // Se passou por todos os filtros, incluir no resultado
              if (includeRecord) {
                console.log(`Processando risco: ${sigla}, status: ${status}`);
                
                const currentData = riskMap.get(sigla)!;
                
                // Mapear status para as categorias corretas
                switch (status) {
                  case 'Em implementação':
                    currentData.emImplementacao++;
                    break;
                  case 'Implementada':
                    currentData.implementada++;
                    break;
                  case 'Não Iniciada':
                  case 'Não iniciada':
                    currentData.naoIniciada++;
                    break;
                  default:
                    console.warn(`Status desconhecido: ${status}`);
                }
                
                riskMap.set(sigla, currentData);
              }
            }
          });
          
          // Log dos resultados finais
          console.log('Dados processados por risco após filtros:');
          targetRisks.forEach(risk => {
            const data = riskMap.get(risk);
            console.log(`${risk}:`, data);
          });
        }
      } catch (queryError) {
        console.warn('Falha ao buscar dados, usando valores zerados:', queryError);
        // Manter os valores zerados já inicializados
        setError('Dados indisponíveis - exibindo valores zerados');
      }

      // Converter para array e ordenar pelos riscos alvo
      const processedRiskData: RiskData[] = targetRisks.map(risk => ({
        riskId: risk,
        statusData: riskMap.get(risk)!
      }));

      setRiskData(processedRiskData);
    } catch (err) {
      console.error('Erro no useRiskActionsData:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      
      // Em caso de erro, garantir que temos dados vazios para não quebrar a UI
      const targetRisks = ['R01', 'R02', 'R03', 'R04', 'R05', 'R09', 'R17', 'R35'];
      const fallbackData: RiskData[] = targetRisks.map(risk => ({
        riskId: risk,
        statusData: {
          emImplementacao: 0,
          implementada: 0,
          naoIniciada: 0
        }
      }));
      setRiskData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchRiskActionsData(true);
  };

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (isMounted) {
        await fetchRiskActionsData(isMounted);
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [
    filters?.searchTerm,
    filters?.tipo_acao,
    filters?.status,
    filters?.situacao,
    filters?.area_executora,
    filters?.selectedStatus,
    filters?.selectedPrazo
  ]);

  return {
    riskData,
    loading,
    error,
    refetch
  };
};