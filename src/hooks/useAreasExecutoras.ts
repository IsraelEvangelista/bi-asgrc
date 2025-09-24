import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface AreaExecutora {
  id: string;
  sigla_area: string;
  nome_area?: string;
}

export const useAreasExecutoras = () => {
  const [areas, setAreas] = useState<AreaExecutora[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar áreas da tabela 003_areas_gerencias
        const { data: areasData, error: areasError } = await supabase
          .from('003_areas_gerencias')
          .select('id, sigla_area')
          .order('sigla_area');

        if (areasError) {
          console.error('Erro ao buscar áreas da tabela 003:', areasError.message);
          throw new Error(`Não foi possível carregar as áreas executoras: ${areasError.message}`);
        }

        if (areasData && areasData.length > 0) {
          // Converter para o formato esperado
          const processedAreas: AreaExecutora[] = areasData.map(area => ({
            id: area.id,
            sigla_area: area.sigla_area,
            nome_area: area.sigla_area
          }));
          
          setAreas(processedAreas);
        } else {
          // Fallback: buscar IDs de áreas das ações existentes
          const { data: actionsData, error: actionsError } = await supabase
            .from('009_acoes')
            .select('area_executora')
            .not('area_executora', 'is', null)
            .limit(100);
          
          if (actionsError) {
            throw new Error('Nenhuma área encontrada');
          }
          
          // Extrair IDs únicos de area_executora
          const uniqueAreaIds = new Set<string>();
          actionsData?.forEach(action => {
            if (Array.isArray(action.area_executora)) {
              action.area_executora.forEach(id => {
                if (id) uniqueAreaIds.add(id.toString());
              });
            }
          });
          
          if (uniqueAreaIds.size === 0) {
            throw new Error('Nenhuma área encontrada');
          }
          
          // Tentar buscar os dados das áreas pelos IDs encontrados
          const idsArray = Array.from(uniqueAreaIds);
          const { data: areasByIds, error: areasByIdsError } = await supabase
            .from('003_areas_gerencias')
            .select('id, sigla_area')
            .in('id', idsArray);
          
          if (areasByIdsError || !areasByIds || areasByIds.length === 0) {
            // Criar áreas genéricas com base nos IDs encontrados
            const fallbackAreas: AreaExecutora[] = idsArray.map(id => ({
              id: id,
              sigla_area: `AREA_${id}`,
              nome_area: `AREA_${id}` 
            }));
            setAreas(fallbackAreas);
          } else {
            const processedAreasByIds = areasByIds.map(area => ({
              ...area,
              nome_area: area.sigla_area
            }));
            setAreas(processedAreasByIds);
          }
        }
        
      } catch (err) {
        console.error('Erro ao carregar áreas executoras:', err);
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        
        // Áreas mockadas como último fallback
        const mockAreas: AreaExecutora[] = [
          { id: '1', sigla_area: 'TI', nome_area: 'TI' },
          { id: '2', sigla_area: 'RH', nome_area: 'RH' },
          { id: '3', sigla_area: 'FIN', nome_area: 'FIN' },
          { id: '4', sigla_area: 'OPE', nome_area: 'OPE' },
          { id: '5', sigla_area: 'AUD', nome_area: 'AUD' },
        ];
        setAreas(mockAreas);
      } finally {
        setLoading(false);
      }
    };

    fetchAreas();
  }, []);

  return { areas, loading, error };
};