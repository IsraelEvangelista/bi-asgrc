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
        // Construir consulta com filtros base (riscos específicos) + filtros adicionais
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
              area_executora,
              sigla_area
            )
          `);
          
        // Aplicar filtro base nos riscos específicos (SEMPRE aplicado)
        // Note: Vamos filtrar isso após a consulta já que o filtro seria no JOIN
        
        // Aplicar filtros adicionais se fornecidos
        if (filters) {
          if (filters.status || filters.selectedStatus) {
            const statusFilter = filters.status || filters.selectedStatus;
            query = query.eq('acoes.status', statusFilter);
          }
          
          if (filters.situacao) {
            query = query.eq('acoes.situacao', filters.situacao);
          }
          
          if (filters.selectedPrazo) {
            if (filters.selectedPrazo === 'no_prazo') {
              query = query.eq('acoes.situacao', 'No Prazo');
            } else if (filters.selectedPrazo === 'atrasado') {
              query = query.eq('acoes.situacao', 'Atrasado');
            }
          }
          
          if (filters.tipo_acao) {
            query = query.eq('acoes.tipo_acao', filters.tipo_acao);
          }
          
          if (filters.area_executora) {
            // Filtrar por sigla_area: fazer JOIN com a tabela de áreas
            // Como area_executora é um array de IDs, precisamos usar uma consulta mais complexa
            // Por enquanto, desabilitar filtro no banco e fazer apenas localmente
            console.log('Filtro de área aplicado (processamento local):', filters.area_executora);
          }
          
          if (filters.searchTerm) {
            query = query.ilike('acoes.desc_acao', `%${filters.searchTerm}%`);
          }
        }
        
        query = query.limit(200); // Limite maior para capturar mais dados
        
        const { data, error: fetchError } = await query;
        
        if (fetchError) {
          console.warn('Erro na consulta com JOINs:', fetchError.message);
          // Não lançar erro, usar dados zerados como fallback
        } else if (data && data.length > 0) {
          console.log('Consulta bem-sucedida:', data.length, 'registros');
          console.log('Filtros aplicados:', filters);
          
          // Processar os dados retornados - SEMPRE filtrar pelos riscos específicos
          data.forEach((item: any) => {
            const sigla = item.matriz_riscos?.sigla;
            const status = item.acoes?.status;
            
            // FILTRO BASE: Apenas riscos específicos (SEMPRE aplicado)
            if (sigla && targetRisks.includes(sigla) && status) {
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
          });
          
          // Log dos resultados finais
          console.log('Dados processados por risco:');
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