-- Migração 033: Criar função para buscar indicadores por status das ações
-- Data: 2025-01-27
-- Descrição: Função que implementa a query correta para contar indicadores por status das ações

-- Criar função para buscar indicadores agrupados por status das ações
CREATE OR REPLACE FUNCTION get_indicators_by_status()
RETURNS TABLE (
  status TEXT,
  qtd_indicadores BIGINT
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    a.status, 
    COUNT(DISTINCT i.id) AS qtd_indicadores 
  FROM "009_acoes" a 
  JOIN "016_rel_acoes_riscos" rar ON rar.id_acao = a.id
  JOIN "006_matriz_riscos" r ON r.id = rar.id_risco
  JOIN "008_indicadores" i ON i.id_risco = r.id 
  JOIN "019_historico_indicadores" h ON h.id_indicador = i.id 
  WHERE a.status IS NOT NULL  -- Filtrar status nulos
  GROUP BY a.status 
  ORDER BY qtd_indicadores DESC;
$$;

-- Conceder permissões para a função
GRANT EXECUTE ON FUNCTION get_indicators_by_status() TO anon;
GRANT EXECUTE ON FUNCTION get_indicators_by_status() TO authenticated;

-- Comentário da função
COMMENT ON FUNCTION get_indicators_by_status() IS 'Retorna a contagem de indicadores agrupados por status das ações de implementação, filtrando valores nulos';