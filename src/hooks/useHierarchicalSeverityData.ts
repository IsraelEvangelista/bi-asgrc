import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  HierarchicalSeverityData,
  HierarchicalSeverityNode,
  HierarchicalLevel,
  HierarchicalSeverityStats
} from '../types/hierarchicalSeverity';

interface SelectRow {
  id_acao: string;
  id_risco: string;
  '009_acoes': {
    id: string;
    sigla_acao: string;
    desc_acao: string;
  }[];
  '006_matriz_riscos': {
    id: string;
    severidade: number;
  }[];
  '018_rel_risco': {
    id_natureza: string | null;
    id_categoria: string | null;
    id_subcategoria: string | null;
    '010_natureza': {
      desc_natureza: string;
    }[];
    '011_categoria': {
      desc_categoria: string;
    }[];
    '012_subcategoria': {
      desc_subcategoria: string;
    }[];
  }[];
}

interface NormalizedRow {
  id_acao: string;
  id_risco: string;
  severidade: number;
  acao: {
    id: string;
    sigla_acao: string;
    desc_acao: string;
  };
  naturezas: Array<{
    id_natureza: string | null;
    desc_natureza: string;
    categoria: {
      id_categoria: string | null;
      desc_categoria: string;
      subcategoria: {
        id_subcategoria: string | null;
        desc_subcategoria: string;
      } | null;
    } | null;
  }>;
}


