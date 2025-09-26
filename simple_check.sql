-- Consulta simples para verificar o subprocesso específico
SELECT 
    s.id,
    s.subprocesso,
    s.id_processo,
    p.processo,
    p.id_macroprocesso,
    m.macroprocesso
FROM "013_subprocessos" s
LEFT JOIN "005_processos" p ON s.id_processo = p.id
LEFT JOIN "004_macroprocessos" m ON p.id_macroprocesso = m.id
WHERE s.id = '1fb553a9-2426-4fa4-a7dc-8ce87a55225b';