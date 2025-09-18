-- Script para adicionar roles de customer aos clientes importados da base NAURU
-- Data: $(date)

-- Adicionar role 'customer' para todos os clientes da base NAURU
INSERT INTO partner_roles (partner_id, role)
SELECT 
    p.id,
    'customer'
FROM partners p
WHERE p.name IN (
    'ROSEANE POINHO DE OLIVEIRA',
    'IMM FABRICAÇÃO DE GELO E COMÉRCIO DE PRODUTOS ALIMENTÍCIOS LTDA',
    'PEDRO ELIAS DE SOUZA',
    'MEGAMED DISTRIBUIDORA DE PRODUTOS HOSPITALARES LTDA',
    'WINSTON NEY DE SEIXAS SANTOS',
    'JUDÁ BEN HUR ROCHA SAMPAIO',
    'ISRAEL S DE CARVALHO (CARVALHO ENGENHARIA)'
)
AND NOT EXISTS (
    SELECT 1 FROM partner_roles pr 
    WHERE pr.partner_id = p.id AND pr.role = 'customer'
);

-- Verificar se os roles foram adicionados
SELECT 
    p.name,
    pr.role,
    p.created_at
FROM partners p
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
