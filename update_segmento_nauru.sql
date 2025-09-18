-- Script para atualizar o segmento de todos os clientes da base NAURU
-- Data: $(date)

-- Atualizar segment_id para NAURU para todos os clientes da base
UPDATE partners 
SET segment_id = '68a2c101-4c01-4b1f-b5a2-18468df86b26'
WHERE name IN (
    'ROSEANE POINHO DE OLIVEIRA',
    'IMM FABRICAÇÃO DE GELO E COMÉRCIO DE PRODUTOS ALIMENTÍCIOS LTDA',
    'PEDRO ELIAS DE SOUZA',
    'MEGAMED DISTRIBUIDORA DE PRODUTOS HOSPITALARES LTDA',
    'WINSTON NEY DE SEIXAS SANTOS',
    'JUDÁ BEN HUR ROCHA SAMPAIO',
    'ISRAEL S DE CARVALHO (CARVALHO ENGENHARIA)'
);

-- Verificar quantos clientes foram atualizados
SELECT COUNT(*) as clientes_atualizados 
FROM partners 
WHERE segment_id = '68a2c101-4c01-4b1f-b5a2-18468df86b26'
AND name IN (
    'ROSEANE POINHO DE OLIVEIRA',
    'IMM FABRICAÇÃO DE GELO E COMÉRCIO DE PRODUTOS ALIMENTÍCIOS LTDA',
    'PEDRO ELIAS DE SOUZA',
    'MEGAMED DISTRIBUIDORA DE PRODUTOS HOSPITALARES LTDA',
    'WINSTON NEY DE SEIXAS SANTOS',
    'JUDÁ BEN HUR ROCHA SAMPAIO',
    'ISRAEL S DE CARVALHO (CARVALHO ENGENHARIA)'
);

-- Listar os clientes com o segmento atualizado
SELECT 
    p.name,
    p.tipo_pessoa,
    p.tax_id,
    s.name as segmento,
    pr.role
FROM partners p
LEFT JOIN segments s ON p.segment_id = s.id
LEFT JOIN partner_roles pr ON p.id = pr.partner_id
WHERE p.name IN (
    'ROSEANE POINHO DE OLIVEIRA',
    'IMM FABRICAÇÃO DE GELO E COMÉRCIO DE PRODUTOS ALIMENTÍCIOS LTDA',
    'PEDRO ELIAS DE SOUZA',
    'MEGAMED DISTRIBUIDORA DE PRODUTOS HOSPITALARES LTDA',
    'WINSTON NEY DE SEIXAS SANTOS',
    'JUDÁ BEN HUR ROCHA SAMPAIO',
    'ISRAEL S DE CARVALHO (CARVALHO ENGENHARIA)'
)
ORDER BY p.name;
