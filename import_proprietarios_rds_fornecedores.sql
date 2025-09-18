-- Script para importação dos PROPRIETÁRIOS como FORNECEDORES da RDS IMOBILIÁRIA
-- Data: $(date)
-- Total de proprietários: 7

-- Inserir PROPRIETÁRIOS como FORNECEDORES na tabela partners
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
) VALUES 
-- PROPRIETÁRIOS (Locadores)
-- 1. RHEMA NEGÓCIOS IMOBILIÁRIOS LTDA
(
    'RHEMA NEGÓCIOS IMOBILIÁRIOS LTDA',
    'pj',
    '55.518.933/0001-67',
    NULL,
    NULL,
    'Rua Raul Brandão, nº17, Compensa',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 2. SPAZZIO GESTÃO E ADMINISTRAÇÃO LTDA
(
    'SPAZZIO GESTÃO E ADMINISTRAÇÃO LTDA',
    'pj',
    '40.170.291/0001-80',
    NULL,
    NULL,
    'Rua Ayres de Almeida, nº18, São Francisco',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 3. E.M RODRIGUES
(
    'E.M RODRIGUES',
    'pj',
    '44.005.614/0001-31',
    NULL,
    NULL,
    'Rua Manjerioba, nº1, Jorge Teixeira',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 4. RDS PLACE NEGÓCIOS IMOBILIÁRIOS E ADMINISTRADORES LTDA
(
    'RDS PLACE NEGÓCIOS IMOBILIÁRIOS E ADMINISTRADORES LTDA',
    'pj',
    '52.841.370/0001-55',
    NULL,
    NULL,
    'Rua Salvador, nº440, Ed. Soberane, sala 610, 6º andar, Adrianópolis',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 5. CHARLES ALBERTE DE ALMEIDA SANTOS ME (ÓTICA OFICINA DOS ÓCULOS)
(
    'CHARLES ALBERTE DE ALMEIDA SANTOS ME (ÓTICA OFICINA DOS ÓCULOS)',
    'pj',
    '84.126.598/0001-50',
    NULL,
    NULL,
    'Rua Rui Barbosa, nº122',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 6. CLÁUDIA TEIXEIRA BRASIL
(
    'CLÁUDIA TEIXEIRA BRASIL',
    'pf',
    '572.881.432-87',
    NULL,
    NULL,
    'Avenida Jacira Reis, nº 700, São Jorge',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
),

-- 7. VERA LÚCIA FERREIRA QUEIROZ
(
    'VERA LÚCIA FERREIRA QUEIROZ',
    'pf',
    '043.488.852-49',
    NULL,
    NULL,
    'Av. Joaquim Nabuco, nº2157, Centro',
    'Manaus',
    'AM',
    'active',
    NOW(),
    NOW()
);

-- Adicionar roles de SUPPLIER para todos os proprietários
INSERT INTO partner_roles (partner_id, role)
SELECT 
    p.id,
    'supplier'
FROM partners p
WHERE p.name IN (
    'RHEMA NEGÓCIOS IMOBILIÁRIOS LTDA',
    'SPAZZIO GESTÃO E ADMINISTRAÇÃO LTDA',
    'E.M RODRIGUES',
    'RDS PLACE NEGÓCIOS IMOBILIÁRIOS E ADMINISTRADORES LTDA',
    'CHARLES ALBERTE DE ALMEIDA SANTOS ME (ÓTICA OFICINA DOS ÓCULOS)',
    'CLÁUDIA TEIXEIRA BRASIL',
    'VERA LÚCIA FERREIRA QUEIROZ'
)
AND NOT EXISTS (
    SELECT 1 FROM partner_roles pr 
    WHERE pr.partner_id = p.id AND pr.role = 'supplier'
);

-- Atualizar segment_id para RDS IMOBILIÁRIO
UPDATE partners 
SET segment_id = 'f5c2e105-4c05-4bbd-947a-575cf8877936'
WHERE name IN (
    'RHEMA NEGÓCIOS IMOBILIÁRIOS LTDA',
    'SPAZZIO GESTÃO E ADMINISTRAÇÃO LTDA',
    'E.M RODRIGUES',
    'RDS PLACE NEGÓCIOS IMOBILIÁRIOS E ADMINISTRADORES LTDA',
    'CHARLES ALBERTE DE ALMEIDA SANTOS ME (ÓTICA OFICINA DOS ÓCULOS)',
    'CLÁUDIA TEIXEIRA BRASIL',
    'VERA LÚCIA FERREIRA QUEIROZ'
);

-- Verificar quantos proprietários foram inseridos
SELECT COUNT(*) as total_proprietarios_inseridos FROM partners WHERE created_at >= NOW() - INTERVAL '1 minute';

-- Listar os proprietários inseridos
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
    'RHEMA NEGÓCIOS IMOBILIÁRIOS LTDA',
    'SPAZZIO GESTÃO E ADMINISTRAÇÃO LTDA',
    'E.M RODRIGUES',
    'RDS PLACE NEGÓCIOS IMOBILIÁRIOS E ADMINISTRADORES LTDA',
    'CHARLES ALBERTE DE ALMEIDA SANTOS ME (ÓTICA OFICINA DOS ÓCULOS)',
    'CLÁUDIA TEIXEIRA BRASIL',
    'VERA LÚCIA FERREIRA QUEIROZ'
)
ORDER BY p.name;
