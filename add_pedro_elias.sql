-- Script para adicionar o PEDRO ELIAS DE SOUZA que faltou na importação
-- Data: $(date)

-- Inserir PEDRO ELIAS DE SOUZA
INSERT INTO partners (
    name,
    tipo_pessoa,
    tax_id,
    email,
    phone,
    address,
    city,
    state,
    status,
    created_at,
    updated_at
) VALUES (
    'PEDRO ELIAS DE SOUZA',
    'pf',
    '249.711.032-87',
    NULL,
    NULL,
    'Cond. Salvador Dali, nº 60, Torre B - Adrianópolis',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
);

-- Adicionar role de customer
INSERT INTO partner_roles (partner_id, role)
SELECT 
    p.id,
    'customer'
FROM partners p
WHERE p.name = 'PEDRO ELIAS DE SOUZA'
AND NOT EXISTS (
    SELECT 1 FROM partner_roles pr 
    WHERE pr.partner_id = p.id AND pr.role = 'customer'
);

-- Verificar se foi adicionado
SELECT 
    p.name,
    p.tax_id,
    pr.role,
    p.created_at
FROM partners p
LEFT JOIN partner_roles pr ON p.id = pr.partner_id
WHERE p.name = 'PEDRO ELIAS DE SOUZA';
