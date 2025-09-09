-- Consulta para verificar dados de situacao_risco
SELECT 
  situacao_risco,
  COUNT(DISTINCT id_risco) as total_riscos
FROM "015_riscos_x_acoes_proc_trab" 
WHERE situacao_risco IS NOT NULL
GROUP BY situacao_risco
ORDER BY total_riscos DESC;

-- Verificar alguns registros da tabela
SELECT 
  id_risco,
  situacao_risco,
  nivel_risco,
  resposta_risco
FROM "015_riscos_x_acoes_proc_trab" 
WHERE situacao_risco IS NOT NULL
LIMIT 10;