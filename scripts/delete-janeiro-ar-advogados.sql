-- Remove registros de janeiro do segmento AR ADVOGADOS para poder subir os dados de novo.
-- Execute no Supabase: SQL Editor. Ajuste o ano (2026) se precisar.
--
-- DIAGNÓSTICO: Rode primeiro para ver o nome exato do segmento e se há documentos.
SELECT s.id AS segment_id, s.name AS segment_name,
  COUNT(fd.id) AS total_docs,
  MIN(fd.issue_date) AS primeira_data,
  MAX(fd.issue_date) AS ultima_data
FROM segments s
LEFT JOIN financial_documents fd ON fd.segment_id = s.id AND (fd.is_deleted IS NOT TRUE)
WHERE s.name ILIKE '%advogados%'
GROUP BY s.id, s.name;

-- BLOCO 1: Quantos registros de janeiro/2026 serão removidos.
SELECT COUNT(*) AS total_a_remover
FROM financial_documents fd
JOIN segments s ON s.id = fd.segment_id
WHERE (s.name ILIKE '%AR%ADVOGADOS%' OR s.name ILIKE 'ARN ADVOGADOS')
  AND fd.issue_date >= '2026-01-01'
  AND fd.issue_date <= '2026-01-31'
  AND (fd.is_deleted IS NOT TRUE);

-- BLOCO 2: Depois de conferir, rode só este DELETE para remover.
DELETE FROM financial_documents
WHERE segment_id IN (
  SELECT id FROM segments
  WHERE name ILIKE '%AR%ADVOGADOS%' OR name ILIKE 'ARN ADVOGADOS'
)
AND issue_date >= '2026-01-01'
AND issue_date <= '2026-01-31'
AND (is_deleted IS NOT TRUE);