export const useHierarchicalSeverityData = (): HierarchicalSeverityStats => {
  const [data, setData] = useState<HierarchicalSeverityData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHierarchicalSeverityData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await supabase
        .from('016_rel_acoes_riscos')
        .select(`
          id_acao,
          id_risco,
          009_acoes!inner(
            id,
            sigla_acao,
            desc_acao
          ),
          006_matriz_riscos!inner(
            id,
            severidade
          ),
          018_rel_risco(
            id_natureza,
            id_categoria,
            id_subcategoria,
            010_natureza(desc_natureza),
            011_categoria(desc_categoria),
            012_subcategoria(desc_subcategoria)
          )
        `)
        .not('006_matriz_riscos.severidade', 'is', null)
        .is('006_matriz_riscos.deleted_at', null)
        .is('016_rel_acoes_riscos.deleted_at', null)
        .is('018_rel_risco.deleted_at', null);

      // Type-safe extraction without assertions - TypeScript infers correctly
      const { data: rawData, error: fetchError } = response;

      // Handle empty dataset
      if (!rawData || !rawData.length) {
        const emptyStructure: HierarchicalSeverityData = {
          root: {
            id: 'root',
            label: 'Todas as Ações',
            level: HierarchicalLevel.ROOT,
            avg_severity: 0,
            risk_count: 0,
            children: []
          },
          allNodes: [],
          totalRisks: 0,
          overallAverageSeverity: 0
        };
        setData(emptyStructure);
        setLoading(false);
        return;
      }

      if (fetchError) throw fetchError;
      
      // Type-safe direct usage with validation
      const normalizedRelations = (rawData ?? []).map(normalizeRow);
      
      // Build hierarchical structure
      const hierarchicalData = buildHierarchicalStructure(normalizedRelations);
      
      setData(hierarchicalData);
    } catch (err) {
      console.error('Error fetching hierarchical severity data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const normalizeRow = (row: SelectRow): NormalizedRow => {
    // Access first element since !inner guarantees at least one result
    const acaoData = row['009_acoes'][0];
    const riscoData = row['006_matriz_riscos'][0];
    
    return {
      id_acao: row.id_acao,
      id_risco: row.id_risco,
      severidade: riscoData.severidade,
      acao: {
        id: acaoData.id,
        sigla_acao: acaoData.sigla_acao || '',
        desc_acao: acaoData.desc_acao
      },
      naturezas: row['018_rel_risco'].map(rel => ({
        id_natureza: rel.id_natureza,
        desc_natureza: rel['010_natureza']?.[0]?.desc_natureza || '',
        categoria: rel['011_categoria']?.[0] ? {
          id_categoria: rel.id_categoria,
          desc_categoria: rel['011_categoria'][0]?.desc_categoria || '',
          subcategoria: rel['012_subcategoria']?.[0] ? {
            id_subcategoria: rel.id_subcategoria,
            desc_subcategoria: rel['012_subcategoria'][0]?.desc_subcategoria || ''
          } : null
        } : null
      }))
    };
  };

  const buildHierarchicalStructure = (riskRelations: NormalizedRow[]): HierarchicalSeverityData => {
    const allNodes: HierarchicalSeverityNode[] = [];
    
    // Calculate root node stats using unique risks
    const uniqueRisks = new Set(riskRelations.map(r => r.id_risco));
    const riskSeverityMap = new Map<string, number>();
    
    // Calculate severity for each unique risk
    riskRelations.forEach(relation => {
      if (!riskSeverityMap.has(relation.id_risco)) {
        riskSeverityMap.set(relation.id_risco, relation.severidade);
      }
    });
    
    const totalSeverity = Array.from(riskSeverityMap.values()).reduce((sum, severity) => sum + severity, 0);
    const overallAverage = uniqueRisks.size > 0 ? Number((totalSeverity / uniqueRisks.size).toFixed(2)) : 0;
    
    const rootNode: HierarchicalSeverityNode = {
      id: 'root',
      label: 'Todas as Ações',
      level: HierarchicalLevel.ROOT,
      avg_severity: overallAverage,
      risk_count: uniqueRisks.size,
      children: []
    };
    allNodes.push(rootNode);
    
    // Group by action
    const actionGroups = new Map<string, Set<string>>();
    const actionSeverityMap = new Map<string, Map<string, number>>();
    
    riskRelations.forEach(relation => {
      if (!actionGroups.has(relation.id_acao)) {
        actionGroups.set(relation.id_acao, new Set());
        actionSeverityMap.set(relation.id_acao, new Map());
      }
      actionGroups.get(relation.id_acao)!.add(relation.id_risco);
      actionSeverityMap.get(relation.id_acao)!.set(relation.id_risco, relation.severidade);
    });
    
    // Create action nodes
    const actionNodes: HierarchicalSeverityNode[] = [];
    
    actionGroups.forEach((riskIds, acaoId) => {
      const severities = actionSeverityMap.get(acaoId)!;
      const totalSeverity = Array.from(severities.values()).reduce((sum, severity) => sum + severity, 0);
      const avgSeverity = riskIds.size > 0 ? Number((totalSeverity / riskIds.size).toFixed(2)) : 0;
      
      const acao = riskRelations.find(r => r.id_acao === acaoId)?.acao!;
      
      const actionNode: HierarchicalSeverityNode = {
        id: `acao-${acaoId}`,
        label: acao.sigla_acao || acao.desc_acao,
        level: HierarchicalLevel.ACAO,
        avg_severity: avgSeverity,
        risk_count: riskIds.size,
        parent_id: 'root',
        original_id: acaoId,
        children: []
      };
      allNodes.push(actionNode);
      actionNodes.push(actionNode);
      
      // Group by natureza within this action
      const naturezaGroups = new Map<string, Set<string>>();
      const naturezaSeverityMap = new Map<string, Map<string, number>>();
      
      riskRelations
        .filter(relation => relation.id_acao === acaoId)
        .forEach(relation => {
          relation.naturezas.forEach(natureza => {
            if (natureza.id_natureza) {
              if (!naturezaGroups.has(natureza.id_natureza)) {
                naturezaGroups.set(natureza.id_natureza, new Set());
                naturezaSeverityMap.set(natureza.id_natureza, new Map());
              }
              naturezaGroups.get(natureza.id_natureza)!.add(relation.id_risco);
              naturezaSeverityMap.get(natureza.id_natureza)!.set(relation.id_risco, relation.severidade);
            }
          });
        });
      
      // Create natureza nodes
      const naturezaNodes: HierarchicalSeverityNode[] = [];
      
      naturezaGroups.forEach((riskIds, naturezaId) => {
        const severities = naturezaSeverityMap.get(naturezaId)!;
        const totalSeverity = Array.from(severities.values()).reduce((sum, severity) => sum + severity, 0);
        const avgSeverity = riskIds.size > 0 ? Number((totalSeverity / riskIds.size).toFixed(2)) : 0;
        
        const natureza = riskRelations
          .flatMap(r => r.naturezas)
          .find(n => n.id_natureza === naturezaId)!;
        
        const naturezaNode: HierarchicalSeverityNode = {
          id: `natureza-${naturezaId}`,
          label: natureza.desc_natureza,
          level: HierarchicalLevel.NATUREZA,
          avg_severity: avgSeverity,
          risk_count: riskIds.size,
          parent_id: `acao-${acaoId}`,
          original_id: naturezaId,
          children: []
        };
        allNodes.push(naturezaNode);
        naturezaNodes.push(naturezaNode);
        
        // Group by categoria within this natureza
        const categoriaGroups = new Map<string, Set<string>>();
        const categoriaSeverityMap = new Map<string, Map<string, number>>();
        
        riskRelations
          .filter(relation => relation.id_acao === acaoId)
          .forEach(relation => {
            relation.naturezas.forEach(natureza => {
              if (natureza.id_natureza === naturezaId && natureza.categoria && natureza.categoria.id_categoria) {
                if (!categoriaGroups.has(natureza.categoria.id_categoria)) {
                  categoriaGroups.set(natureza.categoria.id_categoria, new Set());
                  categoriaSeverityMap.set(natureza.categoria.id_categoria, new Map());
                }
                categoriaGroups.get(natureza.categoria.id_categoria)!.add(relation.id_risco);
                categoriaSeverityMap.get(natureza.categoria.id_categoria)!.set(relation.id_risco, relation.severidade);
              }
            });
          });
        
        // Create categoria nodes
        const categoriaNodes: HierarchicalSeverityNode[] = [];
        
        categoriaGroups.forEach((riskIds, categoriaId) => {
          const severities = categoriaSeverityMap.get(categoriaId)!;
          const totalSeverity = Array.from(severities.values()).reduce((sum, severity) => sum + severity, 0);
          const avgSeverity = riskIds.size > 0 ? Number((totalSeverity / riskIds.size).toFixed(2)) : 0;
          
          const categoria = riskRelations
            .flatMap(r => r.naturezas)
            .flatMap(n => n.categoria)
            .find(c => c && c.id_categoria === categoriaId)!;
          
          const categoriaNode: HierarchicalSeverityNode = {
            id: `categoria-${categoriaId}`,
            label: categoria.desc_categoria,
            level: HierarchicalLevel.CATEGORIA,
            avg_severity: avgSeverity,
            risk_count: riskIds.size,
            parent_id: `natureza-${naturezaId}`,
            original_id: categoriaId,
            children: []
          };
          allNodes.push(categoriaNode);
          categoriaNodes.push(categoriaNode);
          
          // Group by subcategoria within this categoria
          const subcategoriaGroups = new Map<string, Set<string>>();
          const subcategoriaSeverityMap = new Map<string, Map<string, number>>();
          
          riskRelations
            .filter(relation => relation.id_acao === acaoId)
            .forEach(relation => {
              relation.naturezas.forEach(natureza => {
                if (natureza.id_natureza === naturezaId && natureza.categoria && natureza.categoria.id_categoria === categoriaId && natureza.categoria.subcategoria && natureza.categoria.subcategoria.id_subcategoria) {
                  if (!subcategoriaGroups.has(natureza.categoria.subcategoria.id_subcategoria)) {
                    subcategoriaGroups.set(natureza.categoria.subcategoria.id_subcategoria, new Set());
                    subcategoriaSeverityMap.set(natureza.categoria.subcategoria.id_subcategoria, new Map());
                  }
                  subcategoriaGroups.get(natureza.categoria.subcategoria.id_subcategoria)!.add(relation.id_risco);
                  subcategoriaSeverityMap.get(natureza.categoria.subcategoria.id_subcategoria)!.set(relation.id_risco, relation.severidade);
                }
              });
            });
          
          // Create subcategoria nodes
          const subcategoriaNodes: HierarchicalSeverityNode[] = [];
          
          subcategoriaGroups.forEach((riskIds, subcategoriaId) => {
            const severities = subcategoriaSeverityMap.get(subcategoriaId)!;
            const totalSeverity = Array.from(severities.values()).reduce((sum, severity) => sum + severity, 0);
            const avgSeverity = riskIds.size > 0 ? Number((totalSeverity / riskIds.size).toFixed(2)) : 0;
            
            const subcategoria = riskRelations
              .flatMap(r => r.naturezas)
              .flatMap(n => n.categoria)
              .flatMap(c => c?.subcategoria)
              .find(s => s && s.id_subcategoria === subcategoriaId)!;
            
            const subcategoriaNode: HierarchicalSeverityNode = {
              id: `subcategoria-${subcategoriaId}`,
              label: subcategoria.desc_subcategoria,
              level: HierarchicalLevel.SUBCATEGORIA,
              avg_severity: avgSeverity,
              risk_count: riskIds.size,
              parent_id: `categoria-${categoriaId}`,
              original_id: subcategoriaId,
              children: []
            };
            allNodes.push(subcategoriaNode);
            subcategoriaNodes.push(subcategoriaNode);
          });
          
          // Link subcategoria nodes to categoria node
          categoriaNode.children = subcategoriaNodes;
        });
        
        // Link categoria nodes to natureza node
        naturezaNode.children = categoriaNodes;
      });
      
      // Link natureza nodes to action node
      actionNode.children = naturezaNodes;
    });
    
    // Link action nodes to root node
    rootNode.children = actionNodes;
    
    return {
      root: rootNode,
      allNodes,
      totalRisks: uniqueRisks.size,
      overallAverageSeverity: overallAverage
    };
  };

  useEffect(() => {
    fetchHierarchicalSeverityData();
  }, []);

  const memoizedRefetch = useCallback(fetchHierarchicalSeverityData, []);

  return {
    data,
    loading,
    error,
    refetch: memoizedRefetch
  };
};